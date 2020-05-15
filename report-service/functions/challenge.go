package functions

import (
	"encoding/json"

	"report.functions/internal/pow"
	"report.functions/internal/util"
)

// ChallengeHandler is a handler for the /challenge endpoint.
var ChallengeHandler = util.MakeHTTPHandler(challengeHandler)

func challengeHandler(ctx *util.Context) util.StatusError {
	if err := util.ValidateRequestMethod(ctx, "GET", ""); err != nil {
		return err
	}

	c, err := pow.GenerateChallenge(ctx)
	if err != nil {
		return util.NewInternalServerError(err)
	}
	json.NewEncoder(ctx.HTTPResponseWriter()).Encode(c)

	return nil
}
