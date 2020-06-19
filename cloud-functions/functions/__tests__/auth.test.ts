import { adminDb, clientAuth, adminAuth, createUser, delay, DELAY, soylentGreenID } from './config';

jest.setTimeout(120000);

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

/**
 * Makes a copy of an existing user. The new user's email address and password will be `newEmail`.
 * @param oldEmail the existing user's email address
 * @param newEmail the new user's email address
 */
async function copyUser(oldEmail: string, newEmail: string) {
  // Copy user data
  const userData = (await adminDb.collection('users').doc(oldEmail).get()).data()!
  await adminDb.collection('users').doc(newEmail).set(userData)

  // Create auth record
  const userRecord = await adminAuth.createUser({
    email: newEmail,
    password: newEmail,
  })
  testUid = userRecord.uid
}

afterEach(async () => {
  try {
    await adminAuth.deleteUser(testUid);
    try {
      await adminDb
        .collection('users')
        .doc(testUserEmail)
        .delete();
      await clientAuth.signOut().catch((err) => {
        console.error(err);
      });
    } catch (err) {
      /* suppress expected error */
    }
  } catch (err) {
    // Do not consolidate these signOut() calls into a finally block! It will not work!
    await clientAuth.signOut().catch((err1) => {
      console.error(err1);
    });
  }
});

test('createUser cannot be called without being authenticated', async () => {
  try {
    await createUser({});
    fail("This shouldn't happen!");
  } catch (err) {
    expect(err.code).toEqual('unauthenticated');
    expect(err.message).toEqual('The function must be called while authenticated.');
  }
});

test('createUser cannot be called by non-admin', async () => {
  try {
    await clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    try {
      await createUser({});
      fail("This shouldn't happen!");
    } catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('The function must be called by an admin.');
    }
  } catch (err) {
    console.log(err);
    fail("This shouldn't happen!");
  }
});

test('Email address can only be used once', async () => {
  await clientAuth
    .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
  try {
    await createUser({
      email: 'user@soylentgreen.com',
      password: 'user@soylentgreen.com',
      firstName: 'Heather',
      lastName: 'Sykes',
      isAdmin: false,
    });
    fail(
      'user@soylentgreen.com should already be in the test database, and the email should not be allowed to be used again!'
    );
  } catch (err) {
    expect(err.code).toEqual('already-exists');
    expect(err.message).toEqual('The email address is already in use by another account.');
  }
});

test('createUser works for admins', async () => {
  await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
  
  const userRecord = (await createUser({
    email: testUserEmail,
    password: testUserEmail,
    firstName: 'test',
    lastName: 'user',
    isAdmin: false,
  })).data
  testUid = userRecord.uid;

  // Check that the endpoint responded with the proper user
  expect(userRecord.email).toEqual(testUserEmail);

  // delay for 6 sec to allow functions.auth.user().onCreate to trigger and propagate
  await delay(DELAY);

  await clientAuth.signInWithEmailAndPassword(testUserEmail, testUserEmail);
  
  // Check that we can sign in with this user
  const currentUser = clientAuth.currentUser;
  if (currentUser === null) {
    throw new Error('clientAuth.currentUser returned null');
  }
  expect(currentUser.email).toEqual(testUserEmail);

  await delay(DELAY);
  const idTokenResult = await currentUser.getIdTokenResult(true);
  // Check that custom claims are being added properly
  expect(idTokenResult.claims.isAdmin).toEqual(false);
  expect(idTokenResult.claims.organizationID).toEqual(soylentGreenID);
});

test('createUser works for emails with uppercase letters', async () => {
  await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
  
  const userRecord = (await createUser({
    email: 'UPPERCASE@email.com',
    password: 'password',
    firstName: 'test',
    lastName: 'user',
    isAdmin: false,
  })).data;

  testUid = userRecord.uid;
  
  // Check that the endpoint responded with the proper user
  expect(userRecord.email).toEqual('uppercase@email.com');

  // delay for 6 sec to allow functions.auth.user().onCreate to trigger and propagate
  await delay(DELAY);

  await clientAuth.signInWithEmailAndPassword('UPPERCASE@email.com', 'password');
  // Check that we can sign in with this user
  const currentUser = clientAuth.currentUser;
  if (currentUser === null) {
    throw new Error('clientAuth.currentUser returned null');
  }
  expect(currentUser.email).toEqual('uppercase@email.com');
  
  await delay(DELAY);
  const userDoc = await adminDb
    .collection('users')
    .doc('uppercase@email.com')
    .get();
  
    expect(userDoc.exists).toBe(true);
  // delete uppercase user to keep test idempotent
  await adminDb.collection('users').doc('uppercase@email.com').delete();
});

test('createUser fails if invalid request body', async () => {
  await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
  try {
    await createUser({
      email: testUserEmail,
      password: testUserEmail,
      // Missing required fields
    })
    fail('createUser returned a 200 despite improperly formatted request');
  } catch (err) {
    expect(err.code).toEqual('invalid-argument');
    expect(err.message).toEqual('Request body is invalidly formatted.');
  }
});

