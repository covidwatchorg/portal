const admin = require('firebase-admin');
const client = require('firebase-tools');
const { uniqueNamesGenerator, names } = require('unique-names-generator');

if (
  process.env.NODE_ENV !== 'local' &&
  process.env.NODE_ENV !== 'dev' &&
  process.env.NODE_ENV !== 'test' &&
  process.env.NODE_ENV !== 'staging'
) {
  throw new Error('Environment variable NODE_ENV must be set to one of `dev` or `test` or `staging`');
}

// Initialize admin SDK
const serviceAccount = require(`./permission-portal-${process.env.NODE_ENV}-firebase-admin-key.json`);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://permission-portal-${process.env.NODE_ENV}.firebaseio.com`,
});

const db = admin.firestore();
const auth = admin.auth();
var soylentGreenID = '';
var initechID = '';

async function addMinimalSampleData() {
  const soylentGreenRef = db.collection('organizations').doc();
  const initechRef = db.collection('organizations').doc();
  soylentGreenID = soylentGreenRef.id;
  initechID = initechRef.id;

  try {
    await soylentGreenRef.set({
      name: 'Soylent Green',
    });
    console.log(`Successfully created organization Soylent Green with document ID ${soylentGreenID}`);
    try {
      await db
        .collection('users')
        .doc('admin@soylentgreen.com')
        .set({
          isSuperAdmin: false,
          isAdmin: true,
          organizationID: soylentGreenID,
          disabled: false,
          firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
          lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
        });
      try {
        await auth.createUser({
          email: 'admin@soylentgreen.com',
          password: 'admin@soylentgreen.com',
        });
        console.log(`Successfully created Soylent Green admin user with username/password admin@soylentgreen.com`);
        try {
          await db
            .collection('users')
            .doc('user@soylentgreen.com')
            .set({
              isSuperAdmin: false,
              isAdmin: false,
              organizationID: soylentGreenID,
              disabled: false,
              firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
              lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
            });
          try {
            await auth.createUser({
              email: 'user@soylentgreen.com',
              password: 'user@soylentgreen.com',
            });
            console.log(`Successfully created Soylent Green regular user with username/password user@soylentgreen.com`);
            try {
              await initechRef.set({
                name: 'Initech',
              });
              console.log(`Successfully created organization Initech with document ID ${initechID}`);
              try {
                await db
                  .collection('users')
                  .doc('admin@initech.com')
                  .set({
                    isSuperAdmin: false,
                    isAdmin: true,
                    organizationID: initechID,
                    disabled: false,
                    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                  });
                try {
                  await auth.createUser({
                    email: 'admin@initech.com',
                    password: 'admin@initech.com',
                  });
                  console.log(`Successfully created Initech admin user with username/password admin@initech.com`);
                  try {
                    await db
                      .collection('users')
                      .doc('user@initech.com')
                      .set({
                        isSuperAdmin: false,
                        isAdmin: false,
                        organizationID: initechID,
                        disabled: false,
                        firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                        lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                      });
                    try {
                      await auth.createUser({
                        email: 'user@initech.com',
                        password: 'user@initech.com',
                      });
                      console.log(`Successfully created Initech regular user with username/password user@initech.com`);
                      await db
                        .collection('users')
                        .doc('disabled@soylentgreen.com')
                        .set({
                          isSuperAdmin: false,
                          isAdmin: false,
                          organizationID: soylentGreenID,
                          disabled: true,
                          firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                          lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                        });
                      await db
                        .collection('users')
                        .doc('disabled@initech.com')
                        .set({
                          isSuperAdmin: false,
                          isAdmin: false,
                          organizationID: initechID,
                          disabled: true,
                          firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                          lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
                        });
                      await auth.createUser({
                        email: 'disabled@soylentgreen.com',
                        password: 'disabled@soylentgreen.com',
                      });
                      console.log(
                        `Successfully created Soylent Green disabled user with username/password disabled@soylentgreen.com`
                      );
                      await auth.createUser({
                        email: 'disabled@initech.com',
                        password: 'disabled@initech.com',
                      });
                      console.log(
                        `Successfully created Initech disabled user with username/password disabled@initech.com`
                      );
                    } catch (err) {
                      throw err;
                    }
                  } catch (err_1) {
                    throw err_1;
                  }
                } catch (err_2) {
                  throw err_2;
                }
              } catch (err_3) {
                throw err_3;
              }
            } catch (err_4) {
              throw err_4;
            }
          } catch (err_5) {
            throw err_5;
          }
        } catch (err_6) {
          throw err_6;
        }
      } catch (err_7) {
        throw err_7;
      }
    } catch (err_8) {
      throw err_8;
    }
  } catch (err_9) {
    throw err_9;
  }
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
          return client.firestore
            .delete('/userImages', { project: process.env.NODE_ENV, recursive: true, yes: true })
            .then(() => {
              console.log('Successfully deleted userImages collection');
              return deleteAllUsers();
            });
        });
    });
}

async function createRandomSoylentgreenUser() {
  const firstName = uniqueNamesGenerator({ dictionaries: [names], length: 1 });
  const lastName = uniqueNamesGenerator({ dictionaries: [names], length: 1 });
  try {
    console.log(`creating new user in users table ${firstName}${lastName}@soylentgreen.com`);
    await db
      .collection('users')
      .doc(`${firstName}${lastName}@soylentgreen.com`.toLowerCase())
      .set({
        isSuperAdmin: false,
        isAdmin: Math.random() >= 0.5,
        organizationID: soylentGreenID,
        disabled: false,
        firstName: firstName,
        lastName: lastName,
      });
    console.log('users user created');
    try {
      console.log(`creating new auth user with email/password ${firstName}${lastName}@soylentgreen.com`);
      await auth.createUser({
        email: `${firstName}${lastName}@soylentgreen.com`,
        password: `${firstName}${lastName}@soylentgreen.com`,
      });
      console.log('auth user created');
    } catch (error) {
      // createUser seems to commonly fail and so we need to catch and delete the entry in the user collection
      db.collection('users').doc(`${firstName}${lastName}@soylentgreen.com`).delete();
      throw error;
    }
    console.log(
      `Successfully created Soylent Green user with username/password ${firstName}${lastName}@soylentgreen.com`
    );
  } catch (err) {
    throw err;
  }
}

async function main() {
  try {
    await hardReset();
    await addMinimalSampleData();
    for (let i = 0; i < 10; i++) {
      try {
        await createRandomSoylentgreenUser();
      } catch (error) {
        console.log('Encountered an error while attempting to createRandomSoylentgreenUser:');
        console.log(error);
        console.log('continuing');
        i--;
        continue;
      }
    }
    console.log('Successfully added all sample data');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
