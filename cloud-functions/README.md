# Permission Portal Cloud Functions

Cloud functions for the Covid Watch Permission Portal.
Firebase project can be found here:

- [prod](https://console.firebase.google.com/project/permission-portal/)
- [dev](https://console.firebase.google.com/project/permission-portal-dev/)
- [test](https://console.firebase.google.com/project/permission-portal-test/)
- [dev](https://console.firebase.google.com/project/permission-portal-dev/)

In depth discussion of app and data model can be found in [Notion](https://www.notion.so/covidwatch/Org-Admin-App-Technical-Details-f8a235f8cfb44e1d938c731ccfe621cb).

## Setup

1. `npm install` to install dependencies

## Setup your own local environment

2. Local mode runs in your personal firebase account. Create your own firebase project and add a web app to it (Firebase Console => Project => Project Settings => Your Apps => Add app)
   a. create your personal firebase account
   b. update your firebase configuration ( Firebase Console => Project => Project Settings => Your Apps => Firebase Sdk snippet => config ) in config/firebase.config.local.js
   c. Update the `local` field in cloud-functions/.firebaserc to the name of your project
   d. Run `firebase use local` from the cloud-functions directory
   e. Deploy indexes with `firebase deploy --only firestore:indexes --project local` from the cloud-functions directory
3. a. create a firebase private key under (Firebase Console => Project => Settings => Service Account )
   b. save the json under \$ROOT/cloud-functions/functions/permission-portal-local-firebase-admin-key.json.
   NOTE: It is important to have this specific file name because this is how the environment is tied to the firebase secret.
4. Enable email and password sign in (Firebase Console => Project => Sign-in method => Email/Password)
5.

4) In all the below steps , your local environment can be used with environment parameter="local"

## Development

Unfortunately the Firebase emulators don't support many auth features, so because this is an auth heavy application we are running a live dev infrastructure (see link above). Deploy the latest cloud functions to the dev infrastructure by running:

```
firebase deploy --only functions --project=dev
firebase deploy --only firestore:rules --project=dev
```

Once functions are deployed, the dev infrastructure can loaded with some fake sample data by navigating to the `functions/` directory and running:

```
node reset-dev-infrastructure.js
```

This script can be run repeatedly to clear out the dev infrastructure and reset it with only the sample data. However try to be mindful of other developers working with the same infrastructure, and check with them before resetting.

## Testing

#### Automated Tests

Firebase doesn't support much in the way of testing for Firebase Auth, so because this is an auth-heavy application we are maintaining a parallel implementation of Firebase project for testing [here](https://console.firebase.google.com/project/permission-portal-test/).

This means that in order for tests to run properly, they must be deployed first to the cloud in the right environment. To do so, run:

```
firebase deploy --only functions --project=test
firebase deploy --only firestore:rules --project=test
## use the below commands to deploy in other environments

firebase deploy --only functions --project=<dev/local/prod>
firebase deploy --only firestore:rules --project=<dev/local/prod>
```

Once changes are deployed, tests can be run from the `functions/` directory. Tests require a firebase admin key to run properly, stored as `functions/permission-portal-{environment}-firebase-admin-key.json` (ask maintainer for private key of test container). To test in your local environment

Because they are written in Typescript, they must be built first:

```
cd functions
npm run build
npm run test:dev ## shortcut to run tests against dev

## to run against other environments
npm run test:<local> ## run tests against local

## run tests against any environment
NODE_ENV=<dev/local/test/prod> npm run test
```

#### Manual Testing

Firebase provides the `firebase functions:shell` and `firebase emulators:start` commands to help with testing locally. However its often more useful to use a repl for the purposes of inspecting objects and iterating on designs. To run a repl that's set up to talk to the [`permission-portal-testing`](https://console.firebase.google.com/project/permission-portal-test/) infrastructure, run `node firebase-repl.js` from the `functions/` directory.

## Deployment

TODO
