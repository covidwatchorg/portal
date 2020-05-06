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
const firebaseConfig = {
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
const serviceAccount = require('../../permission-portal-test-firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://permission-portal-test.firebaseio.com',
});

// Initialize commonly used vars
const clientDb = firebase.firestore();
const adminDb = admin.firestore();
const clientAuth = firebase.auth();
const adminAuth = admin.auth();
const createUser = firebase.functions().httpsCallable('createUser');

// Delay function to deal with Cloud Functions triggers needing time to propagate.
const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

// Save test user's id's for easy deletion at the end
let adminGoodCorpUid: string;
let nonAdminGoodCorpUid: string;

beforeAll(() => {
  return adminDb
    .collection('users')
    .doc('admin@goodcorp.com')
    .set({
      isSuperAdmin: false,
      isAdmin: true,
      organization: 'goodcorp',
    }) /* Create new user in our Firestore record */
    .then(() => {
      // Create Firebase Auth record of the user
      return adminAuth
        .createUser({
          email: 'admin@goodcorp.com',
          password: 'admin@goodcorp.com',
        })
        .then((adminGoodCorpUserRecord) => {
          adminGoodCorpUid = adminGoodCorpUserRecord.uid;
          return adminDb
            .collection('users')
            .doc('nonadmin@goodcorp.com')
            .set({
              isSuperAdmin: false,
              isAdmin: false,
              organization: 'goodcorp',
            }) /* Create new user in our Firestore record */
            .then(() => {
              // Create Firebase Auth record of the user
              return adminAuth
                .createUser({
                  email: 'nonadmin@goodcorp.com',
                  password: 'nonadmin@goodcorp.com',
                })
                .then((nonAdminGoodCorpUserRecord) => {
                  nonAdminGoodCorpUid = nonAdminGoodCorpUserRecord.uid;
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
              return adminDb.collection('users').doc('nonadmin@goodcorp.com').delete();
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

test('createUser cannot be called without being authenticated', () => {
  return createUser({
    email: 'testuser@goodcorp.com',
    password: 'testuser@goodcorp.com',
    organization: 'goodcorp',
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
        organization: 'goodcorp',
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
        organization: 'goodcorp',
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

let testuserUid: string;
describe('Scoped to allow for idempotency, need to delete testuser@goodcorp.com after each run', () => {
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

  test('createUser works for admins', () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@goodcorp.com', 'admin@goodcorp.com')
      .then(() => {
        return createUser({
          email: 'testuser@goodcorp.com',
          password: 'testuser@goodcorp.com',
          organization: 'goodcorp',
        })
          .then((result) => result.data)
          .then((userRecord) => {
            testuserUid = userRecord.uid;
            // Check that the endpoint responded with the proper user
            expect(userRecord.email).toEqual('testuser@goodcorp.com');
            // delay for 6 sec to allow functions.auth.user().onCreate to trigger and propagate
            return delay(6000).then(() => {
              return clientAuth
                .signInWithEmailAndPassword('testuser@goodcorp.com', 'testuser@goodcorp.com')
                .then(() => {
                  // Check that we can sign in with this user
                  const currentUser = clientAuth.currentUser;
                  if (currentUser === null) {
                    throw new Error('clientAuth.currentUser returned null');
                  }
                  expect(currentUser.email).toEqual('testuser@goodcorp.com');
                  return currentUser.getIdTokenResult(true).then((idTokenResult) => {
                    // Check that custom claims are being added properly
                    expect(idTokenResult.claims.isSuperAdmin).toEqual(false);
                    expect(idTokenResult.claims.isAdmin).toEqual(false);
                    expect(idTokenResult.claims.organization).toEqual('goodcorp');
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

  test('Attempting to sign up a user through clientAuth.createUserWithEmailAndPassword and not through createUser endpoint results in the user being deleted', () => {
    return clientAuth
      .createUserWithEmailAndPassword('testuser@goodcorp.com', 'testuser@goodcorp.com')
      .then((userCredential) => {
        expect(userCredential.user?.email).toEqual('testuser@goodcorp.com');
        if (userCredential.user) {
          testuserUid = userCredential.user.uid;
        }
        // Give onCreate some time to delete the user
        return delay(6000)
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
});
