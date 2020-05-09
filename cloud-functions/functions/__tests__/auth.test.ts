import * as firebase from 'firebase/app';
import * as admin from 'firebase-admin';
// Add the Firebase services that you want to use
// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/functions';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/firestore';

jest.setTimeout(60000);

// Initialize client SDK
const firebaseConfig =
  process.env.NODE_ENV === 'development'
    ? {
        apiKey: 'AIzaSyAKbS8JEe1UVSZdaJfN4RnsRFPE7Tb-YpM',
        authDomain: 'permission-portal-dev.firebaseapp.com',
        databaseURL: 'https://permission-portal-dev.firebaseio.com',
        projectId: 'permission-portal-dev',
        storageBucket: 'permission-portal-dev.appspot.com',
        messagingSenderId: '885750041965',
        appId: '1:885750041965:web:14133265537c686c1dde64',
      }
    : {
        apiKey: 'AIzaSyAHVZXO-wFnGmUIBLxF6-mY3tuleK4ENVo',
        authDomain: 'permission-portal-test.firebaseapp.com',
        databaseURL: 'https://permission-portal-test.firebaseio.com',
        projectId: 'permission-portal-test',
        storageBucket: 'permission-portal-test.appspot.com',
        messagingSenderId: '1090782248577',
        appId: '1:1090782248577:web:184d481f492cfa4edc1780',
      };
firebase.initializeApp(firebaseConfig);

