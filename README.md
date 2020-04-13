# COVID-Watch Cloud Functions

This repo contains code which is used in the Firebase project to control the Firestore security rules, and define cloud functions.

## TODO

- [x] TypeScript Build System
- [x] Initial Test Suite
- [ ] Agree on API / Response Payloads
- [ ] Initial Survey Endpoint
- [ ] Validate Survey Data
- [ ] Write to Firestore
- [ ] Verify Cryptographic Hashes
- [ ] Cache Reads in Buckets

## Setup

- VSCode
- Prettier Code Formatter
- Node 10+
- Firestore CLI

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
