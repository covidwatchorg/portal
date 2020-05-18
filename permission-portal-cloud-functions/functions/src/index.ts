import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';

// Initialize firebse admin and get db instance
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const auth = admin.auth();
// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

// Checks that an entry (or pending entry) to the users table contains the required fields
function isCovidWatchUserProperlyFormatted(covidWatchUser: any): boolean {
  console.log(`checking that ${JSON.stringify(covidWatchUser)} is properly formatted`);
  return (
    typeof covidWatchUser.isAdmin === 'boolean' &&
    typeof covidWatchUser.isSuperAdmin === 'boolean' &&
    typeof covidWatchUser.organizationID === 'string' &&
    typeof covidWatchUser.disabled === 'boolean'
  );
}

function isCreateUserRequestProperlyFormatted(newUser: any): boolean {
  console.log(`checking that createUser request with body ${JSON.stringify(newUser)} is properly formatted`);
  return (
    typeof newUser.email === 'string' &&
    typeof newUser.password === 'string' &&
    typeof newUser.organizationID === 'string'
  );
}

function doesOrganizationExist(organizationID: string): Promise<boolean> {
  return db
    .collection('organizations')
    .doc(organizationID)
    .get()
    .then((document) => {
      return document.exists;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
}

// Deletes user from users table, if an entry exists
function usersCollectionDeleteUser(email: string) {
  db.collection('users')
    .doc(email)
    .get()
    .then((user) => {
      if (user.exists) {
        user.ref.delete().catch((err) => {
          console.error(err);
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

// Deletes user from firebase auth and from users table, if an entry exists
function deleteUser(uid: string) {
  auth
    .getUser(uid)
    .then((userRecord) => {
      const email = userRecord.email;
      auth
        .deleteUser(uid)
        .then(() => {
          usersCollectionDeleteUser(email ? email : '');
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
}

// Throw error if user is not authenticated
function authGuard(context: functions.https.CallableContext): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      reject(new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.'));
    }
    resolve();
  });
}

// Throw error if user is not an admin
function isAdminGuard(context: functions.https.CallableContext): Promise<void> {
  return authGuard(context).then(() => {
    // Force unwrapping warranted, because existence of context.auth is checked by authGuard
    if (context.auth!.token.isAdmin !== true) {
      throw new functions.https.HttpsError('permission-denied', 'The function must be called by an admin.');
    }
  });
}

// Send email to new users instructing them to change their password
function sendNewUserEmail(email: string) {
  auth
    .generatePasswordResetLink(email, {
      // URL you want to redirect back to. The domain (www.example.com) for
      // this URL must be whitelisted in the Firebase Console.
      url: functions.config().client.url,
    })
    .then((pwdResetLink) => {
      const msg = {
        to: email,
        from: 'welcome@covid-watch.org',
        subject: 'Welcome to the Covid Watch Permission Portal',
        html: `
        <p>Welcome to the Covid Watch Permission Portal! For security reasons, as a first step we ask that you set your password by following the link below. If that link has expired by the time you click it, navigate to the Covid Watch Permission Portal login page and follow the 'Forgot password?' link.</p>
        <a href=${pwdResetLink}>Set Password</a>
        `,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log(`Welcome email sent to ${email}`);
        })
        .catch((err) => {
          console.error(JSON.stringify(err));
        });
    })
    .catch((err) => {
      console.error(err);
    });
}

// Cloud function for creating new users. Allows admins to create new non-admin users.
export const createUser = functions.https.onCall((newUser, context) => {
  return new Promise((resolve, reject) => {
    isAdminGuard(context)
      .then(() => {
        // Check that data is formatted properly
        if (!isCreateUserRequestProperlyFormatted(newUser)) {
          reject(
            new functions.https.HttpsError(
              'invalid-argument',
              'user object must have email <string>, password <string>, and organizationID <string> specified'
            )
          );
        }
        doesOrganizationExist(newUser.organizationID)
          .then((doesExist) => {
            if (doesExist) {
              const newUserPrivileges = {
                isAdmin: false,
                isSuperAdmin: false,
                organizationID: newUser.organizationID,
                disabled: false,
              };
              db.collection('users')
                .doc(newUser.email)
                .set(newUserPrivileges) /* Create new user in our Firestore record */
                .then(() => {
                  // Create Firebase Auth record of the user
                  auth
                    .createUser({
                      email: newUser.email,
                      password: newUser.password,
                    })
                    .then((userRecord) => {
                      resolve(userRecord.toJSON());
                    })
                    .catch((err) => {
                      if (err.errorInfo.code === 'auth/email-already-exists') {
                        reject(new functions.https.HttpsError('already-exists', err.errorInfo.message));
                      } else {
                        reject(new functions.https.HttpsError('internal', err.errorInfo.message));
                      }
                    });
                })
                .catch((err) => {
                  reject(err);
                });
            } else {
              reject(
                new functions.https.HttpsError(
                  'invalid-argument',
                  'attempted to sign up user with an organization id that DNE: ' + newUser.organizationID
                )
              );
            }
          })
          .catch((err) => {
            reject(new functions.https.HttpsError('internal', err.errorInfo.message));
          });
      })
      .catch((err) => {
        reject(err);
      });
  }).catch((err) => {
    console.error(err);
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
        const covidWatchUserData = covidWatchUser.data()!;
        // Forced unwrapping warranted because data() only returns undefined if ref.exists is falsey
        if (!isCovidWatchUserProperlyFormatted(covidWatchUserData)) {
          // delete from auth
          console.error(
            `Attempted to register new user, but corresponding entry in the users collection was not properly defined: ${JSON.stringify(
              covidWatchUserData
            )}`
          );
          deleteUser(firebaseAuthUser.uid);
        } else {
          doesOrganizationExist(covidWatchUserData.organizationID)
            .then((doesExist) => {
              if (doesExist) {
                // User has been properly pre-registered in `users` collection, update the `users` entry with
                // their automatically generated UID and set custom claims in their token
                covidWatchUser.ref
                  .update({
                    uuid: firebaseAuthUser.uid,
                  })
                  .then(() => {
                    console.log('user ' + covidWatchUser.id + 'uuid updated to ' + firebaseAuthUser.uid);
                    auth
                      .setCustomUserClaims(firebaseAuthUser.uid, {
                        // Forced unwrapping is warranted, because data integrity is checked above
                        isSuperAdmin: covidWatchUserData.isSuperAdmin,
                        isAdmin: covidWatchUserData.isAdmin,
                        organizationID: covidWatchUserData.organizationID,
                      })
                      .then(() => {
                        console.log(
                          'user ' + covidWatchUser.id + 'isSuperAdmin claim set to ' + covidWatchUserData.isSuperAdmin
                        );
                        console.log('user ' + covidWatchUser.id + 'isAdmin claim set to ' + covidWatchUserData.isAdmin);
                        console.log(
                          'user ' +
                            covidWatchUser.id +
                            'organizationID claim set to ' +
                            covidWatchUserData.organizationID
                        );
                        sendNewUserEmail(firebaseAuthUser.email!);
                        if (typeof covidWatchUserData.disabled === 'boolean') {
                          auth
                            .updateUser(firebaseAuthUser.uid, {
                              disabled: covidWatchUserData.disabled,
                            })
                            .then(() => {
                              console.log(
                                `User ${covidWatchUserData.id}'s disabled flag in Auth updated to ${covidWatchUserData}`
                              );
                            })
                            .catch((err) => {
                              console.error(err);
                            });
                        }
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              } else {
                deleteUser(firebaseAuthUser.uid);
              }
            })
            .catch((err) => {
              console.error(err);
              deleteUser(firebaseAuthUser.uid);
            });
        }
      } else {
        // User has not been properly pre-registered in `users` collection, delete this user from Firebase Auth
        deleteUser(firebaseAuthUser.uid);
      }
    })
    .catch((err) => {
      deleteUser(firebaseAuthUser.uid);
      console.error(err);
      throw err;
    });
});

// Cloud function for validating upload tokens. Naturally this can only be called by an authenticated user.
// This validate calls the report server's /validate endpoint with both the upload token and the user's organization ID.
// The organizationID is taken from the user's authentication token's claims, to ensure that users can only
// ever validate upload tokens corresponding to their own organizations. There should be a system in place
// to ensure that only the server running this function can talk to the report server's /validate.
export const validate = functions.https.onCall((body, context) => {
  return new Promise((resolve, reject) => {
    authGuard(context)
      .then(() => {
        const uploadToken = body.uploadToken;
        // validate request body
        if (typeof uploadToken !== 'string') {
          reject(new functions.https.HttpsError('invalid-argument', 'request body must have uploadToken <string>'));
        }
        fetch(functions.config().token_server.validate_url, {
          method: 'POST',
          body: JSON.stringify({
            upload_token: uploadToken,
            organization_id: context.auth!.token.organizationID,
          }),
        })
          .then((res) => {
            // TODO: set differing responses based on whether token was just validated, or is already valid
            resolve({ message: 'upload_token validated' });
          })
          .catch((err) => {
            // TODO: set response based on /validate's error specification
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
});

// Triggered whenever a user's document in the users/ collection is updated
// This can be used to keep Firebase Auth records in sync with user collection records
export const userOnUpdate = functions.firestore.document('users/{email}').onUpdate((change, context) => {
  const previousValue = change.before.data();
  const newValue = change.after.data();
  const email = context.params.email;

  // Force unwrap ok because document is guaranteed to exist (by definition its being updated)
  if (previousValue!.disabled !== newValue!.disabled) {
    console.log(
      `User.disabled update detected for user ${email}. Value changed from ${previousValue!.disabled} to ${
        newValue!.disabled
      }`
    );
    return auth
      .getUserByEmail(email)
      .then((userRecord) => {
        auth
          .updateUser(userRecord.uid, {
            disabled: newValue!.disabled ? newValue!.disabled : false,
          })
          .then(() => {
            console.log(
              `User ${email}'s disabled flag in Auth updated to ${newValue!.disabled ? newValue!.disabled : false}`
            );
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }
  return new Promise((resolve) => resolve());
});
