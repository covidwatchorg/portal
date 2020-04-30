// import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions';

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
  // Checking that the user is authenticated.
  // From the context, we can get the UserID. Then in a Firestore schema, we can
  // index Organizations/Roles by UserID, and grant/reject data access based on
  // our needs.

  // TODO: Stuff for when the user is properly authenticated.

  // This is thrown if user is not authenticated
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called ' +
            'while authenticated.');
  }
})
