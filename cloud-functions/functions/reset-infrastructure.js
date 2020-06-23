const admin = require('firebase-admin');
const client = require('firebase-tools');
const { uniqueNamesGenerator, names } = require('unique-names-generator');

if (
  process.env.NODE_ENV !== 'local' &&
  process.env.NODE_ENV !== 'dev' &&
  process.env.NODE_ENV !== 'test' &&
  process.env.NODE_ENV !== 'staging'
) {
  throw new Error('Environment variable NODE_ENV must be set to one of `dev` or `test` or `staging` or `local`');
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
  await soylentGreenRef.set({
    name: 'Soylent Green',
  });
  await initechRef.set({
    name: 'Initech',
  });
  await createUser({
    email: 'admin@soylentgreen.com',
    isAdmin: true,
    organizationID: soylentGreenID,
    disabled: false,
    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    isFirstTimeUser: false,
  });
  await createUser({
    email: 'user@soylentgreen.com',
    isAdmin: false,
    organizationID: soylentGreenID,
    disabled: false,
    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    isFirstTimeUser: false,
  });
  await createUser({
    email: 'disabled@soylentgreen.com',
    isAdmin: false,
    organizationID: soylentGreenID,
    disabled: true,
    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    isFirstTimeUser: false,
  });
  await createUser({
    email: 'admin@initech.com',
    isAdmin: true,
    organizationID: initechID,
    disabled: false,
    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    isFirstTimeUser: false,
  });
  await createUser({
    email: 'user@initech.com',
    isAdmin: false,
    organizationID: initechID,
    disabled: false,
    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    isFirstTimeUser: false,
  });
  await createUser({
    email: 'disabled@initech.com',
    isAdmin: false,
    organizationID: initechID,
    disabled: true,
    firstName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    lastName: uniqueNamesGenerator({ dictionaries: [names], length: 1 }),
    isFirstTimeUser: false,
  });
}

async function createUser(user) {
  await db.collection('users').doc(user.email).set({
    isAdmin: user.isAdmin,
    organizationID: user.organizationID,
    disabled: user.disabled,
    firstName: user.firstName,
    lastName: user.lastName,
    isFirstTimeUser: user.isFirstTimeUser,
  });
  await db.collection('userImages').doc(user.email).set({ imageBlob: null });
  await auth.createUser({ email: user.email, password: user.password ? user.password : user.email });
  console.log(
    `Successfully created ${user.organizationID === soylentGreenID ? 'Soylent Green' : 'Initech'} ${
      user.isAdmin ? 'admin' : 'regular'
    }, ${user.disabled ? 'disabled' : 'enabled'} user with username ${user.email} and password ${
      user.password ? user.password : user.email
    }`
  );
}

async function deleteUser(uid) {
  try {
    await admin.auth().deleteUser(uid);
    console.log('Successfully deleted user', uid);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

async function deleteAllUsers(nextPageToken) {
  const listUsersResult = await admin.auth().listUsers(100, nextPageToken);
  listUsersResult.users.forEach(function (userRecord) {
    uid = userRecord.toJSON().uid;
    return deleteUser(uid);
  });
  if (listUsersResult.pageToken) {
    deleteAllUsers(listUsersResult.pageToken);
  }
}

async function hardReset() {
  await client.firestore.delete('/organizations', {
    project: process.env.NODE_ENV,
    recursive: true,
    yes: true,
  });
  console.log('Successfully deleted organizations collection');
  await client.firestore.delete('/users', {
    project: process.env.NODE_ENV,
    recursive: true,
    yes: true,
  });
  console.log('Successfully deleted users collection');
  await client.firestore.delete('/userImages', { project: process.env.NODE_ENV, recursive: true, yes: true });
  console.log('Successfully deleted userImages collection');
  await deleteAllUsers();
}

async function createRandomUser(company) {
  const firstName = uniqueNamesGenerator({ dictionaries: [names], length: 1 });
  const lastName = uniqueNamesGenerator({ dictionaries: [names], length: 1 });
  const companyWebsite = company === 'soylentgreen' ? 'soylentgreen.com' : 'initech.com';
  const email = `${firstName}${lastName}@${companyWebsite}`.toLowerCase();
  await createUser({
    email: email,
    isAdmin: Math.random() >= 0.5,
    organizationID: company === 'soylentgreen' ? soylentGreenID : initechID,
    disabled: false,
    firstName: firstName,
    lastName: lastName,
    isFirstTimeUser: true,
  });
}

async function main() {
  try {
    await hardReset();
    await addMinimalSampleData();

    for (let i = 0; i < 10; i++) {
      try {
        await createRandomUser('soylentgreen');
      } catch (error) {
        console.log('Encountered an error while attempting to create a random user');
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
