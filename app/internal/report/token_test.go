package report

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewToken(t *testing.T) {
	type testCase struct {
		id    uint64
		key   uint16
		token uint64
	}

	cases := []testCase{
		{0, 0, 0},
		{1, 1, 0x201},
		{0x7FFFFFFFFFFFFF, 0x1FF, 0xFFFFFFFFFFFFFFFF},
	}

	for _, c := range cases {
		assert.Equal(t, UploadToken{token: c.token}, newUploadToken(c.id, c.key))
	}

	panicCases := []testCase{
		// id is 2^55
		{0x80000000000000, 0, 0},
		// key is 2^9
		{0, 0x200, 0},
	}

	for _, c := range panicCases {
		assert.PanicsWithValue(t, "newToken: invalid key or id", func() { newUploadToken(c.id, c.key) })
	}
}

func TestTokenFormatParse(t *testing.T) {
	// For each of the first 2^16 token values, ensure that parsing is the
	// inverse of formatting.
	for i := uint64(0); i < 1<<16; i++ {
		t0 := UploadToken{token: i}
		s := t0.String()
		t1, err := parseUploadToken(s)
		assert.Nil(t, err)
		assert.Equal(t, t0, t1)
	}
}

type tokenTestCase struct {
	token  UploadToken
	format string
}

var tokenTestCases = []tokenTestCase{
	{UploadToken{token: 0}, "09"},
	{UploadToken{token: 1}, "19"},
	{UploadToken{token: 8}, "109"},
	{UploadToken{token: 64}, "100-9"},
	{UploadToken{token: 512}, "100-09"},
	{UploadToken{token: 32768}, "100-000-9"},
	{UploadToken{token: 1<<64 - 1}, "177-777-777-777-777-777-777-79"},
}

func TestTokenFormat(t *testing.T) {
	for _, c := range tokenTestCases {
		assert.Equal(t, c.format, c.token.String())
	}
}

func TestTokenParse(t *testing.T) {
	// Unlike tokenTestCases, these test cases are only valid in the parsing
	// direction.
	cases := []tokenTestCase{
		{UploadToken{token: 0}, "--0--9--"},
		{UploadToken{token: 1<<64 - 1}, "17777777777777777777779"},
	}

	for _, c := range append(cases, tokenTestCases...) {
		tok, err := parseUploadToken(c.format)
		assert.Nil(t, err)
		assert.Equal(t, c.token, tok)
	}

	type errorTestCase struct {
		format string
		err    error
	}

	errCases := []errorTestCase{
		{"9", tokenParseError},
		{"", tokenParseError},
	}

	for _, c := range errCases {
		tok, err := parseUploadToken(c.format)
		assert.Equal(t, tok, UploadToken{token: 0})
		assert.Equal(t, err, c.err)
	}
}
