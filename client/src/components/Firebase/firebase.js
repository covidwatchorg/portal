import app from 'firebase/app';
require('firebase/auth')
var config = require(`../../config/firebase.config.local.js`)
if(process.env.REACT_APP_ENV) {
  config = require(`../../config/firebase.config.${process.env.REACT_APP_ENV}.js`)
}

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();

  }
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);
  
  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

}
   
export default Firebase;