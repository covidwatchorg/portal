package util

import (
	"encoding/json"
	"log"
	"net/http"
)

// Handler is a handler for a request to this service. Use MakeHTTPHandler to
// wrap a Handler with the logic necessary to produce a handler which can be
// registered with the "net/http" package.
type Handler = func(ctx *Context) StatusError

// MakeHTTPHandler wraps a Handler, producing a handler which can be registered
// with the "net/http" package. The returned handler is responsible for:
//  - Constructing a *Context
//  - Converting any errors into an HTTP response
func MakeHTTPHandler(handler func(ctx *Context) StatusError) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, err := NewContext(w, r)
		if err != nil {
			writeStatusError(w, r, err)
			return
		}

		if err := handler(&ctx); err != nil {
			writeStatusError(w, r, err)
		}
	}
}

func writeStatusError(w http.ResponseWriter, r *http.Request, err StatusError) {
	type response struct {
		Message string `json:"message"`
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(err.HTTPStatusCode())
	json.NewEncoder(w).Encode(response{Message: err.Message()})

	log.Printf("[%v %v %v]: responding with error code %v and message \"%v\" (error: %v)",
		r.RemoteAddr, r.Method, r.URL, err.HTTPStatusCode(), err.Message(), err)
}
