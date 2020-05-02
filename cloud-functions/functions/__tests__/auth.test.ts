import * as firebase from 'firebase/app';
// Add the Firebase services that you want to use
// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/functions';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/firestore';

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

const db = firebase.firestore();

jest.setTimeout(60000);
const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

test('createUser cannot be called without being authenticated', () => {
  const createUser = firebase.functions().httpsCallable('createUser');
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
  const createUser = firebase.functions().httpsCallable('createUser');
  return firebase
    .auth()
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
  const createUser = firebase.functions().httpsCallable('createUser');
  return firebase
    .auth()
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
    return firebase
      .auth()
      .signInWithEmailAndPassword('test@email.com', 'password')
      .then(() => {
        return db
          .collection('users')
          .doc('test@email.com')
          .delete()
          .then(() => {
            const currentUser = firebase.auth().currentUser;
            if (currentUser === null) {
              throw new Error(
                "test@email.com deletion may have failed, log in to console and ensure it's been deleted manually."
              );
            } else {
              return currentUser
                .delete()
                .then(() => {})
                .catch((err) => {
                  throw new Error(
                    "test@email.com deletion may have failed, log in to console and ensure it's been deleted manually."
                  );
                });
            }
          })
          .catch((err) => {
            throw new Error(
              "test@email.com deletion may have failed, log in to console and ensure it's been deleted manually."
            );
          });
      })
      .catch((err) => {
        throw new Error(
          "test@email.com deletion may have failed, log in to console and ensure it's been deleted manually."
        );
      });
  });

  test('createUser works for admins', () => {
    const createUser = firebase.functions().httpsCallable('createUser');
    return firebase
      .auth()
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
                const currentUser = firebase.auth().currentUser;
                if (currentUser === null) {
                  throw new Error('firebase.auth().currentUser returned null');
                }
                expect(currentUser.email).toEqual('test@email.com');
                // Check that we have a corresponding user in our users collection whose uuid field has been filled out appropriately
                return db
                  .collection('users')
                  .doc('test@email.com')
                  .get()
                  .then((userSnapshot) => userSnapshot.data())
                  .then((user) => {
                    if (user !== undefined) {
                      // Make sure the users collection uuid was updated with firebase auth uuid
                      // Was running into issues with this running before onCreate finishes (which updates the uuid), so added this delay
                      return delay(2000).then(() => {
                        expect(user.uuid).toEqual(currentUser.uid);
                      });
                    } else {
                      throw new Error("Couldn't find test@email.com in our users collection");
                    }
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
  });
});
