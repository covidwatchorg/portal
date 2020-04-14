# COVID-Watch Cloud Functions

This repo contains code which is used in the Firebase project to control the Firestore security rules, and define cloud functions.

## TODO

- [x] TypeScript Build System
- [x] Initial Test Suite
- [x] Validate Survey Data
- [x] Initial Survey Endpoint
- [x] Write to Firestore
- [ ] Add watcher to auto build .ts to .js
- [ ] Agree on API / Response Payloads
- [ ] Verify Cryptographic Hashes
- [ ] Cache Reads in Buckets

## Setup

- VSCode
- Prettier Code Formatter
- Node 10+
- Firestore CLI
- Postman

## Security Model

The idea is to set reads to be open and public as all data is inherently anonymous. Writes are set to disabled except through a cloud endpoint which does the job validating the cryptographic signatures are valid before writing to the firestore.

See the TCN implementation here:
https://github.com/TCNCoalition/TCN

## NPM Install

```
$ cd functions
$ npm install
```

## Run Firestore Emulators

```
$ firebase emulators:start
```

## Run Tests

```
$ cd functions
$ npm test
```

## Firebase Functions

### TypeScript + Babel

We are using TypeScript and Babel to convert to JS which will run on Node 10 and the Firebase Emulator.

### Build

To convert the .ts files in src into .js files in lib run:

```
$ npm run-script build
```

The emulator should hot reload the scripts.

## Local Endpoints

You can hit the endpoints with curl or Postman.

http://localhost:5001/tagstwo-431e3/us-central1/submitReport

Example Report JSON Payload:

```json
{
  "contact_event_key_bytes": "a",
  "memo_data": "a",
  "memo_type": 1,
  "start_index": 1,
  "end_index": 1,
  "signature_bytes": "a",
  "report_verification_public_key_bytes": "a",
  "timestamp": "2020-04-13"
}
```

## Firestore Emulator REST API

You can query the Firestore API with urls like this:
http://localhost:8080/v1/projects/tagstwo-431e3/databases/(default)/documents/signed_reports

```
$ curl --location --request GET 'http://localhost:8080/v1/projects/tagstwo-431e3/databases/(default)/documents/signed_reports'
```

### Postman Collection

You can import the COVID-Watch.postman_collection.json to play with the local Cloud Functions and Firestore Emulator.

## Deployment

### Cloud Functions

Deploy a single function:

```
$ firebase deploy --only functions:submitReport
```

## Live URLS

https://us-central1-tagstwo-431e3.cloudfunctions.net/submitReport
