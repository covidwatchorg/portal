var admin = require('firebase-admin');
var client = require('firebase-tools');

if (process.env.NODE_ENV !== 'dev' && process.env.NODE_ENV !== 'test') {
  throw new Error('Environment variable NODE_ENV must be set to one of `dev` or `test`');
}

// Initialize admin SDK
const serviceAccount = require(`./permission-portal-${process.env.NODE_ENV}-firebase-admin-key.json`);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://permission-portal-${process.env.NODE_ENV}.firebaseio.com`,
});

const db = admin.firestore();
const auth = admin.auth();

function addSampleData() {
  const soylentGreenRef = db.collection('organizations').doc();
  const initechRef = db.collection('organizations').doc();
  const soylentGreenID = soylentGreenRef.id;
  const initechID = initechRef.id;

  return soylentGreenRef
    .set({
      name: 'Soylent Green',
    })
    .then(() => {
      console.log(`Successfully created organization Soylent Green with document ID ${soylentGreenID}`);
      return db
        .collection('users')
        .doc('admin@soylentgreen.com')
        .set({
          isSuperAdmin: false,
          isAdmin: true,
          organizationID: soylentGreenID,
        })
        .then(() => {
          return auth
            .createUser({
              email: 'admin@soylentgreen.com',
              password: 'admin@soylentgreen.com',
            })
            .then(() => {
              console.log(
                `Successfully created Soylent Green admin user with username/password admin@soylentgreen.com`
              );
              return db
                .collection('users')
                .doc('user@soylentgreen.com')
                .set({
                  isSuperAdmin: false,
                  isAdmin: false,
                  organizationID: soylentGreenID,
                })
                .then(() => {
                  return auth
                    .createUser({
                      email: 'user@soylentgreen.com',
                      password: 'user@soylentgreen.com',
                    })
                    .then(() => {
                      console.log(
                        `Successfully created Soylent Green regular user with username/password user@soylentgreen.com`
                      );
                      return initechRef
                        .set({
                          name: 'Initech',
                        })
                        .then(() => {
                          console.log(`Successfully created organization Initech with document ID ${initechID}`);
                          return db
                            .collection('users')
                            .doc('admin@initech.com')
                            .set({
                              isSuperAdmin: false,
                              isAdmin: true,
                              organizationID: initechID,
                            })
                            .then(() => {
                              return auth
                                .createUser({
                                  email: 'admin@initech.com',
                                  password: 'admin@initech.com',
                                })
                                .then(() => {
                                  console.log(
                                    `Successfully created Initech admin user with username/password admin@initech.com`
                                  );
                                  return db
                                    .collection('users')
                                    .doc('user@initech.com')
                                    .set({
                                      isSuperAdmin: false,
                                      isAdmin: false,
                                      organizationID: initechID,
                                    })
                                    .then(() => {
                                      return auth
                                        .createUser({
                                          email: 'user@initech.com',
                                          password: 'user@initech.com',
                                        })
                                        .then(() => {
                                          console.log(
                                            `Successfully created Initech regular user with username/password user@initech.com`
                                          );
                                          return db
                                            .collection('users')
                                            .doc('disabled@soylentgreen.com')
                                            .set({
                                              isSuperAdmin: false,
                                              isAdmin: false,
                                              organizationID: soylentGreenID,
                                              disabled: true,
                                            })
                                            .then(() => {
                                              return db.collection('users').doc('disabled@initech.com').set({
                                                isSuperAdmin: false,
                                                isAdmin: false,
                                                organizationID: initechID,
                                                disabled: true,
                                              });
                                            })
                                            .then(() => {
                                              return auth
                                                .createUser({
                                                  email: 'disabled@soylentgreen.com',
                                                  password: 'disabled@soylentgreen.com',
                                                })
                                                .then(() => {
                                                  console.log(
                                                    `Successfully created Soylent Green disabled user with username/password disabled@soylentgreen.com`
                                                  );
                                                })
                                                .then(() => {
                                                  return auth
                                                    .createUser({
                                                      email: 'disabled@initech.com',
                                                      password: 'disabled@initech.com',
                                                    })
                                                    .then(() => {
                                                      console.log(
                                                        `Successfully created Initech disabled user with username/password disabled@initech.com`
                                                      );
                                                    });
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

async function deleteUser(uid) {
  try {
    await admin.auth().deleteUser(uid);
    console.log('Successfully deleted user', uid);
  } catch (error) {
    console.log('Error deleting user:', error);
  }
}

async function deleteAllUsers(nextPageToken) {
  try {
    const listUsersResult = await admin.auth().listUsers(100, nextPageToken);
    listUsersResult.users.forEach(function (userRecord) {
      uid = userRecord.toJSON().uid;
      return deleteUser(uid);
    });
    if (listUsersResult.pageToken) {
      deleteAllUsers(listUsersResult.pageToken);
    }
  } catch (err) {
    throw err;
  }
}

function hardReset() {
  return client.firestore
    .delete('/organizations', {
      project: process.env.NODE_ENV,
      recursive: true,
      yes: true,
    })
    .then(() => {
      console.log('Successfully deleted organizations collection');
      return client.firestore
        .delete('/users', {
          project: process.env.NODE_ENV,
          recursive: true,
          yes: true,
        })
        .then(() => {
          console.log('Successfully deleted users collection');
          return deleteAllUsers();
        });
    });
}

try {
  hardReset().then(() => {
    addSampleData().then(() => {
      console.log('Successfully added all sample data');
      process.exit();
    });
  });
} catch (error) {
  console.log(error);
}
