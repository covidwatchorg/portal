# Permission Portal Cloud Functions

Cloud functions for the Covid Watch Permission Portal.
Firebase project can be found here:

- [prod](https://console.firebase.google.com/project/permission-portal/)
- [test](https://console.firebase.google.com/project/permission-portal-test/)

In depth discussion of app and data model can be found in [Notion](https://www.notion.so/covidwatch/Org-Admin-App-Technical-Details-f8a235f8cfb44e1d938c731ccfe621cb).

## Testing

#### Automated Tests

Firebase doesn't support much in the way of testing for Firebase Auth, so because this is an auth-heavy application we are maintaining a parallel implementation of Firebase project for testing [here](https://console.firebase.google.com/project/permission-portal-test/).

This means that in order for tests to run properly, they must be deployed first to the cloud. To do so, run:

```
firebase deploy --only functions --project=test
```

Once changes are deployed, tests can be run from the `functions/` directory. Tests require a firebase admin key to run properly, stored as `functions/permission-portal-test-firebase-admin-key.json` (ask maintainer). Because they are written in Typescript, they must be built first:

```
cd functions
npm run build
npm run test
```

#### Manual Testing

Firebase provides the `firebase functions:shell` and `firebase emulators:start` commands to help with testing locally. However its often more useful to use a repl for the purposes of inspecting objects and iterating on designs. To run a repl that's set up to talk to the [`permission-portal-testing`](https://console.firebase.google.com/project/permission-portal-test/) infrastructure, run `node firebase-repl.js` from the `functions/` directory.

## Deployment

TODO