test('Attempting to sign up a user through clientAuth.createUserWithEmailAndPassword and not through createUser endpoint results in the user being deleted', async () => {
  const userCredential = await clientAuth
    .createUserWithEmailAndPassword(testUserEmail, testUserEmail);
  expect(userCredential.user?.email).toEqual(testUserEmail);
  if (userCredential.user) {
    testUid = userCredential.user.uid;
  }
  await delay(DELAY * 2);
  const user = await adminDb
    .doc('users/' + testUserEmail)
    .get();
  expect(user.exists).toEqual(false);
});

test("Manually added, improperly formatted user in users table can't be signed up", async () => {
  // set faulty document in users table
  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .set({
      isAdmin: false,
      // This is missing fields
    })

  // try to create corresponding user in Firebase auth
  await adminAuth
    .createUser({
      email: testUserEmail,
      password: testUserEmail,
    })
  
  // delay to allow onCreate to trigger and realize users table document is faulty
  await delay(DELAY * 2)

  // check that user has been deleted from Firebase Auth
  try {
    await adminAuth.getUserByEmail(testUserEmail);
    fail("Improperly formatted user should have been deleted from Auth but wasn't");
  } catch (err1) {
    expect(true).toEqual(true);
    const user = await adminDb
      .collection('users')
      .doc(testUserEmail)
      .get();
    expect(user.exists).toEqual(false);
  }
});

test("Manually added user in users table with non-existent organizationID can't be signed up", async () => {
  // set faulty document in users table
  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .set({
      isAdmin: false,
      organizationID: "This id doesn't exist",
      disabled: false,
      firstName: 'test',
      lastName: 'user',
    });

  // try to create corresponding user in Firebase auth
  await adminAuth
    .createUser({
      email: testUserEmail,
      password: testUserEmail,
    });

  // delay to allow onCreate to trigger and realize users table document is faulty
  await delay(DELAY * 2);

  // check that user has been deleted from Firebase Auth
  try {
    await adminAuth.getUserByEmail(testUserEmail);
    fail(
      "User with non-existent organizationID should have been deleted from Auth but wasn't"
    );
  } catch (err1) {
    expect(true).toEqual(true);
    const user = await adminDb
      .collection('users')
      .doc(testUserEmail)
      .get();
    expect(user.exists).toEqual(false);
  }
});

test("Manually added user in users table with empty string organizationID can't be signed up", async () => {
  // set faulty document in users table
  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .set({
      isAdmin: false,
      organizationID: '',
      disabled: false,
      firstName: 'test',
      lastName: 'user',
    });

  // try to create corresponding user in Firebase auth
  await adminAuth
    .createUser({
      email: testUserEmail,
      password: testUserEmail,
    });

  // delay to allow onCreate to trigger and realize users table document is faulty
  await delay(DELAY * 2)

  // check that user has been deleted from Firebase Auth
  try {
    await adminAuth.getUserByEmail(testUserEmail);
    fail(
      "User with empty string organizationID should have been deleted from Auth but wasn't"
    );
  } catch (err1) {
    expect(true).toEqual(true);
    const user = await adminDb
      .collection('users')
      .doc(testUserEmail)
      .get();
    expect(user.exists).toEqual(false);
  }
});

test('User can be toggled between enabled and disabled', async () => {
  // Create a new user to avoid race conditions
  await copyUser('disabled@soylentgreen.com', testUserEmail)

  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .update({
      disabled: false,
    });

  // Delay to allow userOnUpdate time to run
  await delay(DELAY * 5);

  const userRecordDisabled = await adminAuth.getUserByEmail(testUserEmail);
  expect(userRecordDisabled.disabled).toBe(false);
  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .update({
      disabled: true,
    });

    // Delay to allow userOnUpdate time to run
  await delay(DELAY * 5);

  const userRecordEnabled = await adminAuth.getUserByEmail(testUserEmail);
  expect(userRecordEnabled.disabled).toBe(true);
});

test('User can be toggled between isAdmin and not isAdmin', async () => {
  // Create a new user to avoid race conditions
  await copyUser('user@soylentgreen.com', testUserEmail)

  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .update({
      isAdmin: true,
    });

  // Delay to allow userOnUpdate time to run
  await delay(DELAY * 5);

  await clientAuth.signInWithEmailAndPassword(testUserEmail, testUserEmail);
  if (clientAuth.currentUser === null) {
    throw new Error('clientAuth.currentUser returned null');
  }

  // Check that isAdmin claim has been updated properly
  let idTokenResult = await clientAuth.currentUser.getIdTokenResult(true);
  expect(idTokenResult.claims.isAdmin).toEqual(true);

  await adminDb
    .collection('users')
    .doc(testUserEmail)
    .update({
      isAdmin: false,
    });

  // Delay to allow userOnUpdate time to run
  await delay(DELAY * 5);

  // Check that isAdmin claim has been updated properly
  idTokenResult = await clientAuth.currentUser.getIdTokenResult(true);
  expect(idTokenResult.claims.isAdmin).toEqual(false);
});
