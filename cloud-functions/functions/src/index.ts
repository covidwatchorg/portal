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

// Cloud function for creating new users. Allows admins to create new non-admin users.
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

// Called every time a new user is created in Firebase Auth
// Because its not possible to turn off user creation in Firebase Auth, this cloud function has been
// designed to delete any new user that hasn't been pre-authorized in our `users` collection.
// This means that the only way to create a new user is to call the createUser cloud function (as an admin),
// or to set the user up manually in the Firebase console by first creating a properly formatted entry in
// the `users` collection and then adding the user manually in the Authentication tab.
export const onCreate = functions.auth.user().onCreate((firebaseAuthUser) => {
  // Check that user info corresponding to this email address is in the `users` collection
  return db
    .doc('users/' + firebaseAuthUser.email)
    .get()
    .then((covidWatchUser) => {
      if (covidWatchUser.exists) {
        // `users` entry exists
        if (
          covidWatchUser.data()?.isSuperAdmin === undefined ||
          covidWatchUser.data()?.isAdmin === undefined ||
          covidWatchUser.data()?.organization === undefined
        ) {
          // If that user is not properly formatted in the users collection, delete them from auth and users collection
          // delete from auth
          console.log();
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
          // delete from users collection
          covidWatchUser.ref.delete().catch((err) => {
            console.error(err);
          });
        } else {
          // User has been properly pre-registered in `users` collection, update the `users` entry with
          // their automatically generated UID and set custom claims in their token
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
        }
      } else {
        // User has not been properly pre-registered in `users` collection, delete this user from Firebase Auth
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
