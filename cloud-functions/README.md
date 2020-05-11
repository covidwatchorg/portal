# Permission Portal Cloud Functions

Cloud functions for the Covid Watch Permission Portal.
Firebase project can be found here:

- [prod](https://console.firebase.google.com/project/permission-portal/)
- [test](https://console.firebase.google.com/project/permission-portal-test/)
- [dev](https://console.firebase.google.com/project/permission-portal-dev/)

In depth discussion of app and data model can be found in [Notion](https://www.notion.so/covidwatch/Org-Admin-App-Technical-Details-f8a235f8cfb44e1d938c731ccfe621cb).

## Testing
1.  Dev mode runs in your personal firebase account. Create your own firebase project
2. export your configurations under the following locations
    a. update your firebase configuration ( Firebase Console => Project => Settings => Website Settings ) in $ROOT/client/src/config/firebase.config.dev.js
3. create a firebase private key under (Firebase Console => Project => Settings => Service Account ) and save the json under
functions/permission-portal-dev-firebase-admin-key.json. It is important to have this file name.

#### Automated Tests

Firebase doesn't support much in the way of testing for Firebase Auth, so because this is an auth-heavy application we are maintaining a parallel implementation of Firebase project for testing [here](https://console.firebase.google.com/project/permission-portal-test/).

This means that in order for tests to run properly, they must be deployed first to the cloud in the right environment. To do so, run:

```
1. firebase deploy --only functions --project=dev
2. firebase deploy --only functions --project=test
3. firebase deploy --only functions --project=prod
```


Once changes are deployed, tests can be run from the `functions/` directory. Tests require a firebase admin key to run properly, stored as `functions/permission-portal-{environment}-firebase-admin-key.json` (ask maintainer for private key of test container).  


Because they are written in Typescript, they must be built first:


```
cd functions
npm run build
npm run test
```

#### Manual Testing

Firebase provides the `firebase functions:shell` and `firebase emulators:start` commands to help with testing locally. However its often more useful to use a repl for the purposes of inspecting objects and iterating on designs. To run a repl that's set up to talk to the [`permission-portal-testing`](https://console.firebase.google.com/project/permission-portal-test/) infrastructure, run `node firebase-repl.js` from the `functions/` directory.

## Deployment

TODO
