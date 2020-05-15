![CI master](https://github.com/covid19risk/covidwatch-cloud-functions/workflows/CI%20master/badge.svg)
![Built with GO](https://img.shields.io/badge/go-1.13%7C1.14-blue.svg)
[![Stop COVID-19](https://img.shields.io/badge/stop-covid--19-red.svg)](https://www.covid-watch.org/)

# Covid Watch Upload Token Service

The Upload Token Service is a service which allows the Covid Watch phone app to
upload reports, and allows users of the permission portal to validate those
reports.

## Setup

1. Install [Go](https://golang.org/) 1.13 or higher
2. [Install the Google Cloud SDK](https://cloud.google.com/sdk/install).
3. Tests use the Firestore emulator, which requires some components from the
   Google Cloud SDK which are not installed by default. In order to install
   them, run the emulator once using `gcloud beta emulators firestore start`. It
   will prompt to install any missing components. Once all the necessary
   components have been installed and the emulator is actually running, you can
   kill it.

## Run Tests

The following will run all unit tests:

```text
$ cd functions
$ go test ./...
```

## Run Locally

The service can be run locally using the Firestore emulator. First, start the
emulator:

```text
$ gcloud beta emulators firestore start --host-port=locahost:8081
```

In another terminal, run the service. Use the `FIRESTORE_EMULATOR_HOST`
environment variable to instruct the service where to find the emulator.

```text
$ cd functions
$ export FIRESTORE_EMULATOR_HOST=localhost:8081
$ go run ./cmd
```

By default, the service will listen for incoming HTTP requests on port 8080. You
can choose a custom port by setting the `PORT` environment variable.

### Randomized Emulator Port

The emulator may fail to start if the port specified with the `--host-port` flag
is already in use. This can happen if you have recently killed the emulator, as
the kernel will reserve the port for some time (for the curious, it does this in
order to prevent network traffic destined for old TCP connections to arrive at
the new one and cause confusion).

If the `--host-port` flag is omitted, the emulator will choose a random port,
which has a high likelihood of not being in use. The emulator will output which
address to use by displaying a line like `export FIRESTORE_EMULATOR_HOST=::1:8195`.

Note that, if the local IP address is an IPv6 address (like `::1`), then you
will need to put square brackets around the address for compatibility with Go's
parsing. In this example, that would look like `export
FIRESTORE_EMULATOR_HOST=[::1]:8195`.

## Local Endpoints

You can hit the endpoints with curl or Postman.

Try:

```
curl --request GET 'http://localhost:8080/challenge' \
     --header 'X-Forwarded-Proto: https'
```

### HTTPS

The local dev server uses HTTP so you must send a fake HTTPS header to prevent the
request from being rejected.

If you see an error message like this with HTTP Code 426:

```
{"Error":"Please use HTTPS"}
```

You should add either:

```
X-Forwarded-Proto: https
```

or

```
Forwarded: for=\"localhost\";proto=https
```

## Firebase Security

Unauthenticated Firestore access is disabled. If you want to bypass the firestore.rules
on the emulator REST interface just supply the auth bearer header value "owner":

```
Authorization: Bearer owner
```

## Deployment

You can deploy the functions with:

```
$ ./deploy.sh
```

### Postman Collection

You can import the COVID-Watch.postman_collection.json to play with the local
Cloud Functions and Firestore Emulator.