// Initialize admin SDK
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
    : require('../../permission-portal-test-firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    process.env.NODE_ENV === 'development'
      ? 'https://permission-portal-dev.firebaseio.com'
      : 'https://permission-portal-test.firebaseio.com',
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

// Variables to track during test runs for easy cleanup at the end.
let goodCorpID: string;
let adminGoodCorpUid: string;
let nonAdminGoodCorpUid: string;
let testuserUid: string;

beforeAll(() => {
  const goodCoorpRef = adminDb.collection('organizations').doc();
  goodCorpID = goodCoorpRef.id;
  return goodCoorpRef
    .set({
      name: 'goodcorp',
    })
    .then(() => {
      return adminDb
        .collection('users')
        .doc('admin@goodcorp.com')
        .set({
          isSuperAdmin: false,
          isAdmin: true,
          organizationID: goodCorpID,
        }) /* Create new user in our Firestore record */
        .then(() => {
          // Create Firebase Auth record of the user
          return adminAuth
            .createUser({
              email: 'admin@goodcorp.com',
              password: 'admin@goodcorp.com',
            })
            .then((adminGoodCorpUserRecord) => {
              return delay(DELAY).then(() => {
                // Delay to allow for onCreate to boot up some
                adminGoodCorpUid = adminGoodCorpUserRecord.uid;
                return adminDb
                  .collection('users')
                  .doc('nonadmin@goodcorp.com')
                  .set({
                    isSuperAdmin: false,
                    isAdmin: false,
                    organizationID: goodCorpID,
                  }) /* Create new user in our Firestore record */
                  .then(() => {
                    // Create Firebase Auth record of the user
                    return adminAuth
                      .createUser({
                        email: 'nonadmin@goodcorp.com',
                        password: 'nonadmin@goodcorp.com',
                      })
                      .then((nonAdminGoodCorpUserRecord) => {
                        return delay(DELAY).then(() => {
                          // Delay to allow for onCreate to boot up some
                          nonAdminGoodCorpUid = nonAdminGoodCorpUserRecord.uid;
                        });
                      });
                  });
              });
            });
        });
    });
});

afterAll(() => {
  return adminAuth
    .deleteUser(adminGoodCorpUid)
    .then(() => {
      return adminAuth
        .deleteUser(nonAdminGoodCorpUid)
        .then(() => {
          return adminDb
            .collection('users')
            .doc('admin@goodcorp.com')
            .delete()
            .then(() => {
              return adminDb
                .collection('users')
                .doc('nonadmin@goodcorp.com')
                .delete()
                .then(() => {
                  return adminDb.collection('organizations').doc(goodCorpID).delete();
                });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

afterEach(() => {
  return (
    adminAuth
      .deleteUser(testuserUid)
      .then(() => {
        return adminDb
          .collection('users')
          .doc('testuser@goodcorp.com')
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
    email: 'testuser@goodcorp.com',
    password: 'testuser@goodcorp.com',
    organizationID: goodCorpID,
  })
    .then((result) => {
      throw new Error("This shouldn't happen!");
    })
    .catch((err) => {
      expect(err.code).toEqual('failed-precondition');
      expect(err.message).toEqual('The function must be called while authenticated.');
    });
});

test('createUser cannot be called by non-admin', () => {
  return clientAuth
    .signInWithEmailAndPassword('nonadmin@goodcorp.com', 'nonadmin@goodcorp.com')
    .then(() => {
      return createUser({
        email: 'testuser@goodcorp.com',
        password: 'testuser@goodcorp.com',
        organizationID: goodCorpID,
      })
        .then((result) => {
          throw new Error("This shouldn't happen!");
        })
        .catch((err) => {
          expect(err.code).toEqual('failed-precondition');
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
    .signInWithEmailAndPassword('admin@goodcorp.com', 'admin@goodcorp.com')
    .then(() => {
      return createUser({
        email: 'nonadmin@goodcorp.com',
        password: 'nonadmin@goodcorp.com',
        organizationID: goodCorpID,
      })
        .then((result) => {
          throw new Error(
            'nonadmin@goodcorp.com should already be in the test database, and the email should not be allowed to be used again!'
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
    .signInWithEmailAndPassword('admin@goodcorp.com', 'admin@goodcorp.com')
    .then(() => {
      return createUser({
        email: 'testuser@goodcorp.com',
        password: 'testuser@goodcorp.com',
        organizationID: goodCorpID,
      })
        .then((result) => result.data)
        .then((userRecord) => {
          testuserUid = userRecord.uid;
          // Check that the endpoint responded with the proper user
          expect(userRecord.email).toEqual('testuser@goodcorp.com');
          // delay for 6 sec to allow functions.auth.user().onCreate to trigger and propagate
          return delay(DELAY).then(() => {
            return clientAuth
              .signInWithEmailAndPassword('testuser@goodcorp.com', 'testuser@goodcorp.com')
              .then(() => {
                // Check that we can sign in with this user
                const currentUser = clientAuth.currentUser;
                if (currentUser === null) {
                  throw new Error('clientAuth.currentUser returned null');
                }
                expect(currentUser.email).toEqual('testuser@goodcorp.com');
                return delay(DELAY).then(() => {
                  return currentUser.getIdTokenResult(true).then((idTokenResult) => {
                    // Check that custom claims are being added properly
                    expect(idTokenResult.claims.isSuperAdmin).toEqual(false);
                    expect(idTokenResult.claims.isAdmin).toEqual(false);
                    expect(idTokenResult.claims.organizationID).toEqual(goodCorpID);
                    // Check that we have a corresponding user in our users collection whose uuid field has been filled out appropriately
                    return clientDb
                      .collection('users')
                      .doc('testuser@goodcorp.com')
                      .get()
                      .then((userSnapshot) => userSnapshot.data())
                      .then((user) => {
                        if (user !== undefined) {
                          // Make sure the users collection uuid was updated with firebase auth uuid
                          expect(user.uuid).toEqual(currentUser.uid);
                        } else {
                          throw new Error("Couldn't find test@email.com in our users collection");
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
  return clientAuth.signInWithEmailAndPassword('admin@goodcorp.com', 'admin@goodcorp.com').then(() => {
    return createUser({
      email: 'testuser@goodcorp.com',
      password: 'testuser@goodcorp.com',
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
  return clientAuth.signInWithEmailAndPassword('admin@goodcorp.com', 'admin@goodcorp.com').then(() => {
    return createUser({
      email: 'testuser@goodcorp.com',
      password: 'testuser@goodcorp.com',
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
    .createUserWithEmailAndPassword('testuser@goodcorp.com', 'testuser@goodcorp.com')
    .then((userCredential) => {
      expect(userCredential.user?.email).toEqual('testuser@goodcorp.com');
      if (userCredential.user) {
        testuserUid = userCredential.user.uid;
      }
      // Give onCreate some time to delete the user
      return delay(DELAY)
        .then(() => {
          return adminDb
            .doc('users/' + 'testuser@goodcorp.com')
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
      .doc('testuser@goodcorp.com')
      .set({
        isAdmin: false,
        isSuperAdmin: false,
        organization: 'This field should be organizationID',
      })
      .then(() => {
        // try to create corresponding user in Firebase auth
        return adminAuth
          .createUser({
            email: 'testuser@goodcorp.com',
            password: 'testuser@goodcorp.com',
          })
          .then(() => {
            // delay to allow onCreate to trigger and realize users table document is faulty
            return delay(DELAY).then(() => {
              // check that user has been deleted from Firebase Auth
              return adminAuth
                .getUserByEmail('testuser@goodcorp.com')
                .then((userRecord) => {
                  throw new Error("Improperly formatted user should have been deleted from Auth but wasn't");
                })
                .catch((err1) => {
                  expect(true).toEqual(true);
                  return adminDb
                    .collection('users')
                    .doc('testuser@goodcorp.com')
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
      .doc('testuser@goodcorp.com')
      .set({
        isAdmin: false,
        isSuperAdmin: false,
        organizationID: "This id doesn't exist",
      })
      .then(() => {
        // try to create corresponding user in Firebase auth
        return adminAuth
          .createUser({
            email: 'testuser@goodcorp.com',
            password: 'testuser@goodcorp.com',
          })
          .then(() => {
            // delay to allow onCreate to trigger and realize users table document is faulty
            return delay(DELAY).then(() => {
              // check that user has been deleted from Firebase Auth
              return adminAuth
                .getUserByEmail('testuser@goodcorp.com')
                .then((userRecord) => {
                  throw new Error(
                    "User with non-existent organizationID should have been deleted from Auth but wasn't"
                  );
                })
                .catch((err1) => {
                  expect(true).toEqual(true);
                  return adminDb
                    .collection('users')
                    .doc('testuser@goodcorp.com')
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
      .doc('testuser@goodcorp.com')
      .set({
        isAdmin: false,
        isSuperAdmin: false,
        organizationID: '',
      })
      .then(() => {
        // try to create corresponding user in Firebase auth
        return adminAuth
          .createUser({
            email: 'testuser@goodcorp.com',
            password: 'testuser@goodcorp.com',
          })
          .then(() => {
            // delay to allow onCreate to trigger and realize users table document is faulty
            return delay(DELAY * 2).then(() => {
              // check that user has been deleted from Firebase Auth
              return adminAuth
                .getUserByEmail('testuser@goodcorp.com')
                .then((userRecord) => {
                  throw new Error(
                    "User with empty string organizationID should have been deleted from Auth but wasn't"
                  );
                })
                .catch((err1) => {
                  expect(true).toEqual(true);
                  return adminDb
                    .collection('users')
                    .doc('testuser@goodcorp.com')
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
