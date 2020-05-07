module app

// As of this writing, Google Cloud runtime is on 1.13.8 in beta.
go 1.13

require (
	cloud.google.com/go/firestore v1.2.0
	github.com/GoogleCloudPlatform/functions-framework-go v1.0.1
	github.com/stretchr/testify v1.5.1
	golang.org/x/crypto v0.0.0-20200429183012-4b2356b1ed79
	google.golang.org/grpc v1.28.0
)
