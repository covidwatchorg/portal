package report

import (
	"errors"
	"fmt"
	"strings"
)

// On the design of the upload token (see [1] for more details):
//
// When un-verified reports are uploaded, they are first placed in the database
// in a pending state. An "upload token" is generated and displayed to the user.
// The user conveys this token to the contact tracer (over the phone, email,
// etc), and once the contact tracer has verified the user's diagnosis, they
// enter the token into their web portal, marking the report as verified.
//
// We have the following design goals for the token:
// - Each token must be unique.
// - Tokens must be as short as possible in their encoded form to aid in
//   usability.
// - It should be unlikely for a token to be verified by accident. There are
//   two ways that this can happen: a human error can result in an
//   incorrect-but-valid token from being input, or an expired token can be
//   re-allocated, and a contact tracer can verify a user using the old, expired
//   token.
//
// Given these goals, we design tokens with the following properties:
// - In order to allow tokens to be encoded using as few characters as possible,
//   they are allocated as close to 0 as possible.
// - In order to accomodate non-native speakers, for whom letters can be
//   difficult to pronounce, tokens are encoded in octal.
// - In order to minimize the likelihood that an incorrectly-input token will
//   be a different but still valid token, we add a 9-bit random key to each
//   token; this key must match in order for two tokens to be considered equal.
//   Note that this also minimizes the likelihood of accidental verification
//   due to an expired token being used since it's unlikely that the same token
//   will be allocated with the same key.
// - Since tokens are variable-length, without modification, it would be
//   ambiguous when somebody is done speaking a token out loud. In order to
//   eliminate ambiguity, we suffix each encoded token with the digit 9, which
//   is not a valid octal character, and so can only appear at the end of the
//   token.
//
// [1]
// https://www.notion.so/covidwatch/Upload-Token-Design-f8566186489e40529c017cdb3356c1b9

type UploadToken struct {
	// The token. The leading 64 - 9 = 55 bits are the ID which identifies a
	// document in the database. This ID is chosen to be the numerically
	// smallest ID which is currently available. The remaining 9 bits are the
	// key, which is generated randomly, and is used to reduce the likelihood
	// that human error will result in a report being mistakenly verified.
	token uint64
}

// newUploadToken constructs a new UploadToken from the given id and key. id must not have
// more than its lower 55 bits set, and key must not have more than its lower 9
// bits set. If either of these conditions are violated, newToken will panic.
func newUploadToken(id uint64, key uint16) UploadToken {
	const (
		idMask  uint64 = 1<<55 - 1
		keyMask uint16 = 1<<9 - 1
	)

	if id & ^idMask != 0 || key & ^keyMask != 0 {
		panic("newToken: invalid key or id")
	}

	return UploadToken{token: id<<9 | uint64(key)}
}

// id returns the 55-bit ID from the token.
func (t UploadToken) id() uint64 {
	return t.token >> 9
}

// idString returns a string representation of the 55-bit ID from the
// UploadToken which can be used as the ID of the document in the database.
func (t UploadToken) idString() string {
	return fmt.Sprintf("%X", t.id())
}

// key returns the 9-bit key from the UploadToken.
func (t UploadToken) key() uint16 {
	return uint16(t.token & 0x1FF)
}

func (t UploadToken) String() string {
	str := fmt.Sprintf("%o9", t.token)

	// We need at most 22 characters for the octal encoding of a uin64 plus 1
	// character for the trailing 9 for a total of 23 characters. That results
	// in at most 8 groups of 3 characters, separated by at most 7 dashes. Thus,
	// the scratch space must be 23 + 7 = 30 bytes long. However, we also write
	// a trailing dash (which is later removed), so for that we add an extra
	// byte.
	var scratch [31]byte
	s := scratch[:]

	written := 0
	for len(str) > 0 {
		// Chomp at most 3 characters.
		chomp := 3
		if len(str) < 3 {
			chomp = len(str)
		}

		copy(s, str[:chomp])
		// Unconditionally write a dash. This avoids a branch in the loop, and
		// it's trivial to discard it off after the loop has finished.
		s[chomp] = '-'
		written += chomp + 1

		str = str[chomp:]
		s = s[chomp+1:]
	}

	// Discard the trailing dash.
	return string(scratch[:written-1])
}

var tokenParseError = errors.New("malformed upload token")

func parseUploadToken(s string) (UploadToken, error) {
	s = strings.ReplaceAll(s, "-", "")
	if !strings.HasSuffix(s, "9") {
		return UploadToken{}, tokenParseError
	}

	var t UploadToken
	if _, err := fmt.Sscanf(s, "%o", &t.token); err != nil {
		return UploadToken{}, tokenParseError
	}
	return t, nil
}
