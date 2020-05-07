package main

import (
	"log"
	"os"

	"app"

	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
)

func main() {
	funcframework.RegisterHTTPFunction("/challenge", app.ChallengeHandler)
	// Use PORT environment variable, or default to 8080.
	port := "8088"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	if err := funcframework.Start(port); err != nil {
		log.Fatalf("funcframework.Start: %v\n", err)
	}
}
