import * as firebase from 'firebase/app';
import * as admin from 'firebase-admin';
// tslint:disable-next-line: no-implicit-dependencies
const firebase_tools = require('firebase-tools');
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
        appId: '1:885750041965:web:14133265537c686c1dde64'
      }
    : {
        apiKey: 'AIzaSyAHVZXO-wFnGmUIBLxF6-mY3tuleK4ENVo',
        authDomain: 'permission-portal-test.firebaseapp.com',
        databaseURL: 'https://permission-portal-test.firebaseio.com',
        projectId: 'permission-portal-test',
        storageBucket: 'permission-portal-test.appspot.com',
        messagingSenderId: '1090782248577',
        appId: '1:1090782248577:web:184d481f492cfa4edc1780'
      };
firebase.initializeApp(firebaseConfig);

// Initialize admin SDK
const serviceAccount =
  process.env.NODE_ENV === 'development'
    ? require('../../permission-portal-dev-firebase-admin-key.json')
    : require('../../permission-portal-test-firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    process.env.NODE_ENV === 'development'
      ? 'https://permission-portal-dev.firebaseio.com'
      : 'https://permission-portal-test.firebaseio.com'
});

// Initialize commonly used vars
const clientDb = firebase.firestore();
const adminDb = admin.firestore();
const clientAuth = firebase.auth();
const adminAuth = admin.auth();

// Delay function to deal with Cloud Functions triggers needing time to propagate.
const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
// Milliseconds to delay at certain points in the test suite. Incredibly annoying, but because
// our system relies on the onCreate trigger for various features, we need to provide delays in the tests in order
// to give the trigger time to run.
const DELAY = 10000;

// Track important variables for use in tests and easy deletion in afterAll()
let soylentGreenAdminID: string;
let soylentGreenRegularUserId: string;
let initechAdminID: string;
let initechRegularUserId: string;
let soylentGreenID: string;
let initechID: string;

