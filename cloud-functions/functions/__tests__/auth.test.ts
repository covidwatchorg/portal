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
const createUser = firebase.functions().httpsCallable('createUser');

// Delay function to deal with Cloud Functions triggers needing time to propagate.
const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

test('createUser cannot be called without being authenticated', () => {
  return createUser({ email: 'test@email.com', password: 'password' })
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
    .signInWithEmailAndPassword('testuser@normaluser.com', 'normaluser')
    .then(() => {
      return createUser({ email: 'test@email.com', password: 'password' })
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
    .signInWithEmailAndPassword('testuser@isadmin.com', 'isadmin')
    .then(() => {
      return createUser({ email: 'testuser@normaluser.com', password: 'password' })
        .then((result) => {
          throw new Error(
            'testuser@normaluser.com should already be in the test database, and the email should not be allowed to be used again!'
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

describe('Scoped to allow for idempotency, need to delete test@email.com after each run', () => {
  afterEach(() => {
    return clientAuth
      .signInWithEmailAndPassword('test@email.com', 'password')
      .then(() => {
        return clientDb
          .collection('users')
          .doc('test@email.com')
          .delete()
          .then(() => {
            const currentUser = clientAuth.currentUser;
            if (currentUser !== null) {
              return currentUser
                .delete()
                .then(() => {})
                .catch((err) => {
                  console.error(err);
                  throw new Error(
                    "test@email.com deletion may have failed, log in to console and ensure it's been deleted manually."
                  );
                });
            } else {
              console.log('currentUser === null');
              return undefined;
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  test('createUser works for admins', () => {
    return clientAuth
      .signInWithEmailAndPassword('testuser@isadmin.com', 'isadmin')
      .then(() => {
        return createUser({ email: 'test@email.com', password: 'password' })
          .then((result) => result.data)
          .then((userRecord) => {
            // Check that the endpoint responded with the proper user
            expect(userRecord.email).toEqual('test@email.com');
            return firebase
              .auth()
              .signInWithEmailAndPassword('test@email.com', 'password')
              .then(() => {
                // Check that we can sign in with this user
                const currentUser = clientAuth.currentUser;
                if (currentUser === null) {
                  throw new Error('clientAuth.currentUser returned null');
                }
                expect(currentUser.email).toEqual('test@email.com');
                // Check that we have a corresponding user in our users collection whose uuid field has been filled out appropriately
                return delay(6000).then(() => {
                  // Was running into issues with this running before onCreate finishes (which updates the uuid), so added the above delay
                  return clientDb
                    .collection('users')
                    .doc('test@email.com')
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
      .createUserWithEmailAndPassword('test@email.com', 'password')
      .then((userCredential) => {
        expect(userCredential.user?.email).toEqual('test@email.com');
        // Give onCreate some time to delete the user
        return delay(6000)
          .then(() => {
            return adminDb
              .doc('users/' + 'test@email.com')
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
        // throw new Error('Firebase error');
      });
  });
});
