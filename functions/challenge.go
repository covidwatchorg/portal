package functions

import (
	"encoding/json"
	"net/http"

	"functions/internal/pow"
	"functions/internal/util"
)

// ChallengeHandler is a handler for the /challenge endpoint.
func ChallengeHandler(w http.ResponseWriter, r *http.Request) {
	ctx, err := util.NewContext(w, r)
	if err != nil {
		return
	}

	if err := util.ValidateRequestMethod(&ctx, "GET", ""); err != nil {
		ctx.WriteStatusError(err)
		return
	}

	c, err := pow.GenerateChallenge(ctx)
	if err != nil {
		ctx.WriteStatusError(util.NewInternalServerError(err))
		return
	}
	json.NewEncoder(w).Encode(c)
}
