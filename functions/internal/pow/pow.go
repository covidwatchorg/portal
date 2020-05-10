// Package pow provides a proof of work-based rate limiter.
//
// The design of this algorithm is described in detail here:
// https://www.notion.so/covidwatch/Proof-of-Work-Design-1a17cfed3ff74092996c5c4373be71c6
package pow

import (
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"golang.org/x/crypto/argon2"

	"functions/internal/util"
)

const (
	nonceLen = 16
	keyLen   = 8

	// Allow challenges to remain valid for one minute to allow for slow
	// connections. We may need to increase this if we find that there's a tail
	// of clients whose connections are bad enough that this is too short.
	expirationPeriod  = 60 * time.Second
	defaultWorkFactor = 1024

	// The name of the Firestore collection of challenges.
	challengeCollection = "challenges"

	// Argon2id parameters
	argonTime    = 1    // Perform one iteration
	argonMemory  = 1024 // Use 1MB of memory
	argonThreads = 1    // Use one thread
)

var (
	challengeExpiredError = util.NewBadRequestError(errors.New("proof of work challenge expired"))
	invalidSolutionError  = util.NewBadRequestError(errors.New("invalid solution to proof of work challenge"))
)

type nonce [nonceLen]byte

func (n nonce) MarshalJSON() ([]byte, error) {
	return json.Marshal(hex.EncodeToString(n[:]))
}

func (n *nonce) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	bytes, err := hex.DecodeString(s)
	if err != nil {
		return err
	}

	if len(bytes) != nonceLen {
		return errors.New("invalid nonce length")
	}

	copy(n[:], bytes)
	return nil
}

// Challenge is a proof of work challenge.
type Challenge struct {
	inner challenge
}

// Get the Firestore document ID for this challenge.
func (c Challenge) docID() string {
	// We encode both the nonce and the work factor. This allows us an easy way
	// to verify that the work factor that we are provided by the client is
	// actually valid (if it were not, then no challenge with this ID would
	// exist in the database). If we didn't do this, then we would need some
	// other mechanism of validating that the provided work factor is correct.
	// We need to validate the work factor because, if we didn't, the client
	// could simply provide a work factor of 1 and do minimal work.
	return fmt.Sprintf("%X:%d", c.inner.Nonce[:], c.inner.WorkFactor)
}

type challenge struct {
	Nonce      nonce  `json:"nonce"`
	WorkFactor uint64 `json:"work_factor"`
}

func (c *Challenge) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, &c.inner)
}

func (c Challenge) MarshalJSON() ([]byte, error) {
	return json.Marshal(&c.inner)
}

// Solution is a solution to a proof of work challenge.
type Solution struct {
	inner solution
}

type solution struct {
	Nonce nonce `json:"nonce"`
}

func (s *Solution) UnmarshalJSON(b []byte) error {
	return json.Unmarshal(b, &s.inner)
}

func (s Solution) MarshalJSON() ([]byte, error) {
	return json.Marshal(&s.inner)
}

// ChallengeSolution is a pair of a challenge and a solution. It is intended for
// embedding in other objects which are serialized and deserialized to and from
// JSON.
type ChallengeSolution struct {
	Challenge Challenge `json:"challenge"`
	Solution  Solution  `json:"solution"`
}

func generateChallenge(workFactor uint64) Challenge {
	var nonce nonce
	util.ReadCryptoRandBytes(nonce[:])
	return Challenge{challenge{nonce, workFactor}}
}

func validateSolution(c Challenge, s Solution) util.StatusError {
	// Unfortunately, Argon2d is not exposed, and probably never will be. [1] We
	// want the GPU-resistance properties of Argon2d, so it's best to settle for
	// Argon2id, which is as safe as Argon2d, but slower.
	//
	// [1] https://github.com/golang/go/issues/23602
	res := binary.BigEndian.Uint64(argon2.IDKey(s.inner.Nonce[:], c.inner.Nonce[:], argonTime, argonMemory, argonThreads, keyLen))
	if res%c.inner.WorkFactor != 0 {
		return invalidSolutionError
	}
	return nil
}

// The document stored in Firebase for a given challenge. Its ID is given by
// Challenge.docID.
type challengeDoc struct {
	Expiration time.Time
}

// GenerateChallenge generates a new challenge and stores it in the database.
func GenerateChallenge(ctx util.Context) (*Challenge, error) {
	c := generateChallenge(defaultWorkFactor)

	doc := challengeDoc{Expiration: time.Now().Add(expirationPeriod)}
	_, err := ctx.FirestoreClient().Collection(challengeCollection).Doc(c.docID()).Create(ctx, doc)
	if err != nil {
		return nil, err
	}

	return &c, nil
}

// ValidateSolution validates a challenge solution. In particular, it validates
// that:
//  - The challenge is one which we previously generated
//  - The challenge has not expired
//  - The solution is valid
//
// If the challenge is found in the database, it is deleted so that it cannot be
// reused.
func ValidateSolution(ctx *util.Context, cs *ChallengeSolution) util.StatusError {
	doc := ctx.FirestoreClient().Collection(challengeCollection).Doc(cs.Challenge.docID())
	snapshot, err := doc.Get(ctx)
	if err != nil {
		return util.FirestoreToStatusError(err)
	}

	var challengeDoc challengeDoc
	if err = snapshot.DataTo(&challengeDoc); err != nil {
		return util.FirestoreToStatusError(err)
	}

	// Delete the document before we validate. It's important that
	// ValidateSolution never returns nil if the document hasn't been deleted,
	// or it would allow a client to re-use the same challenge. It's technically
	// unnecessary to delete the document if we return an error, but we do it
	// anyway because:
	// - It's simpler (and thus less bug-prone)
	// - It could only happen due to a failed challenge (in which case the
	//   client is buggy) or an expired challenge (in which case the challenge
	//   should be deleted from the database anyway)
	if _, err = doc.Delete(ctx); err != nil {
		return util.FirestoreToStatusError(err)
	}

	now := time.Now()
	if challengeDoc.Expiration.Before(now) {
		return challengeExpiredError
	}

	return validateSolution(cs.Challenge, cs.Solution)
}
