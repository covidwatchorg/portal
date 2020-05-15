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
jest.setTimeout(60000);

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
const clientDb = firebase.firestore();
const adminDb = admin.firestore();
const clientAuth = firebase.auth();
const adminAuth = admin.auth();
const clientFunctions = firebase.functions();
const createUser = clientFunctions.httpsCallable('createUser');

// Delay function to deal with Cloud Functions triggers needing time to propagate.
const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
// Milliseconds to delay at certain points in the test suite. Incredibly annoying, but because
// our system relies on the onCreate trigger for various features, we need to provide delays in the tests in order
// to give the trigger time to run.
const DELAY = 10000;

// Taken from permission-portal-test infra
const soylentGreenID: string = 'wV6rYRcd6ujaxiOWb9qa';
// Track so user can be deleted after each test
let testUid: string;
// create random email each run so that concurrent runs of the test suite don't cause conflict
const testUserEmail =
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5) + '@soylentgreen.com';

afterEach(() => {
  return (
    adminAuth
      .deleteUser(testUid)
      .then(() => {
        return adminDb
          .collection('users')
          .doc(testUserEmail)
          .delete()
          .catch((err) => {
            console.log(err);
          });
      })
      // tslint:disable-next-line: no-empty
      .catch((err) => {
        /* suppress expected error */
      })
  );
});

test('createUser cannot be called without being authenticated', () => {
  return createUser({
    email: testUserEmail,
    password: testUserEmail,
    organizationID: soylentGreenID,
  })
    .then((result) => {
      throw new Error("This shouldn't happen!");
    })
    .catch((err) => {
      expect(err.code).toEqual('unauthenticated');
      expect(err.message).toEqual('The function must be called while authenticated.');
    });
});

test('createUser cannot be called by non-admin', () => {
  return clientAuth
    .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com')
    .then(() => {
      return createUser({
        email: testUserEmail,
        password: testUserEmail,
        organizationID: soylentGreenID,
      })
        .then((result) => {
          throw new Error("This shouldn't happen!");
        })
        .catch((err) => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('The function must be called by an admin.');
        });
    })
    .catch((err) => {
      console.log(err);
      throw Error("This shouldn't happen!");
    });
});

test('Email address can only be used once', () => {
  return clientAuth
    .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
    .then(() => {
      return createUser({
        email: 'user@soylentgreen.com',
        password: 'user@soylentgreen.com',
        organizationID: soylentGreenID,
      })
        .then((result) => {
          throw new Error(
            'user@soylentgreen.com should already be in the test database, and the email should not be allowed to be used again!'
          );
        })
        .catch((err) => {
          expect(err.code).toEqual('already-exists');
          expect(err.message).toEqual('The email address is already in use by another account.');
        });
    })
    .catch((err) => {
      throw Error(err);
    });
});

