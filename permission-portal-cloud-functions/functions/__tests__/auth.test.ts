import { adminDb, clientAuth, adminAuth, createUser, delay, DELAY, soylentGreenID } from './config';

jest.setTimeout(60000);

// Track so user can be deleted after each test
let testUid: string;
// create random email each run so that concurrent runs of the test suite don't cause conflict
const testUserEmail =
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5) +
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5) +
  '@soylentgreen.com';

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
  return createUser({})
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
      return createUser({})
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
        firstName: 'Heather',
        lastName: 'Sykes',
        isAdmin: false,
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
        firstName: 'test',
        lastName: 'user',
        isAdmin: false,
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
      // Missing required fields
    })
      .then((result) => {
        throw new Error('createUser returned a 200 despite improperly formatted request');
      })
      .catch((err) => {
        expect(err.code).toEqual('invalid-argument');
        expect(err.message).toEqual('Request body is invalidly formatted.');
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
      return delay(DELAY * 2)
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
        // This is missing fields
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
        disabled: false,
        firstName: 'test',
        lastName: 'user',
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
        disabled: false,
        firstName: 'test',
        lastName: 'user',
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
      return delay(DELAY * 3).then(() => {
        return adminAuth.getUserByEmail('disabled@soylentgreen.com').then((userRecordDisabled) => {
          expect(userRecordDisabled.disabled).toBe(false);
          return adminDb
            .collection('users')
            .doc('disabled@soylentgreen.com')
            .update({
              disabled: true,
            })
            .then(() => {
              return delay(DELAY * 3).then(() => {
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

test('User can be toggled between enabled and disabled', () => {
  return adminDb
    .collection('users')
    .doc('disabled@soylentgreen.com')
    .update({
      disabled: false,
    })
    .then(() => {
      // Delay to allow userOnUpdate time to run
      return delay(DELAY * 2).then(() => {
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

test('User can be toggled between isAdmin and not isAdmin', () => {
  return adminDb
    .collection('users')
    .doc('user@soylentgreen.com')
    .update({
      isAdmin: true,
    })
    .then(() => {
      // Delay to allow userOnUpdate time to run
      return delay(DELAY * 2).then(() => {
        return clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com').then(() => {
          if (clientAuth.currentUser === null) {
            throw new Error('clientAuth.currentUser returned null');
          }
          return clientAuth.currentUser
            .getIdTokenResult(true)
            .then((idTokenResult) => {
              // Check that isAdmin claim has been updated properly
              expect(idTokenResult.claims.isAdmin).toEqual(true);
            })
            .then(() => {
              return adminDb
                .collection('users')
                .doc('user@soylentgreen.com')
                .update({
                  isAdmin: false,
                })
                .then(() => {
                  // Delay to allow userOnUpdate time to run
                  return delay(DELAY * 2).then(() => {
                    return clientAuth.currentUser!.getIdTokenResult(true).then((idTokenResult) => {
                      // Check that isAdmin claim has been updated properly
                      expect(idTokenResult.claims.isAdmin).toEqual(false);
                    });
                  });
                });
            });
        });
      });
    });
});
