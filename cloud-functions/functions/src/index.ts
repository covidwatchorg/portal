import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize firebse admin and get db instance
admin.initializeApp();
const db = admin.firestore();

// Throw error if user is not authenticated
function authGuard(context: functions.https.CallableContext): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      reject(new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.'));
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

// https://firebase.google.com/docs/functions/callable
export const createUser = functions.https.onCall((newUser, context) => {
  return new Promise((resolve, reject) => {
    isAdminGuard(context)
      .then(() => {
        // Check that data is formatted properly
        if (!newUser.email || !newUser.organization) {
          reject(
            new functions.https.HttpsError('invalid-argument', 'user object must have email and organization specified')
          );
        }
        const newUserPrivileges = {
          isAdmin: false,
          isSuperAdmin: false,
          organization: newUser.organization,
        };
        db.collection('users')
          .doc(newUser.email)
          .set(newUserPrivileges) /* Create new user in our Firestore record */
          .then(() => {
            // Create Firebase Auth record of the user
            admin
              .auth()
              .createUser({
                email: newUser.email,
                password: newUser.password,
                emailVerified: false,
                disabled: false,
              })
              .then((userRecord) => {
                resolve(userRecord.toJSON());
              })
              .catch((err) => {
                console.error(err);
                if (err.errorInfo.code === 'auth/email-already-exists') {
                  reject(new functions.https.HttpsError('already-exists', err.errorInfo.message));
                } else {
                  reject(new functions.https.HttpsError('internal', err.errorInfo.message));
                }
              });
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  }).catch((err) => {
    throw err;
  });
});

// Called every time a new user is created.
// Because its not possible to turn off user creation in Firebase Auth, we are going to prevent
// random users from being created by having clients call the auth-protected createUser,
// create our own record in our 'users' collection, and then wire up this trigger to either accept or reject
// the sign up.
export const onCreate = functions.auth.user().onCreate((firebaseAuthUser) => {
  return db
    .doc('users/' + firebaseAuthUser.email)
    .get()
    .then((covidWatchUser) => {
      if (covidWatchUser.exists) {
        // User has been created through auth protected createUser endpoint, update uuid
        covidWatchUser.ref
          .update({
            uuid: firebaseAuthUser.uid,
          })
          .then(() => {
            console.log('user ' + covidWatchUser.id + 'uuid updated to ' + firebaseAuthUser.uid);
            admin
              .auth()
              .setCustomUserClaims(firebaseAuthUser.uid, {
                isSuperAdmin: covidWatchUser.data()?.isSuperAdmin,
                isAdmin: covidWatchUser.data()?.isAdmin,
                organization: covidWatchUser.data()?.organization,
              })
              .then(() => {
                console.log(
                  'user ' + covidWatchUser.id + 'isSuperAdmin claim set to ' + covidWatchUser.data()?.isSuperAdmin
                );
                console.log('user ' + covidWatchUser.id + 'isAdmin claim set to ' + covidWatchUser.data()?.isAdmin);
                console.log(
                  'user ' + covidWatchUser.id + 'organization claim set to ' + covidWatchUser.data()?.organization
                );
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
            throw err;
          });
      } else {
        // Not an authorized user creation, delete this user
        admin
          .auth()
          .deleteUser(firebaseAuthUser.uid)
          .then(() => {
            console.log('Successfully deleted user');
          })
          .catch((err) => {
            // TODO should send us an email to look into this
            console.log('Error deleting user:', err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
});
