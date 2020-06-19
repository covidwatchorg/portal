import { clientDb, clientAuth, soylentGreenID, initechID } from './config';

describe("Unauthenticated users can't do anything", () => {
  test("Unauthenticated user can't read users", async () => {
    try {
      await clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .get();
      throw new Error('Unauthenticated user should not be able to read from users collection');
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('Missing or insufficient permissions.');
    }
  });

  test("Unauthenticated user can't write users", async () => {
    try {
      await clientDb
        .collection('users')
        .doc('some doc in users')
        .update({
          someField: 'someValue',
        });
      throw new Error('Unauthenticated user should not be able to write to users collection');
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
    }
  });

  test("Unauthenticated user can't read organizations", async () => {
    try {
      await clientDb
        .collection('organizations')
        .doc(soylentGreenID)
        .get();
      throw new Error('Unauthenticated user should not be able to read from organizations table');
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('Missing or insufficient permissions.');
    }
  });

  test("Unauthenticated user can't write organizations", async () => {
    try {
      await clientDb
        .collection('organizations')
        .doc('some doc in organizations')
        .update({
          someField: 'someValue',
        });
      throw new Error('Unauthenticated user should not be able to write to organizations table');
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
    }
  });
});

describe('Test proper read/write permissions for regular users (non-admins)', () => {
  test('Authenticated regular user can read his own data', async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    const userSnapshot = await clientDb
      .collection('users')
      .doc('user@soylentgreen.com')
      .get();
    expect(userSnapshot.id).toEqual('user@soylentgreen.com');
  });

  test('Authenticated regular user can write his own data', async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    await clientDb
      .collection('users')
      .doc('user@soylentgreen.com')
      .update({
        newField: 'newValue',
      });
    const userSnapshot = await clientDb
      .collection('users')
      .doc('user@soylentgreen.com')
      .get();
    const user = userSnapshot.data();
    expect(user).toBeDefined();
    expect(user!.newField).toEqual('newValue');
  });

  test('Authenticated user cannot escalate his privileges',  async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .update({
          isAdmin: 'true',
        });
      fail('user should not be able to escalate scope');
    }
    catch (err) {
      //console.log(err.code);
      expect(err.code).toEqual('permission-denied');
    }
  });

  test('Authenticated user cannot update his org',  async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .update({
          organizationID: '123'
        });
      fail('user should not be able to update org');
    }
    catch (err) {
      //console.log(err.code);
      expect(err.code).toEqual('permission-denied');
    }
  });

  test('Authenticated admin user cannot update his org',  async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .update({
          organizationID: '123'
        });
      fail('user should not be able to update org');
    }
    catch (err) {
      //console.log(err.code);
      expect(err.code).toEqual('permission-denied');
    }
  });

  test('Authenticated admin user cannot update other users org',  async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .update({
          organizationID: '123'
        });
      fail('user should not be able to update org');
    }
    catch (err) {
      //console.log(err.code);
      expect(err.code).toEqual('permission-denied');
    }
  });

  test('Authenticated user able to make regular non/role updates',  async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('user@soylentgreen.com')
        .update({
          firstName: 'Barry'
        });
    }
    catch (err) {
      //console.log(err.code);
      fail('user should be able to make regular updates');

    }
  });


  test("Authenticated regular user can't read other user's data", async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .get();
      throw new Error("Authenticated regular users should not be able to read other user's data");
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('Missing or insufficient permissions.');
      try {
        await clientDb
          .collection('users')
          .doc('admin@initech.com')
          .get();
        throw new Error("Authenticated regular users should not be able to read other user's data");
      }
      catch (err2) {
        expect(err2.code).toEqual('permission-denied');
        expect(err2.message).toEqual('Missing or insufficient permissions.');
        try {
          await clientDb
            .collection('users')
            .doc('user@initech.com')
            .get();
          throw new Error("Authenticated regular users should not be able to read other user's data");
        }
        catch (err3) {
          expect(err3.code).toEqual('permission-denied');
          expect(err3.message).toEqual('Missing or insufficient permissions.');
        }
      }
    }
  });

  test("Authenticated regular user can't write other user's data", async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('admin@soylentgreen.com')
        .update({
          newField: 'newValue',
        });
      throw new Error("Authenticated regular users should not be able to write other user's data");
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
      try {
        await clientDb
          .collection('users')
          .doc('admin@initech.com')
          .update({
            newField: 'newValue',
          });
        throw new Error("Authenticated regular users should not be able to read other user's data");
      }
      catch (err2) {
        expect(err2.code).toEqual('permission-denied');
        expect(err2.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
        try {
          await clientDb
            .collection('users')
            .doc('user@initech.com')
            .update({
              newField: 'newValue',
            });
          throw new Error("Authenticated regular users should not be able to read other user's data");
        }
        catch (err3) {
          expect(err3.code).toEqual('permission-denied');
          expect(err3.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
        }
      }
    }
  });

  test('Authenticated regular user can read his own organization', async () => {
    await clientAuth.signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    const idTokenResult = await clientAuth.currentUser!.getIdTokenResult(true);
    await clientDb
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
      });
  });

  test("Authenticated regular user can't read an organization he doesn't belong to", async () => {
    await clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    try {
      await clientDb
        .collection('organizations')
        .doc(initechID)
        .get();
      throw new Error(
        "Authenticated regular user shouldn't have been able to read an organization he doesn't belong to"
      );
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('Missing or insufficient permissions.');
    }
  });

  test("Authenticated regular user can't write his own organization", async () => {
    await clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    const idTokenResult = await clientAuth
      .currentUser!.getIdTokenResult(true);
    try {
      await clientDb
        .collection('organizations')
        .doc(idTokenResult.claims.organizationID)
        .update({
          newField: 'newValue',
        });
      throw new Error("Authenticated regular user shouldn't be able to write to his own organization");
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
    }
  });

  test("Authenticated regular user can't write an organization he doesn't belong to", async () => {
    await clientAuth
      .signInWithEmailAndPassword('user@soylentgreen.com', 'user@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    try {
      await clientDb
        .collection('organizations')
        .doc(initechID)
        .update({
          newField: 'newValue',
        });
      throw new Error(
        "Authenticated regular user shouldn't be able to write to an organization he doesn't belong to"
      );
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
    }
  });
});

