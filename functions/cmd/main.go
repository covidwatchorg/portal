package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"functions"
	"functions/internal/util"

	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
)

func main() {
	funcframework.RegisterHTTPFunction("/challenge", makeHTTPHandler(functions.ChallengeHandler))
	// Use PORT environment variable, or default to 8080.
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	fmt.Println("Listening port:", port)
	if err := funcframework.Start(port); err != nil {
		log.Fatalf("funcframework.Start: %v\n", err)
	}
}

func makeHTTPHandler(handler func(ctx *util.Context) util.StatusError) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, err := util.NewContext(w, r)
		if err != nil {
			writeStatusError(w, r, err)
			return
		}

		if err := handler(&ctx); err != nil {
			writeStatusError(w, r, err)
		}
	}
}

func writeStatusError(w http.ResponseWriter, r *http.Request, err util.StatusError) {
	type response struct {
		Message string `json:"message"`
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(err.HTTPStatusCode())
	json.NewEncoder(w).Encode(response{Message: err.Message()})

	log.Printf("[%v %v %v]: responding with error code %v and message \"%v\"",
		r.RemoteAddr, r.Method, r.URL, err.HTTPStatusCode(), err.Message())
}
