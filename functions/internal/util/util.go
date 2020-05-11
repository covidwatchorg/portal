package util

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Context is a context.Context that provides extra utilities for common
// operations.
type Context struct {
	resp   http.ResponseWriter
	req    *http.Request
	client *firestore.Client

	context.Context
}

// NewContext constructs a new Context from an http.ResponseWriter and an
// *http.Request. If an error occurs, NewContext takes care of writing an
// appropriate response to w, and logs the error using log.Printf.
func NewContext(w http.ResponseWriter, r *http.Request) (Context, error) {
	ctx := r.Context()
	// In production, automatically detect credentials from the environment.
	projectID := firestore.DetectProjectID
	if os.Getenv("FIRESTORE_EMULATOR_HOST") != "" {
		// If we're not in production, then `firestore.DetectProjectID` will
		// cause `NewClient` to look for credentials which aren't there, and so
		// the call will fail.
		projectID = "test"
	}
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		err := NewInternalServerError(err)
		writeStatusError(w, r, err)
		return Context{}, err
	}

	return Context{w, r, client, ctx}, nil
}

// HTTPRequest returns the *http.Request that was used to construct this
// Context.
func (c *Context) HTTPRequest() *http.Request {
	return c.req
}

// HTTPResponseWriter returns the http.ResponseWriter that was used to construct
// this Context.
func (c *Context) HTTPResponseWriter() http.ResponseWriter {
	return c.resp
}

// FirestoreClient returns the firestore Client.
func (c *Context) FirestoreClient() *firestore.Client {
	return c.client
}

func writeStatusError(w http.ResponseWriter, r *http.Request, err StatusError) {
	type response struct {
		Message string `json:"message"`
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(err.HTTPStatusCode())
	json.NewEncoder(w).Encode(response{Message: err.Message()})

	log.Printf("[%v %v %v]: responding with error code %v and message \"%v\"",
		r.RemoteAddr, r.Method, r.URL, err.HTTPStatusCode(), err.Message())
}

// WriteStatusError writes err to c.HTTPResponseWriter(), and logs it using
// log.Printf.
func (c *Context) WriteStatusError(err StatusError) {
	writeStatusError(c.resp, c.req, err)
}

// ValidateRequestMethod validates that ctx.HTTPRequest().Method == method, and
// if not, returns an appropriate StatusError.
func ValidateRequestMethod(ctx *Context, method, err string) StatusError {
	m := ctx.HTTPRequest().Method
	if m != method {
		return NewMethodNotAllowedError(m)
	}
	return nil
}

// StatusError is implemented by error types which correspond to a particular
// HTTP status code.
type StatusError interface {
	error

	// HTTPStatusCode returns the HTTP status code for this error.
	HTTPStatusCode() int
	// Message returns a string which will be used as the contents of the
	// "message" field in the JSON object which is sent as the response body.
	Message() string
}

type statusError struct {
	code int
	// If message is non-empty, then Message will return it. Otherwise, Message
	// will return error.Error().
	message string
	error
}

func (e statusError) HTTPStatusCode() int {
	return e.code
}

func (e statusError) Message() string {
	if e.message != "" {
		return e.message
	}
	return e.error.Error()
}

// NewInternalServerError wraps err in a StatusError whose HTTPStatusCode method
// returns http.StatusInternalServerError and whose Message method returns
// "internal server error" to avoid leaking potentially sensitive data from err.
func NewInternalServerError(err error) StatusError {
	return statusError{
		code: http.StatusInternalServerError,
		// We don't want to leak any potentially sensitive data that might be
		// contained in the error. This message will be sent to the client
		// instead of err.Error().
		message: "internal server error",
		error:   err,
	}
}

// NewBadRequestError wraps err in a StatusError whose HTTPStatusCode method
// returns http.StatusBadRequest and whose Message method returns err.Error().
func NewBadRequestError(err error) StatusError {
	return statusError{
		code:  http.StatusBadRequest,
		error: err,
	}
}

// NewMethodNotAllowedError wraps err in a StatusError whose HTTPStatusCode
// method returns http.StatusMethodNotAllowed and whose Message method returns
// "unsupported method: " followed by the given method string.
func NewMethodNotAllowedError(method string) StatusError {
	return statusError{
		code:  http.StatusMethodNotAllowed,
		error: fmt.Errorf("unsupported method: %v", method),
	}
}

var (
	notFoundError = NewBadRequestError(errors.New("not found"))
)

// FirestoreToStatusError converts an error returned from the
// "cloud.google.com/go/firestore" package to a StatusError.
func FirestoreToStatusError(err error) StatusError {
	if status.Code(err) == codes.NotFound {
		return notFoundError
	}

	return NewInternalServerError(err)
}

// JSONToStatusError converts an error returned from the "encoding/json" package
// to a StatusError. It assumes that all error types defined in the
// "encoding/json" package and io.EOF are bad request errors and all others are
// internal server errors.
func JSONToStatusError(err error) StatusError {
	switch err := err.(type) {
	case *json.MarshalerError, *json.SyntaxError, *json.UnmarshalFieldError,
		*json.UnmarshalTypeError, *json.UnsupportedTypeError, *json.UnsupportedValueError:
		return NewBadRequestError(err)
	default:
		if err == io.EOF {
			return NewBadRequestError(err)
		}
		return NewInternalServerError(err)
	}
}

// ReadCryptoRandBytes fills b with cryptographically random bytes from the
// "crypto/rand" package. It always fills all of b.
func ReadCryptoRandBytes(b []byte) {
	_, err := rand.Read(b)
	if err != nil {
		panic(fmt.Errorf("could not read random bytes: %v", err))
	}
}
