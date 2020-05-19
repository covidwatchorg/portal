import { clientDb, clientAuth, soylentGreenID, initechID } from './config';

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

  test('Authenticated admin user can read a list of all the other users in his organization', () => {
    return clientAuth.signInWithEmailAndPassword('admin@initech.com', 'admin@initech.com').then(() => {
      return clientAuth.currentUser!.getIdTokenResult(true).then((idTokenResult) => {
        return clientDb
          .collection('users')
          .where('organizationID', '==', idTokenResult.claims.organizationID)
          .get()
          .then((collectionsSnapshot) => {
            const userDocs = collectionsSnapshot.docs.map((userDoc) => userDoc.data());
            expect(userDocs.length).toEqual(3);
          })
          .catch((err) => {
            throw err;
          });
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
