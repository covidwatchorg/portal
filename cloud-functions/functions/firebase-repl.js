#!/usr/bin/env node

// Using the firebase-admin approach where database security rules do not apply.
// Here you are authenticating with a private key. The key JSON file is available via
// the Firebase web UI: project settings > service accounts > generate new private key.
var firebase = require('firebase/app');
require('firebase/functions');
var admin = require('firebase-admin');

// admin.initializeApp({
//   credential: admin.credential.cert('service-account-credentials.json'),
//   databaseURL: 'https://permission-portal.firebaseio.com',
// });

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
admin.initializeApp(firebaseConfig);

var db = admin.firestore();

var repl = require('repl');

var replServer = repl.start({
  prompt: 'firebase> ',
});

replServer.context.firebase = firebase;
replServer.context.admin = admin;
replServer.context.db = db;
