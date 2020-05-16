package pow

import (
	"encoding/json"
	"math/rand"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidate(t *testing.T) {
	testCases := []string{
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"15b59b443d8c662473e1534189e46f17"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"9e0a70133103679d45095d214d068e05"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"9fcb507b5dd857bb52f9026d647b3312"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"02f9a1d73a3d5dc00a42200002f52172"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"1b1161ff9ec79eb9b478ba937beb36d5"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"e8d746216d05a1b3027183de1a721b81"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"e1a7bba7f5dc93815184cfa07c6fdaee"}}`,
		`{"challenge":{"nonce":"0e0e6fd368aac433f4b59ce218233385","work_factor":1024},"solution":{"nonce":"a7f9f4f8053f6744d92eedca01c6577a"}}`,
	}

	for _, c := range testCases {
		var cs ChallengeSolution
		assert.Nil(t, json.Unmarshal([]byte(c), &cs))
		assert.Nil(t, validateSolution(cs.Challenge, cs.Solution))
	}
}

// On a 2018 MacBook Pro, this takes ~930us per validation.
func BenchmarkValidate(b *testing.B) {
	c := generateChallenge(defaultWorkFactor)
	var s Solution
	for {
		_, err := rand.Read(s.inner.Nonce[:])
		assert.Nil(b, err)
		if validateSolution(c, s) == nil {
			break
		}
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		assert.Nil(b, validateSolution(c, s))
	}
}

// On a 2018 MacBook Pro, this takes ~1100ns per validation.
func BenchmarkGenerate(b *testing.B) {
	for i := 0; i < b.N; i++ {
		generateChallenge(defaultWorkFactor)
	}
}