beforeAll(() => {
  const soylentGreenRef = adminDb.collection('organizations').doc();
  const initechRef = adminDb.collection('organizations').doc();
  soylentGreenID = soylentGreenRef.id;
  initechID = initechRef.id;

  return soylentGreenRef
    .set({
      name: 'Soylent Green'
    })
    .then(() => {
      console.log(`Successfully created organization Soylent Green with document ID ${soylentGreenID}`);
      return adminDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .set({
          isSuperAdmin: false,
          isAdmin: true,
          organizationID: soylentGreenID
        })
        .then(() => {
          return adminAuth
            .createUser({
              email: 'admin@soylentgreen.com',
              password: 'admin@soylentgreen.com'
            })
            .then(soylentGreenAdminUserRecord => {
              soylentGreenAdminID = soylentGreenAdminUserRecord.uid;
              console.log(
                `Successfully created Soylent Green admin user with username/password admin@soylentgreen.com`
              );
              return delay(DELAY).then(() => {
                return adminDb
                  .collection('users')
                  .doc('user@soylentgreen.com')
                  .set({
                    isSuperAdmin: false,
                    isAdmin: false,
                    organizationID: soylentGreenID
                  })
                  .then(() => {
                    return adminAuth
                      .createUser({
                        email: 'user@soylentgreen.com',
                        password: 'user@soylentgreen.com'
                      })
                      .then(soylentGreenRegularUserRecord => {
                        soylentGreenRegularUserId = soylentGreenRegularUserRecord.uid;
                        console.log(
                          `Successfully created Soylent Green regular user with username/password user@soylentgreen.com`
                        );
                        return delay(DELAY).then(() => {
                          return initechRef
                            .set({
                              name: 'Initech'
                            })
                            .then(() => {
                              console.log(`Successfully created organization Initech with document ID ${initechID}`);
                              return adminDb
                                .collection('users')
                                .doc('admin@initech.com')
                                .set({
                                  isSuperAdmin: false,
                                  isAdmin: true,
                                  organizationID: initechID
                                })
                                .then(() => {
                                  return adminAuth
                                    .createUser({
                                      email: 'admin@initech.com',
                                      password: 'admin@initech.com'
                                    })
                                    .then(initechAdminUserRecord => {
                                      initechAdminID = initechAdminUserRecord.uid;
                                      console.log(
                                        `Successfully created Initech admin user with username/password admin@initech.com`
                                      );
                                      return delay(DELAY).then(() => {
                                        return adminDb
                                          .collection('users')
                                          .doc('user@initech.com')
                                          .set({
                                            isSuperAdmin: false,
                                            isAdmin: false,
                                            organizationID: initechID
                                          })
                                          .then(() => {
                                            return adminAuth
                                              .createUser({
                                                email: 'user@initech.com',
                                                password: 'user@initech.com'
                                              })
                                              .then(initechRegularUserRecord => {
                                                initechRegularUserId = initechRegularUserRecord.uid;
                                                console.log(
                                                  `Successfully created Initech regular user with username/password user@initech.com`
                                                );
                                                return delay(DELAY);
                                              })
                                              .catch(err => {
                                                throw err;
                                              });
                                          })
                                          .catch(err => {
                                            throw err;
                                          });
                                      });
                                    })
                                    .catch(err => {
                                      throw err;
                                    });
                                })
                                .catch(err => {
                                  throw err;
                                });
                            })
                            .catch(err => {
                              throw err;
                            });
                        });
                      })
                      .catch(err => {
                        throw err;
                      });
                  })
                  .catch(err => {
                    throw err;
                  });
              });
            })
            .catch(err => {
              throw err;
            });
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => {
      throw err;
    });
});

function deleteAllUsers() {
  return adminAuth.deleteUser(soylentGreenAdminID).then(() => {
    return adminAuth.deleteUser(soylentGreenRegularUserId).then(() => {
      return adminAuth.deleteUser(initechAdminID).then(() => {
        return adminAuth.deleteUser(initechRegularUserId);
      });
    });
  });
}

afterAll(() => {
  return firebase_tools.firestore
    .delete('/organizations', {
      project: process.env.NODE_ENV === 'development' ? 'dev' : 'test',
      recursive: true,
      yes: true
    })
    .then(() => {
      console.log('Successfully deleted organizations collection');
      return firebase_tools.firestore
        .delete('/users', {
          project: process.env.NODE_ENV === 'development' ? 'dev' : 'test',
          recursive: true,
          yes: true
        })
        .then(() => {
          console.log('Successfully deleted users collection');
          return deleteAllUsers();
        });
    });
});

describe("Unauthenticated users can't do anything", () => {
  test("Unauthenticated user can't read users", () => {
    return clientDb
      .collection('users')
      .doc('admin@soylentgreen.com')
      .get()
      .then(() => {
        throw new Error('Unauthenticated user should not be able to read from users collection');
      })
      .catch(err => {
        expect(err.code).toEqual('permission-denied');
        expect(err.message).toEqual('Missing or insufficient permissions.');
      });
  });

  test("Unauthenticated user can't write users", () => {
    return clientDb
      .collection('users')
      .doc('some doc in users')
      .update({
        someField: 'someValue'
      })
      .then(() => {
        throw new Error('Unauthenticated user should not be able to write to users collection');
      })
      .catch(err => {
        expect(err.code).toEqual('permission-denied');
        expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
      });
  });

  test("Unauthenticated user can't read organizations", () => {
    return clientDb
      .collection('organizations')
      .doc(soylentGreenID)
      .get()
      .then(() => {
        throw new Error('Unauthenticated user should not be able to read from organizations table');
      })
      .catch(err => {
        expect(err.code).toEqual('permission-denied');
        expect(err.message).toEqual('Missing or insufficient permissions.');
      });
  });

  test("Unauthenticated user can't write organizations", () => {
    return clientDb
      .collection('organizations')
      .doc('some doc in organizations')
      .update({
        someField: 'someValue'
      })
      .then(() => {
        throw new Error('Unauthenticated user should not be able to write to organizations table');
      })
      .catch(err => {
        expect(err.code).toEqual('permission-denied');
        expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
      });
  });
});

describe('Test proper read/write permissions for regular users (non-admins)', () => {
  test('Authenticated regular user can read his own data', () => {
    return clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .get()
        .then(userSnapshot => {
          expect(userSnapshot.id).toEqual('user@soylentgreen.com');
        })
        .catch(err => {
          throw err;
        });
    });
  });

  test('Authenticated regular user can write his own data', () => {
    return clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .update({
          newField: 'newValue'
        })
        .then(() => {
          return clientDb
            .collection('users')
            .doc('user@soylentgreen.com')
            .get()
            .then(userSnapshot => userSnapshot.data())
            .then(user => {
              expect(user).toBeDefined();
              expect(user!.newField).toEqual('newValue');
            });
        })
        .catch(err => {
          throw err;
        });
    });
  });

  test("Authenticated regular user can't read other user's data", () => {
    return clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .get()
        .then(() => {
          throw new Error("Authenticated regular users should not be able to read other user's data");
        })
        .catch(err => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('admin@initech.com')
            .get()
            .then(() => {
              throw new Error("Authenticated regular users should not be able to read other user's data");
            })
            .catch(err2 => {
              expect(err2.code).toEqual('permission-denied');
              expect(err2.message).toEqual('Missing or insufficient permissions.');
              return clientDb
                .collection('users')
                .doc('user@initech.com')
                .get()
                .then(() => {
                  throw new Error("Authenticated regular users should not be able to read other user's data");
                })
                .catch(err3 => {
                  expect(err3.code).toEqual('permission-denied');
                  expect(err3.message).toEqual('Missing or insufficient permissions.');
                });
            });
        });
    });
  });

  test("Authenticated regular user can't write other user's data", () => {
    return clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .update({
          newField: 'newValue'
        })
        .then(() => {
          throw new Error("Authenticated regular users should not be able to write other user's data");
        })
        .catch(err => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('admin@initech.com')
            .update({
              newField: 'newValue'
            })
            .then(() => {
              throw new Error("Authenticated regular users should not be able to read other user's data");
            })
            .catch(err2 => {
              expect(err2.code).toEqual('permission-denied');
              expect(err2.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
              return clientDb
                .collection('users')
                .doc('user@initech.com')
                .update({
                  newField: 'newValue'
                })
                .then(() => {
                  throw new Error("Authenticated regular users should not be able to read other user's data");
                })
                .catch(err3 => {
                  expect(err3.code).toEqual('permission-denied');
                  expect(err3.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
                });
            });
        });
    });
  });

  test('Authenticated regular user can read his own organization', () => {
    return clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then(idTokenResult => {
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .get()
              .then(orgSnapshot => {
                expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
                return orgSnapshot.data();
              })
              .then(org => {
                expect(org).toBeDefined();
                expect(org!.name).toEqual('Soylent Green');
              })
              .catch(err => {
                throw err;
              });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });

  test("Authenticated regular user can't read an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientDb
          .collection('organizations')
          .doc(initechID)
          .get()
          .then(() => {
            throw new Error(
              "Authenticated regular user shouldn't have been able to read an organization he doesn't belong to"
            );
          })
          .catch(err => {
            expect(err.code).toEqual('permission-denied');
            expect(err.message).toEqual('Missing or insufficient permissions.');
          });
      })
      .catch(err => {
        throw err;
      });
  });

  test("Authenticated regular user can't write his own organization", () => {
    return clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then(idTokenResult => {
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .update({
                newField: 'newValue'
              })
              .then(() => {
                throw new Error("Authenticated regular user shouldn't be able to write to his own organization");
              })
              .catch(err => {
                expect(err.code).toEqual('permission-denied');
                expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
              });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });

  test("Authenticated regular user can't write an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientDb
          .collection('organizations')
          .doc(initechID)
          .update({
            newField: 'newValue'
          })
          .then(() => {
            throw new Error(
              "Authenticated regular user shouldn't be able to write to an organization he doesn't belong to"
            );
          })
          .catch(err => {
            expect(err.code).toEqual('permission-denied');
            expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
          });
      })
      .catch(err => {
        throw err;
      });
  });
});