test('createUser works for admins', () => {
  return clientAuth
    .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
    .then(() => {
      return createUser({
        email: testUserEmail,
        password: testUserEmail,
        organizationID: soylentGreenID,
      })
        .then((result) => result.data)
        .then((userRecord) => {
          testUid = userRecord.uid;
          // Check that the endpoint responded with the proper user
          expect(userRecord.email).toEqual(testUserEmail);
          // delay for 6 sec to allow functions.auth.user().onCreate to trigger and propagate
          return delay(DELAY).then(() => {
            return clientAuth
              .signInWithEmailAndPassword(testUserEmail, testUserEmail)
              .then(() => {
                // Check that we can sign in with this user
                const currentUser = clientAuth.currentUser;
                if (currentUser === null) {
                  throw new Error('clientAuth.currentUser returned null');
                }
                expect(currentUser.email).toEqual(testUserEmail);
                return delay(DELAY).then(() => {
                  return currentUser.getIdTokenResult(true).then((idTokenResult) => {
                    // Check that custom claims are being added properly
                    expect(idTokenResult.claims.isSuperAdmin).toEqual(false);
                    expect(idTokenResult.claims.isAdmin).toEqual(false);
                    expect(idTokenResult.claims.organizationID).toEqual(soylentGreenID);
                    // Check that we have a corresponding user in our users collection whose uuid field has been filled out appropriately
                    return clientDb
                      .collection('users')
                      .doc(testUserEmail)
                      .get()
                      .then((userSnapshot) => userSnapshot.data())
                      .then((user) => {
                        if (user !== undefined) {
                          // Make sure the users collection uuid was updated with firebase auth uuid
                          expect(user.uuid).toEqual(currentUser.uid);
                        } else {
                          throw new Error("Couldn't find " + testUserEmail + ' in our users collection');
                        }
                      })
                      .catch((err) => {
                        throw err;
                      });
                  });
                });
              })
              .catch((err) => {
                throw err;
              });
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
});

test('createUser fails if invalid request body', () => {
  return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
    return createUser({
      email: testUserEmail,
      password: testUserEmail,
      organization: 'This field should be organizationID',
    })
      .then((result) => {
        throw new Error('createUser returned a 200 despite improperly formatted request');
      })
      .catch((err) => {
        expect(err.code).toEqual('invalid-argument');
        expect(err.message).toEqual(
          'user object must have email <string>, password <string>, and organizationID <string> specified'
        );
      });
  });
});

test('createUser fails if non-existent organizationID', () => {
  return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
    return createUser({
      email: testUserEmail,
      password: testUserEmail,
      organizationID: "This id doesn't exist",
    })
      .then((result) => {
        throw new Error('createUser returned a 200 despite improperly formatted request');
      })
      .catch((err) => {
        expect(err.code).toEqual('invalid-argument');
        expect(err.message).toEqual(
          "attempted to sign up user with an organization id that DNE: This id doesn't exist"
        );
      });
  });
});

test('Attempting to sign up a user through clientAuth.createUserWithEmailAndPassword and not through createUser endpoint results in the user being deleted', () => {
  return clientAuth
    .createUserWithEmailAndPassword(testUserEmail, testUserEmail)
    .then((userCredential) => {
      expect(userCredential.user?.email).toEqual(testUserEmail);
      if (userCredential.user) {
        testUid = userCredential.user.uid;
      }
      // Give onCreate some time to delete the user
      return delay(DELAY)
        .then(() => {
          return adminDb
            .doc('users/' + testUserEmail)
            .get()
            .then((user) => {
              expect(user.exists).toEqual(false);
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
});

test("Manually added, improperly formatted user in users table can't be signed up", () => {
  return (
    // set faulty document in users table
    adminDb
      .collection('users')
      .doc(testUserEmail)
      .set({
        isAdmin: false,
        isSuperAdmin: false,
        organization: 'This field should be organizationID',
      })
      .then(() => {
        // try to create corresponding user in Firebase auth
        return adminAuth
          .createUser({
            email: testUserEmail,
            password: testUserEmail,
          })
          .then(() => {
            // delay to allow onCreate to trigger and realize users table document is faulty
            return delay(DELAY * 2).then(() => {
              // check that user has been deleted from Firebase Auth
              return adminAuth
                .getUserByEmail(testUserEmail)
                .then((userRecord) => {
                  throw new Error("Improperly formatted user should have been deleted from Auth but wasn't");
                })
                .catch((err1) => {
                  expect(true).toEqual(true);
                  return adminDb
                    .collection('users')
                    .doc(testUserEmail)
                    .get()
                    .then((user) => {
                      expect(user.exists).toEqual(false);
                    })
                    .catch((err2) => {
                      throw err2;
                    });
                });
            });
          });
      })
      .catch((err) => {
        throw err;
      })
  );
});

test("Manually added user in users table with non-existent organizationID can't be signed up", () => {
  return (
    // set faulty document in users table
    adminDb
      .collection('users')
      .doc(testUserEmail)
      .set({
        isAdmin: false,
        isSuperAdmin: false,
        organizationID: "This id doesn't exist",
      })
      .then(() => {
        // try to create corresponding user in Firebase auth
        return adminAuth
          .createUser({
            email: testUserEmail,
            password: testUserEmail,
          })
          .then(() => {
            // delay to allow onCreate to trigger and realize users table document is faulty
            return delay(DELAY * 2).then(() => {
              // check that user has been deleted from Firebase Auth
              return adminAuth
                .getUserByEmail(testUserEmail)
                .then((userRecord) => {
                  throw new Error(
                    "User with non-existent organizationID should have been deleted from Auth but wasn't"
                  );
                })
                .catch((err1) => {
                  expect(true).toEqual(true);
                  return adminDb
                    .collection('users')
                    .doc(testUserEmail)
                    .get()
                    .then((user) => {
                      expect(user.exists).toEqual(false);
                    })
                    .catch((err2) => {
                      throw err2;
                    });
                });
            });
          });
      })
      .catch((err) => {
        throw err;
      })
  );
});

test("Manually added user in users table with empty string organizationID can't be signed up", () => {
  return (
    // set faulty document in users table
    adminDb
      .collection('users')
      .doc(testUserEmail)
      .set({
        isAdmin: false,
        isSuperAdmin: false,
        organizationID: '',
      })
      .then(() => {
        // try to create corresponding user in Firebase auth
        return adminAuth
          .createUser({
            email: testUserEmail,
            password: testUserEmail,
          })
          .then(() => {
            // delay to allow onCreate to trigger and realize users table document is faulty
            return delay(DELAY * 2).then(() => {
              // check that user has been deleted from Firebase Auth
              return adminAuth
                .getUserByEmail(testUserEmail)
                .then((userRecord) => {
                  throw new Error(
                    "User with empty string organizationID should have been deleted from Auth but wasn't"
                  );
                })
                .catch((err1) => {
                  expect(true).toEqual(true);
                  return adminDb
                    .collection('users')
                    .doc(testUserEmail)
                    .get()
                    .then((user) => {
                      expect(user.exists).toEqual(false);
                    })
                    .catch((err2) => {
                      throw err2;
                    });
                });
            });
          });
      })
      .catch((err) => {
        throw err;
      })
  );
});

test('User can be toggled between enabled and disabled', () => {
  return adminDb
    .collection('users')
    .doc('disabled@soylentgreen.com')
    .update({
      disabled: false,
    })
    .then(() => {
      // Delay to allow userOnUpdate time to run
      return delay(DELAY).then(() => {
        return adminAuth.getUserByEmail('disabled@soylentgreen.com').then((userRecordDisabled) => {
          expect(userRecordDisabled.disabled).toBe(false);
          return adminDb
            .collection('users')
            .doc('disabled@soylentgreen.com')
            .update({
              disabled: true,
            })
            .then(() => {
              return delay(DELAY).then(() => {
                return adminAuth.getUserByEmail('disabled@soylentgreen.com').then((userRecordEnabled) => {
                  expect(userRecordEnabled.disabled).toBe(true);
                });
              });
            });
        });
      });
    })
    .catch((err) => {
      throw err;
    });
});
