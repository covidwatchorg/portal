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

// const db = firebase.firestore();

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
  jest.setTimeout(30000);
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

// test('createUser works for admins', () => {
//   const createUser = firebase.functions().httpsCallable('createUser');
//   firebase
//     .auth()
//     .signInWithEmailAndPassword('testuser@isadmin.com', 'isadmin')
//     .then(() => {
//       createUser({ email: 'test@email.com', password: 'password' })
//         .then((result) => result.data)
//         .then((userRecord) => {
//           // Check that the endpoint responded with the proper user
//           expect(userRecord.email).toEqual('test@email.com');
//           firebase
//             .auth()
//             .signInWithEmailAndPassword('test@email.com', 'password')
//             .then(() => {
//               // Check that we can sign in with this user
//               const currentUser = firebase.auth().currentUser;
//               if (currentUser === null) {
//                 throw new Error("This shouldn't happen!");
//               }
//               expect(currentUser.email).toEqual('test@email.com');
//               // Check that we have a corresponding user in our users collection whose uuid field has been filled out appropriately
//               db.collection('users')
//                 .doc('test@email.com')
//                 .get()
//                 .then((userSnapshot) => userSnapshot.data())
//                 .then((user) => {
//                   if (user !== undefined) {
//                     throw new Error('No such document!');
//                     // expect(user.uuid).toEqual(currentUser.uid);
//                   } else {
//                     throw new Error('No such document!');
//                   }
//                 })
//                 .catch(function (error) {
//                   throw new Error('Error getting document:' + error);
//                 });
//             })
//             .catch((err) => {
//               throw new Error("This shouldn't happen!");
//             });
//         })
//         .catch((err) => {
//           throw new Error("This shouldn't happen!");
//         });
//     })
//     .catch((err) => {
//       throw Error("This shouldn't happen!");
//     });
// });

// const createUser = firebase.functions().httpsCallable('createUser');
// var er1;
// var er2;
// var res;
// firebase
//   .auth()
//   .signInWithEmailAndPassword('testuser@isadmin.com', 'isadmin')
//   .then(() => {
//     createUser({ email: 'test@email.com', password: 'password' })
//       .then((result) => {
//         res = result;
//       })
//       .catch((err) => {
//         er1 = err;
//       });
//   })
//   .catch((err) => {
//     er2 = err;
//   });

// firebase
//   .auth()
//   .signInWithEmailAndPassword('testuser@normaluser.com', 'normaluser')
//   .then(() => {
//     createUser({ email: 'test@email.com', password: 'password' })
//       .then((result) => {
//         throw new Error("This shouldn't happen!");
//       })
//       .catch((err) => {
//         expect(err.code).toEqual('failed-precondition');
//         expect(err.message).toEqual('The function must be called by an admin');
//       });
//   })
//   .catch((err) => {
//     throw Error("This shouldn't happen!");
//   });
