import * as firebase from 'firebase/app';
import * as admin from 'firebase-admin';
// Add the Firebase services that you want to use
// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/functions';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/firestore';

const firebaseConfig = require(`../../../../config/firebase.config.test.js`);

firebase.initializeApp(firebaseConfig);
// Initialize admin SDK
const serviceCredentials = `../../permission-portal-test-firebase-admin-key.json`;
const serviceAccount =
  process.env.NODE_ENV === 'ci'
    ? {
        projectId: 'permission-portal-test',
        privateKey:
          '-----BEGIN PRIVATE KEY-----\n' +
          process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') +
          '\n-----END PRIVATE KEY-----\n',
        clientEmail: 'firebase-adminsdk-nqxd8@permission-portal-test.iam.gserviceaccount.com',
      }
    : require(serviceCredentials);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL,
});

// Initialize commonly used vars
export const clientDb = firebase.firestore();
export const adminDb = admin.firestore();
export const clientAuth = firebase.auth();
export const adminAuth = admin.auth();
export const createUser = firebase.functions().httpsCallable('createUser');

// Delay function to deal with Cloud Functions triggers needing time to propagate.
export const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
// Milliseconds to delay at certain points in the test suite. Incredibly annoying, but because
// our system relies on the onCreate trigger for various features, we need to provide delays in the tests in order
// to give the trigger time to run.
export const DELAY = 10000;

// Taken from permission-portal-test infra
export const soylentGreenID: string = 'wV6rYRcd6ujaxiOWb9qa';
export const initechID: string = 'Y2QXOHIx643m7FceqU5R';