describe('Test proper read/write permissions for admins', () => {
  test('Authenticated admin user can read his own data', () => {
    return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .get()
        .then(userSnapshot => {
          expect(userSnapshot.id).toEqual('admin@soylentgreen.com');
        })
        .catch(err => {
          throw err;
        });
    });
  });

  test("Authenticated admin user can read other users' data if they're in his organization", () => {
    return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .get()
        .then(userSnapshot => {
          expect(userSnapshot.id).toEqual('user@soylentgreen.com');
        })
        .catch(err => {
          throw err;
        });
    });
  });

  test("Authenticated admin user can't read other users' data if they're not in his organization", () => {
    return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('admin@initech.com')
        .get()
        .then(() => {
          throw new Error(
            "Authenticated admin users should not be able to read other user's data if they're not in the same organization"
          );
        })
        .catch(err => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('user@initech.com')
            .get()
            .then(() => {
              throw new Error(
                "Authenticated admin users should not be able to read other user's data if they're not in the same organization"
              );
            })
            .catch(err2 => {
              expect(err2.code).toEqual('permission-denied');
              expect(err2.message).toEqual('Missing or insufficient permissions.');
            });
        });
    });
  });

  test('Authenticated admin user can write his own data', () => {
    return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .update({
          newField: 'newValue'
        })
        .then(() => {
          return clientDb
            .collection('users')
            .doc('admin@soylentgreen.com')
            .get()
            .then(userSnapshot => userSnapshot.data())
            .then(user => {
              expect(user).toBeDefined();
              expect(user!.newField).toEqual('newValue');
            });
        })
        .catch(err => {
          throw err;
        });
    });
  });

  test("Authenticated admin user can write another user's data if they're in his organization", () => {
    return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .update({
          newField: 'newValue'
        })
        .then(() => {
          return clientDb
            .collection('users')
            .doc('user@soylentgreen.com')
            .get()
            .then(userSnapshot => userSnapshot.data())
            .then(user => {
              expect(user).toBeDefined();
              expect(user!.newField).toEqual('newValue');
            });
        })
        .catch(err => {
          throw err;
        });
    });
  });

  test("Authenticated admin user can't write another user's data if they're not in his organization", () => {
    return clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com').then(() => {
      return clientDb
        .collection('users')
        .doc('admin@initech.com')
        .update({
          newField: 'newValue'
        })
        .then(() => {
          throw new Error(
            "Authenticated admin users should not be able to write other user's data if they're not in the same organization"
          );
        })
        .catch(err => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('user@initech.com')
            .update({
              newField: 'newValue'
            })
            .then(() => {
              throw new Error(
                "Authenticated admin users should not be able to write other user's data if they're not in the same organization"
              );
            })
            .catch(err2 => {
              expect(err2.code).toEqual('permission-denied');
              expect(err2.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
            });
        });
    });
  });

  test('Authenticated admin user can read his own organization', () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then(idTokenResult => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .get()
              .then(orgSnapshot => {
                expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
                return orgSnapshot.data();
              })
              .then(org => {
                expect(org).toBeDefined();
                expect(org!.name).toEqual('Soylent Green');
              })
              .catch(err => {
                throw err;
              });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });

  test("Authenticated admin user can't read an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then(idTokenResult => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(initechID)
              .get()
              .then(() => {
                throw new Error(
                  "Authenticated admin user shouldn't have been able to read an organization he doesn't belong to"
                );
              })
              .catch(err => {
                expect(err.code).toEqual('permission-denied');
                expect(err.message).toEqual('Missing or insufficient permissions.');
              });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });

  test('Authenticated admin user can write his own organization', () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then(idTokenResult => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .update({
                newField: 'newValue'
              })
              .then(() => {
                return clientDb
                  .collection('organizations')
                  .doc(idTokenResult.claims.organizationID)
                  .get()
                  .then(orgSnapshot => {
                    expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
                    return orgSnapshot.data();
                  })
                  .then(org => {
                    expect(org).toBeDefined();
                    expect(org!.newField).toEqual('newValue');
                  })
                  .catch(err => {
                    throw err;
                  });
              })
              .catch(err => {
                throw err;
              });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });

  test("Authenticated admin user can't write to an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then(idTokenResult => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(initechID)
              .update({
                newField: 'newValue'
              })
              .then(() => {
                throw new Error(
                  "Authenticated admin user shouldn't have been able to write to an organization he doesn't belong to"
                );
              })
              .catch(err => {
                expect(err.code).toEqual('permission-denied');
                expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
              });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });
});
