// var firebaseConfig = {
//   apiKey: 'AIzaSyAHVZXO-wFnGmUIBLxF6-mY3tuleK4ENVo',
//   authDomain: 'permission-portal-test.firebaseapp.com',
//   databaseURL: 'https://permission-portal-test.firebaseio.com',
//   projectId: 'permission-portal-test',
//   storageBucket: 'permission-portal-test.appspot.com',
//   messagingSenderId: '1090782248577',
//   appId: '1:1090782248577:web:184d481f492cfa4edc1780',
// };

// const test = require('firebase-functions-test')(firebaseConfig);
// const myFunctions = require('../lib/index.js'); // relative path to functions code
// // const firebase = require('firebase/app');
// // const auth = require('firebase/auth');
// // // require('firebase/firestore');

// // // Initialize Firebase
// // firebase.initializeApp(firebaseConfig);
// const wrapped = test.wrap(myFunctions.createUser);

// wrapped({ email: 'test@covid-watch.org' }).then((resp) => {
//   assert.typeOf(resp, 'string');
// });

it('subtracts 5 - 1 to equal 4 in TypeScript', () => {
  expect(5 - 1).toBe(4);
});
