import app from 'firebase/app';
import "firebase/auth";
import * as firebaseConfigLocal from '../../config/firebase.config.local';
import * as firebaseConfigDev from '../../config/firebase.config.dev';
import * as firebaseConfigTest from '../../config/firebase.config.test';
import * as firebaseConfigProd from '../../config/firebase.config.prod';
import "firebase/firestore";
import "firebase/database";


var firebaseConfigMap = { development: firebaseConfigDev , test: firebaseConfigTest, prod: firebaseConfigProd, local: firebaseConfigLocal};

var firebaseConfigFile;
console.log(`environment is : ${process.env.NODE_ENV}`);
var key = 'dev';
if (process.env) {
  key = process.env.NODE_ENV;
}
console.log (`firebase configuration in ${key}`)
var config = firebaseConfigMap[key];

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.firestore = app.firestore();
    this.db = app.database();
  }
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);
  
  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  generateUserDocument = async (user, additionalData) => {
    if (!user) return;
  
    const userRef = this.firestore.doc(`users/${user.email}`);
    const snapshot = await userRef.get();
  
    
    return this.getUserDocument(user.email);
  };
    
  getUserDocument = async uid => {
    if (!uid) return null;
    try {
      const userDocument = await this.firestore.doc(`users/${uid}`).get();
  
      return {
        uid,
        ...userDocument.data()
      };
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  getOrganizationDocument = async orgid => {
    if (!orgid) return null;
    try {
      const orgDocument = await this.firestore.doc(`organizations/${orgid}`).get();

      return orgDocument.data()
    } catch (err) {
      console.error("Error fetching organization", error);
    }
  };

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
             this.getUserDocument(authUser.email).then(userDoc => {
                if (!userDoc.roles) {
                  userDoc.roles = {
                    ADMIN: userDoc.isAdmin,
                    SUPER_ADMIN: userDoc.isSuperAdmin
                  }
                  
                }
                // merge auth and db user
                authUser = {
                  uid: authUser.uid,
                  email: authUser.email,
                  emailVerified: authUser.emailVerified,
                  providerData: authUser.providerData,
                  ...userDoc,
                };
                next(authUser);
              });
              
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = uid => this.db.ref(`/users/${uid}`);

  users = () => this.db.ref('/users');

}
export default new Firebase();