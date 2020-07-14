import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';
import { randomBytes } from 'crypto';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import * as toughCookie from 'tough-cookie';
import * as queryString from 'query-string';

// Initialize firebse admin and get db instance
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const auth = admin.auth();
// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

// Enforces the data model for documents in the users table
// If an entry DNE or is improperly formatted, its corresponding entry in Firebase Auth will be deleted
function isCovidWatchUserProperlyFormatted(covidWatchUser: any): boolean {
  console.log(`checking that ${JSON.stringify(covidWatchUser)} is properly formatted`);
  return (
    typeof covidWatchUser.isAdmin === 'boolean' &&
    typeof covidWatchUser.organizationID === 'string' &&
    typeof covidWatchUser.disabled === 'boolean' &&
    typeof covidWatchUser.firstName === 'string' &&
    typeof covidWatchUser.lastName === 'string'
  );
}

function isCreateUserRequestProperlyFormatted(newUser: any): boolean {
  console.log(`checking that createUser request is properly formatted`);
  // password field is optional. If there is no password field, a random password will be generated.
  return (
    typeof newUser.email === 'string' &&
    typeof newUser.firstName === 'string' &&
    typeof newUser.lastName === 'string' &&
    typeof newUser.isAdmin === 'boolean'
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
  return db
    .collection('users')
    .doc(email)
    .get()
    .then((user) => {
      if (user.exists) {
        return user.ref.delete().catch((err) => {
          console.error(err);
          throw err;
        });
      } else {
        throw new Error('Error deleting user from users collection.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}

// Deletes user from firebase auth and from users table, if an entry exists
function deleteUserByUid(uid: string) {
  return auth
    .getUser(uid)
    .then((userRecord) => {
      const email = userRecord.email;
      return auth
        .deleteUser(uid)
        .then(() => {
          return usersCollectionDeleteUser(email ? email : '');
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}

// Sets disabled flag and jwt claims for the Firebase Auth user record, based on its corresponding entry in the
// users table
function syncAuthUserWithCovidWatchUser(email: string) {
  db.collection('users')
    .doc(email)
    .get()
    .then((doc) => {
      const covidWatchUser = doc.data();
      if (covidWatchUser === undefined) throw new Error(`Could not find user in users table with email: ${email}`);
      auth
        .getUserByEmail(email)
        .then((authUser) => {
          auth
            .setCustomUserClaims(authUser.uid, {
              isAdmin: covidWatchUser.isAdmin,
              organizationID: covidWatchUser.organizationID,
            })
            .then(() => {
              console.log('user ' + email + ' isAdmin claim set to ' + covidWatchUser.isAdmin);
              console.log('user ' + email + ' organizationID claim set to ' + covidWatchUser.organizationID);
              auth
                .updateUser(authUser.uid, {
                  disabled: covidWatchUser.disabled,
                })
                .then(() => {
                  console.log(`User ${email}'s disabled flag in Auth updated to ${covidWatchUser.disabled}`);
                })
                .catch((err) => {
                  throw err;
                });
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
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

// Throw error if user is not authenticed or not an admin
function isAdminGuard(context: functions.https.CallableContext): Promise<void> {
  return authGuard(context).then(() => {
    // Force unwrapping warranted, because existence of context.auth is checked by authGuard
    if (context.auth!.token.isAdmin !== true) {
      throw new functions.https.HttpsError('permission-denied', 'The function must be called by an admin.');
    }
  });
}

function generateSignInWithEmailLink(email: string): Promise<string> {
  return auth.generateSignInWithEmailLink(email, {
    url: functions.config().client.url,
    // This must be true.
    handleCodeInApp: true,
  });
}

const EMAILSTYLE = `style="font-family: Montserrat, Arial, Helvetica, sans-serif;font-size:18px;color: #585858;"`;

// Send email to new users instructing them to change their password
function sendNewUserEmail(email: string, password: string, firstName: string, lastName: string) {
  generateSignInWithEmailLink(email)
    .then((link) => {
      const msg = {
        to: email,
        from: 'welcome@covid-watch.org',
        subject: 'Welcome to the Covid Watch Permission Portal',
        html: `
    <!DOCTYPE html>
    <p ${EMAILSTYLE}>${firstName} ${lastName},</p>
    <p ${EMAILSTYLE}>You are receiving this email because you were added as a new member of Covid Watch by the Account Administrator.</p>
    <p ${EMAILSTYLE}><b>Your user name:</b> ${email}<br />  <b>Your temporary password:</b> ${password}</p>
    <p ${EMAILSTYLE}>Please click the following link or copy and paste it into your browser to sign in to your new account:</p>
    <p ${EMAILSTYLE}><a href=${link}>Sign In</a></p>
    <p ${EMAILSTYLE}>If you recieved this message in error, you can safely ignore it.</p>
    <p ${EMAILSTYLE}>You can reply to this message, or email support@covid-watch.org if you have any questions.</p>
    <p ${EMAILSTYLE}>Thank you,<br />Covid Watch Team</p> `,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log(`New user email sent to ${email}`);
        })
        .catch((err) => {
          console.error(JSON.stringify(err));
        });
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}

function sendPasswordRecoveryEmail(email: string) {
  generateSignInWithEmailLink(email)
    .then((link) => {
      const msg = {
        to: email,
        from: 'recovery@covid-watch.org',
        subject: 'Password Recovery Requested',
        html: `
        <!DOCTYPE html>
        <p ${EMAILSTYLE}>You are receiving this message because you requested a password reset for the Covid Watch Portal account associated with this email address.</p>
        <p ${EMAILSTYLE}>Please click the following link or copy and paste it into your browser to reset your account password:</p>   
        <p ${EMAILSTYLE}><a href=${link}>Recover Account</a></p>
        <p ${EMAILSTYLE}>If you received this message in error, you can safely ignore it.</p>
        <p ${EMAILSTYLE}>Thank you,<br />Covid Watch Team</p>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log(`Password recovery email sent to ${email}`);
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
}

// @ts-ignore: TODO remove this once sendPasswordResetEmail is called
function sendPasswordResetEmail(email: string) {
  auth
    .generatePasswordResetLink(email, {
      // URL you want to redirect back to. The domain (www.example.com) for
      // this URL must be whitelisted in the Firebase Console.
      url: functions.config().client.url,
    })
    .then((pwdResetLink) => {
      const msg = {
        to: email,
        from: 'password-reset@covid-watch.org',
        subject: 'Covid Watch Permission Portal password reset',
        html: `
        <p>You are recieving this email because somebody requested a password reset for the account associated with this email address.</p>
        <p>To reset your password, click the link below</p>
        <a href=${pwdResetLink}>Reset Password</a>
        <p>If you recieved this message in error, you can safely ignore it.</p>
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
          reject(new functions.https.HttpsError('invalid-argument', 'Request body is invalidly formatted.'));
        }
        const newUserPrivileges = {
          isAdmin: newUser.isAdmin,
          organizationID: context.auth!.token.organizationID,
          disabled: false,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isFirstTimeUser: true,
        };
        db.collection('users')
          .doc(newUser.email.toLowerCase())
          .set(newUserPrivileges) /* Create new user in our Firestore record */
          .then(() => {
            // If request contains a password field, set that password. If not, generate a random password.
            const password: string = newUser.password ? newUser.password : randomBytes(16).toString('hex');
            // Create Firebase Auth record of the user
            auth
              .createUser({
                email: newUser.email,
                password: password,
              })
              .then((userRecord) => {
                sendNewUserEmail(newUser.email, password, newUser.firstName, newUser.lastName);
                // Create record for user in the userImages collection
                db.collection('userImages')
                  .doc(newUser.email.toLowerCase())
                  .set({ imageBlob: null })
                  .then(() => {
                    resolve(userRecord.toJSON());
                  })
                  .catch((err) => {
                    reject(err);
                  });
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
          deleteUserByUid(firebaseAuthUser.uid).catch((err) => {
            console.error(err);
          });
        } else {
          doesOrganizationExist(covidWatchUserData.organizationID)
            .then((doesExist) => {
              if (doesExist) {
                // User has been properly pre-registered in `users` collection, set custom claims in their token
                syncAuthUserWithCovidWatchUser(covidWatchUser.id);
              } else {
                console.error(
                  `Attempted to create user with organizationID set to ${covidWatchUserData.organizationID}, but that id doesn't exist.`
                );
                deleteUserByUid(firebaseAuthUser.uid).catch((err) => {
                  console.error(err);
                });
              }
            })
            .catch((err) => {
              console.error(err);
              deleteUserByUid(firebaseAuthUser.uid).catch((err1) => {
                console.error(err1);
              });
            });
        }
      } else {
        // User has not been properly pre-registered in `users` collection, delete this user from Firebase Auth
        deleteUserByUid(firebaseAuthUser.uid).catch((err) => {
          console.error(err);
        });
        throw new Error(
          `Attempted to create Firebase Auth user ${firebaseAuthUser.email} but couldn't find corresponding entry in our users collection`
        );
      }
    })
    .catch((err) => {
      deleteUserByUid(firebaseAuthUser.uid).catch((err1) => {
        console.error(err1);
      });
      console.error(err);
      throw err;
    });
});

// Triggered whenever a user's document in the users/ collection is updated
// This can be used to keep Firebase Auth records in sync with user collection records
export const userOnUpdate = functions.firestore.document('users/{email}').onUpdate((change, context) => {
  return new Promise((resolve, reject) => {
    const previousValue = change.before.data();
    const newValue = change.after.data();
    const email = context.params.email;
    console.log(
      `Updating user with email ${email}.\n\nprevious value: ${JSON.stringify(
        previousValue
      )}, new value: ${JSON.stringify(newValue)}`
    );

    // Force unwrap ok because document is guaranteed to exist (by definition its being updated)
    if (
      previousValue!.disabled !== newValue!.disabled ||
      previousValue!.isSuperAdmin !== newValue!.isSuperAdmin ||
      previousValue!.isAdmin !== newValue!.isAdmin ||
      previousValue!.organizationID !== newValue!.organizationID
    ) {
      try {
        syncAuthUserWithCovidWatchUser(email);
      } catch (error) {
        reject(error);
      }
    }
    resolve();
  });
});

export const initiatePasswordRecovery = functions.https.onCall((body) => {
  // tslint:disable-next-line: no-shadowed-variable
  return new Promise((resolve, reject) => {
    db.collection('users')
      .doc(body.email)
      .update({ passwordResetRequested: true })
      .then(() => {
        sendPasswordRecoveryEmail(body.email);
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
});

// issueCodeRequest looks like {testType: "likely", testDate: "2020-07-02"} or {testType: "confirmed", testDate: "2020-07-02"}
export const getVerificationCode = functions.https.onCall(async (issueCodeRequest, context) => {
  return new Promise((resolve, reject) => {
    authGuard(context)
      .then(async () => {
        axiosCookieJarSupport(axios);

        const config = functions.config().verif_server;
        const url = config.url.slice(-1) === '/' ? config.url : config.url + '/';

        const cookieJar = new toughCookie.CookieJar();
        const instance = axios.create({
          jar: cookieJar,
          withCredentials: true,
        });

        try {
          let response = await instance.post(
            'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=' + config.key,
            { email: config.email, password: config.password, returnSecureToken: true }
          );

          const form = { idToken: response.data.idToken };

          // Get CSRF token
          response = await instance.get(url);

          response = await instance.post(url + 'session', queryString.stringify(form), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-CSRF-Token': response.headers['x-csrf-token'],
            },
          });

          response = await instance.get(url + 'home/csrf');
          response = await instance.post(url + 'home/issue', issueCodeRequest, {
            headers: { 'X-CSRF-TOKEN': response.data.csrftoken },
          });
          resolve(response.data.code);
        } catch (err) {
          reject(err);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
});
