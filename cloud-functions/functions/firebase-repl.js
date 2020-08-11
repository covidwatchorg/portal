#!/usr/bin/env node

// Using the firebase-admin approach where database security rules do not apply.
// Here you are authenticating with a private key. The key JSON file is available via
// the Firebase web UI: project settings > service accounts > generate new private key.
var firebase = require('firebase/app');
require('firebase/functions');
var admin = require('firebase-admin');
require('firebase/auth');

const firebaseConfig = require(`./config/firebase.config.${process.env.NODE_ENV}.js`)

firebase.initializeApp(firebaseConfig);
admin.initializeApp(firebaseConfig);

// initialize firebase analytics
firebase.analytics();

var db = admin.firestore();

var repl = require('repl');

var replServer = repl.start({
  prompt: 'firebase> ',
});

replServer.context.firebase = firebase;
replServer.context.admin = admin;
replServer.context.db = db;