describe('Test proper read/write permissions for admins', () => {
  test('Authenticated admin user can read his own data', async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    const userSnapshot = await clientDb
      .collection('users')
      .doc('admin@soylentgreen.com')
      .get();
    expect(userSnapshot.id).toEqual('admin@soylentgreen.com');
  });

  test("Authenticated admin user can read other users' data if they're in his organization", async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    const userSnapshot = await clientDb
      .collection('users')
      .doc('user@soylentgreen.com')
      .get();
    expect(userSnapshot.id).toEqual('user@soylentgreen.com');
  });

  test('Authenticated admin user can read a list of all the other users in his organization', async () => {
    await clientAuth.signInWithEmailAndPassword('admin@initech.com', 'admin@initech.com');
    const idTokenResult = await clientAuth.currentUser!.getIdTokenResult(true);
    const collectionsSnapshot = await clientDb
      .collection('users')
      .where('organizationID', '==', idTokenResult.claims.organizationID)
      .get();
    const userDocs = collectionsSnapshot.docs.map((userDoc) => userDoc.data());
    expect(userDocs.length).toEqual(3);
  });

  test("Authenticated admin user can't read other users' data if they're not in his organization", async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('admin@initech.com')
        .get();
      throw new Error(
        "Authenticated admin users should not be able to read other user's data if they're not in the same organization"
      );
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('Missing or insufficient permissions.');
      try {
        await clientDb
          .collection('users')
          .doc('user@initech.com')
          .get();
        throw new Error(
          "Authenticated admin users should not be able to read other user's data if they're not in the same organization"
        );
      }
      catch (err2) {
        expect(err2.code).toEqual('permission-denied');
        expect(err2.message).toEqual('Missing or insufficient permissions.');
      }
    }
  });

  test('Authenticated admin user can write his own data', async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    await clientDb
      .collection('users')
      .doc('admin@soylentgreen.com')
      .update({
        newField: 'newValue',
      });
    const userSnapshot = await clientDb
      .collection('users')
      .doc('admin@soylentgreen.com')
      .get();
    const user = userSnapshot.data();
    expect(user).toBeDefined();
    expect(user!.newField).toEqual('newValue');
  });

  test("Authenticated admin user can write another user's data if they're in his organization", async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    await clientDb
      .collection('users')
      .doc('user@soylentgreen.com')
      .update({
        newField: 'newValue',
      });
    const userSnapshot = await clientDb
      .collection('users')
      .doc('user@soylentgreen.com')
      .get();
    const user = userSnapshot.data();
    expect(user).toBeDefined();
    expect(user!.newField).toEqual('newValue');
  });

  test("Authenticated admin user can't write another user's data if they're not in his organization", async () => {
    await clientAuth.signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    try {
      await clientDb
        .collection('users')
        .doc('admin@initech.com')
        .update({
          newField: 'newValue',
        });
      throw new Error(
        "Authenticated admin users should not be able to write other user's data if they're not in the same organization"
      );
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
      try {
        await clientDb
          .collection('users')
          .doc('user@initech.com')
          .update({
            newField: 'newValue',
          });
        throw new Error(
          "Authenticated admin users should not be able to write other user's data if they're not in the same organization"
        );
      }
      catch (err2) {
        expect(err2.code).toEqual('permission-denied');
        expect(err2.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
      }
    }
  });

  test('Authenticated admin user can read his own organization', async () => {
    await clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    const idTokenResult = await clientAuth
      .currentUser!.getIdTokenResult(true);
    expect(idTokenResult.claims.isAdmin).toEqual(true);
    const orgSnapshot = await clientDb
      .collection('organizations')
      .doc(idTokenResult.claims.organizationID)
      .get();
    expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
    const org = orgSnapshot.data();
    expect(org).toBeDefined();
    expect(org!.name).toEqual('Soylent Green');
  });

  test("Authenticated admin user can't read an organization he doesn't belong to", async () => {
    await clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    const idTokenResult = await clientAuth
      .currentUser!.getIdTokenResult(true);
    expect(idTokenResult.claims.isAdmin).toEqual(true);
    try {
      await clientDb
        .collection('organizations')
        .doc(initechID)
        .get();
      throw new Error(
        "Authenticated admin user shouldn't have been able to read an organization he doesn't belong to"
      );
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('Missing or insufficient permissions.');
    }
  });

  test('Authenticated admin user can write his own organization', async () => {
    await clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    const idTokenResult = await clientAuth
      .currentUser!.getIdTokenResult(true);
    expect(idTokenResult.claims.isAdmin).toEqual(true);
    await clientDb
      .collection('organizations')
      .doc(idTokenResult.claims.organizationID)
      .update({
        newField: 'newValue',
      });
    const orgSnapshot = await clientDb
      .collection('organizations')
      .doc(idTokenResult.claims.organizationID)
      .get();
    expect(orgSnapshot.id).toEqual(idTokenResult.claims.organizationID);
    const org = orgSnapshot.data();
    expect(org).toBeDefined();
    expect(org!.newField).toEqual('newValue');
  });

  test("Authenticated admin user can't write to an organization he doesn't belong to", async () => {
    await clientAuth
      .signInWithEmailAndPassword('admin@soylentgreen.com', 'admin@soylentgreen.com');
    expect(clientAuth.currentUser).toBeTruthy();
    const idTokenResult = await clientAuth
      .currentUser!.getIdTokenResult(true);
    expect(idTokenResult.claims.isAdmin).toEqual(true);
    try {
      await clientDb
        .collection('organizations')
        .doc(initechID)
        .update({
          newField: 'newValue',
        });
      throw new Error(
        "Authenticated admin user shouldn't have been able to write to an organization he doesn't belong to"
      );
    }
    catch (err) {
      expect(err.code).toEqual('permission-denied');
      expect(err.message).toEqual('7 PERMISSION_DENIED: Missing or insufficient permissions.');
    }
  });
});
