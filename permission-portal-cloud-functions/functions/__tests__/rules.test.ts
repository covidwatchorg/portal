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

const firebaseConfig = require(`../../config/firebase.config.${process.env.NODE_ENV}.js`)
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
  databaseURL: 'https://permission-portal-test.firebaseio.com',
});

// Initialize commonly used vars
const clientDb = firebase.firestore();
const clientAuth = firebase.auth();

// Constants taken from database
const soylentGreenID: string = 'wV6rYRcd6ujaxiOWb9qa';
const initechID: string = 'Y2QXOHIx643m7FceqU5R';

describe("Unauthenticated users can't do anything", () => {
  test("Unauthenticated user can't read users", () => {
    return clientDb
      .collection('users')
      .doc('admin@soylentgreen.com')
      .get()
      .then(() => {
        throw new Error('Unauthenticated user should not be able to read from users collection');
      })
      .catch((err) => {
        expect(err.code).toEqual('permission-denied');
        expect(err.message).toEqual('Missing or insufficient permissions.');
      });
  });

  test("Unauthenticated user can't write users", () => {
    return clientDb
      .collection('users')
      .doc('some doc in users')
      .update({
        someField: 'someValue',
      })
      .then(() => {
        throw new Error('Unauthenticated user should not be able to write to users collection');
      })
      .catch((err) => {
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
      .catch((err) => {
        expect(err.code).toEqual('permission-denied');
        expect(err.message).toEqual('Missing or insufficient permissions.');
      });
  });

  test("Unauthenticated user can't write organizations", () => {
    return clientDb
      .collection('organizations')
      .doc('some doc in organizations')
      .update({
        someField: 'someValue',
      })
      .then(() => {
        throw new Error('Unauthenticated user should not be able to write to organizations table');
      })
      .catch((err) => {
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
        .then((userSnapshot) => {
          expect(userSnapshot.id).toEqual('user@soylentgreen.com');
        })
        .catch((err) => {
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
          newField: 'newValue',
        })
        .then(() => {
          return clientDb
            .collection('users')
            .doc('user@soylentgreen.com')
            .get()
            .then((userSnapshot) => userSnapshot.data())
            .then((user) => {
              expect(user).toBeDefined();
              expect(user!.newField).toEqual('newValue');
            });
        })
        .catch((err) => {
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
        .catch((err) => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('admin@initech.com')
            .get()
            .then(() => {
              throw new Error("Authenticated regular users should not be able to read other user's data");
            })
            .catch((err2) => {
              expect(err2.code).toEqual('permission-denied');
              expect(err2.message).toEqual('Missing or insufficient permissions.');
              return clientDb
                .collection('users')
                .doc('user@initech.com')
                .get()
                .then(() => {
                  throw new Error("Authenticated regular users should not be able to read other user's data");
                })
                .catch((err3) => {
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
          newField: 'newValue',
        })
        .then(() => {
          throw new Error("Authenticated regular users should not be able to write other user's data");
        })
        .catch((err) => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('admin@initech.com')
            .update({
              newField: 'newValue',
            })
            .then(() => {
              throw new Error("Authenticated regular users should not be able to read other user's data");
            })
            .catch((err2) => {
              expect(err2.code).toEqual('permission-denied');
              expect(err2.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
              return clientDb
                .collection('users')
                .doc('user@initech.com')
                .update({
                  newField: 'newValue',
                })
                .then(() => {
                  throw new Error("Authenticated regular users should not be able to read other user's data");
                })
                .catch((err3) => {
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
          .then((idTokenResult) => {
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .get()
              .then((orgSnapshot) => {
                expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
                return orgSnapshot.data();
              })
              .then((org) => {
                expect(org).toBeDefined();
                expect(org!.name).toEqual('Soylent Green');
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
          .catch((err) => {
            expect(err.code).toEqual('permission-denied');
            expect(err.message).toEqual('Missing or insufficient permissions.');
          });
      })
      .catch((err) => {
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
          .then((idTokenResult) => {
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .update({
                newField: 'newValue',
              })
              .then(() => {
                throw new Error("Authenticated regular user shouldn't be able to write to his own organization");
              })
              .catch((err) => {
                expect(err.code).toEqual('permission-denied');
                expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
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

  test("Authenticated regular user can't write an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientDb
          .collection('organizations')
          .doc(initechID)
          .update({
            newField: 'newValue',
          })
          .then(() => {
            throw new Error(
              "Authenticated regular user shouldn't be able to write to an organization he doesn't belong to"
            );
          })
          .catch((err) => {
            expect(err.code).toEqual('permission-denied');
            expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
          });
      })
      .catch((err) => {
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
        .then((userSnapshot) => {
          expect(userSnapshot.id).toEqual('admin@soylentgreen.com');
        })
        .catch((err) => {
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
        .then((userSnapshot) => {
          expect(userSnapshot.id).toEqual('user@soylentgreen.com');
        })
        .catch((err) => {
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
        .catch((err) => {
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
            .catch((err2) => {
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
          newField: 'newValue',
        })
        .then(() => {
          return clientDb
            .collection('users')
            .doc('admin@soylentgreen.com')
            .get()
            .then((userSnapshot) => userSnapshot.data())
            .then((user) => {
              expect(user).toBeDefined();
              expect(user!.newField).toEqual('newValue');
            });
        })
        .catch((err) => {
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
          newField: 'newValue',
        })
        .then(() => {
          return clientDb
            .collection('users')
            .doc('user@soylentgreen.com')
            .get()
            .then((userSnapshot) => userSnapshot.data())
            .then((user) => {
              expect(user).toBeDefined();
              expect(user!.newField).toEqual('newValue');
            });
        })
        .catch((err) => {
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
          newField: 'newValue',
        })
        .then(() => {
          throw new Error(
            "Authenticated admin users should not be able to write other user's data if they're not in the same organization"
          );
        })
        .catch((err) => {
          expect(err.code).toEqual('permission-denied');
          expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
          return clientDb
            .collection('users')
            .doc('user@initech.com')
            .update({
              newField: 'newValue',
            })
            .then(() => {
              throw new Error(
                "Authenticated admin users should not be able to write other user's data if they're not in the same organization"
              );
            })
            .catch((err2) => {
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
          .then((idTokenResult) => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .get()
              .then((orgSnapshot) => {
                expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
                return orgSnapshot.data();
              })
              .then((org) => {
                expect(org).toBeDefined();
                expect(org!.name).toEqual('Soylent Green');
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

  test("Authenticated admin user can't read an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then((idTokenResult) => {
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
              .catch((err) => {
                expect(err.code).toEqual('permission-denied');
                expect(err.message).toEqual('Missing or insufficient permissions.');
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

  test('Authenticated admin user can write his own organization', () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then((idTokenResult) => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(idTokenResult.claims.organizationID)
              .update({
                newField: 'newValue',
              })
              .then(() => {
                return clientDb
                  .collection('organizations')
                  .doc(idTokenResult.claims.organizationID)
                  .get()
                  .then((orgSnapshot) => {
                    expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
                    return orgSnapshot.data();
                  })
                  .then((org) => {
                    expect(org).toBeDefined();
                    expect(org!.newField).toEqual('newValue');
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

  test("Authenticated admin user can't write to an organization he doesn't belong to", () => {
    return clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com')
      .then(() => {
        expect(clientAuth.currentUser).toBeTruthy();
        return clientAuth
          .currentUser!.getIdTokenResult(true)
          .then((idTokenResult) => {
            expect(idTokenResult.claims.isAdmin).toEqual(true);
            return clientDb
              .collection('organizations')
              .doc(initechID)
              .update({
                newField: 'newValue',
              })
              .then(() => {
                throw new Error(
                  "Authenticated admin user shouldn't have been able to write to an organization he doesn't belong to"
                );
              })
              .catch((err) => {
                expect(err.code).toEqual('permission-denied');
                expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
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
