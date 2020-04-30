import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize firebse admin and get db instance
admin.initializeApp();
const db = admin.firestore();

// Throw error if user is not authenticated
function authGuard(context: functions.https.CallableContext): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!context.auth) {
      resolve();
      // Throwing an HttpsError so that the client gets the error details.
      //   reject(new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.'));
    }
    resolve();
  });
}

// Throw error if user is not an admin
function isAdminGuard(context: functions.https.CallableContext): Promise<void> {
  const email = context.auth?.token.email;
  return authGuard(context).then(() =>
    db
      .doc('users/' + email)
      .get()
      .then((userDocumentData) => {
        if (!userDocumentData.get('isAdmin')) {
          throw new functions.https.HttpsError('failed-precondition', 'The function must be called by an admin.');
        }
      })
  );
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// functions.https.onCall is an https "Callable function". From the
// documentation:
// - With callables, Firebase Authentication and FCM tokens, when available, are
// automatically included in requests.
// - The functions.https.onCall trigger automatically deserializes the request
// body and validates auth tokens.
// https://firebase.google.com/docs/functions/callable
export const helloWorld = functions.https.onCall((data, context) => {
  return authGuard(context).then(() => {
    return { text: 'hello world!' };
  });
});

// createUser('f')
export const createUser = functions.https.onCall((data, context) => {
  return isAdminGuard(context).then(() => {
    return { text: 'create user' };
  });
});
