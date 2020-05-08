#!/usr/bin/env node

// Using the firebase-admin approach where database security rules do not apply.
// Here you are authenticating with a private key. The key JSON file is available via
// the Firebase web UI: project settings > service accounts > generate new private key.
var firebase = require('firebase/app');
require('firebase/functions');
var admin = require('firebase-admin');
require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId
}

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
