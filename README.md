# COVID-Watch Cloud Functions

This repo contains code which is used in the Firebase project to control the Firestore security rules, and define cloud functions.

## TODO

- [x] TypeScript Build System
- [x] Initial Test Suite
- [x] Validate Survey Data
- [x] Initial Survey Endpoint
- [x] Write to Firestore
- [x] Verify TCN Cryptographic Hashes
- [ ] Implement AG Protocol endpoint
- [ ] Add Secure Permission Number System
- [ ] Add watcher to auto build .ts to .js
- [ ] Agree on API / Response Payloads
- [ ] Cache Reads in Buckets

## Setup

- VSCode
- Prettier Code Formatter
  - Make default formatter and format on save
- Node 10+
- Firebase CLI
- Postman

### Firebase CLI

Install the Firebase CLI tools using:

```
$ npm install -g firebase-tools
```

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

Run with debug logging enabled to see console.logs

```
$ DEBUG_LOGGING=1; firebase emulators:start
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

### TCN Submit Report

http://localhost:5001/covidwatch-354ce/us-central1/submitReport

Example Report JSON Payload:

```json
{
  "temporary_contact_key_bytes": "PvLGpfQZgGqnoQRtSr0AHd8J5/WdKwaJNLRCkhGlgHU=",
  "memo_data": "SGVsbG8sIFdvcmxkIQ==",
  "memo_type": 1,
  "start_index": 1,
  "end_index": 8,
  "signature_bytes": "+k7HDsVZPY5Pxcz0cpwVBvDOHrrQ0+AyDVL/MbGkXBYG2WAyoqLaNxFuXiB9rSzkdCesDv1NSSk06hrjx2YABA==",
  "report_verification_public_key_bytes": "v78liBBYQrFXqOH6YydUD1aGpXLMgruKATAjFZ0ycLk="
}
```

### AG Submit Diagnosis

This endpoint is for submitting the Apple / Google format diagnosis payload.
http://localhost:5001/covidwatch-354ce/us-central1/submitDiagnosis

## Firebase Security

The Firestore reads and writes are all disabled except for reading of the TCN signed_reports.
If you want to read from the emulator you can send the following header to override the security with the bearer token "owner"

```
curl --location \
  --request GET 'http://localhost:8080/v1/projects/covidwatch-354ce/databases/(default)/documents/diagnosis_permission_number' \
  --header 'Authorization: Bearer owner'
```

## Firestore Emulator REST API

You can query the Firestore API with urls like this:
http://localhost:8080/v1/projects/covidwatch-354ce/databases/(default)/documents/signed_reports

_NB_ Be aware that the firestore.rules will affect your access to these Emulator endpoints.

```
$ curl --location --request GET 'http://localhost:8080/v1/projects/covidwatch-354ce/databases/(default)/documents/signed_reports'
```

### Postman Collection

You can import the COVID-Watch.postman_collection.json to play with the local Cloud Functions and Firestore Emulator.

## Deployment

### Cloud Functions

Deploy a single function:

```
$ firebase deploy --only functions:submitReport
$ firebase deploy --only functions:submitDiagnosis
```

Deploy the firestore rules:

```
$ firebase deploy --only firestore:rules
```

## Live URLS

https://us-central1-covidwatch-354ce.cloudfunctions.net/submitReport
https://us-central1-covidwatch-354ce.cloudfunctions.net/submitDiagnosis
https://us-central1-covidwatch-354ce.cloudfunctions.net/fetchDiagnosis
