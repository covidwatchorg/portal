import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/functions'
import * as firebaseConfigLocal from '../../config/firebase.config.local'
import * as firebaseConfigDev from '../../config/firebase.config.dev'
import * as firebaseConfigTest from '../../config/firebase.config.test'
import * as firebaseConfigProd from '../../config/firebase.config.prod'
import * as firebaseConfigStaging from '../../config/firebase.config.staging'

var firebaseConfigMap = {
  development: firebaseConfigDev,
  test: firebaseConfigTest,
  prod: firebaseConfigProd,
  local: firebaseConfigLocal,
  staging: firebaseConfigStaging,
}

console.log(`environment is : ${process.env.NODE_ENV}`)
var key = 'dev'
if (process.env) {
  key = process.env.NODE_ENV
}
console.log(`firebase configuration in ${key}`)
var config = firebaseConfigMap[key]

class Firebase {
  constructor() {
    app.initializeApp(config)
    this.auth = app.auth()
    this.firestore = app.firestore()
    this.db = app.database()
  }

  doCreateUser = async (newUser) => {
    const createUser = app.functions().httpsCallable('createUser')
    try {
      const result = await createUser(newUser)
      console.log(`Created new user: ${JSON.stringify(result.data)}`)
      return result.data
    } catch (err) {
      throw err
    }
  }

  doSignInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password)

  doSignOut = () => this.auth.signOut()

  doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email)

  doPasswordUpdate = (password) => this.auth.currentUser.updatePassword(password)

  generateUserDocument = async (user) => {
    if (!user) return
    return this.getUserDocument(user.email)
  }

  getUserDocument = async (uid) => {
    if (!uid) return null
    try {
      const userDocument = await this.firestore.doc(`users/${uid}`).get()

      return {
        uid,
        ...userDocument.data(),
      }
    } catch (error) {
      console.error('Error fetching user', error)
    }
  }

  getOrganizationDocument = async (orgID) => {
    if (!orgID) return null
    try {
      const orgDocument = await this.firestore.doc(`organizations/${orgID}`).get()

      return orgDocument.data()
    } catch (error) {
      console.error('Error fetching organization', error)
    }
  }

  getMembersOfOrg = async (orgID) => {
    try {
      const snapshot = await this.firestore.collection('users').where('organizationID', '==', orgID).get()

      const userDocs = snapshot.docs.map((userDoc) => userDoc.data())
      return userDocs
    } catch (error) {
      console.error('Error fetching organization members', error)
    }
  }

  updateOrgTexts = async (orgID, texts) => {
    try {
      const sc = await this.firestore.collection('organizations').doc(orgID).update(texts)
      console.log('sc', sc)
    } catch (error) {
      console.error('Error updating organization texts', error)
    }
  }

  sendPasswordResetEmail = async (email) => {
    try {
      await this.auth.sendPasswordResetEmail(email)
    } catch (error) {
      console.error('Error sending password reset email', error)
      throw error;
    }
  }

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        authUser.getIdToken(/* forceRefresh */ true).then(
          () => {
            // if here, this user is still authorised.
            this.getUserDocument(authUser.email).then((userDoc) => {
              if (!userDoc.roles) {
                userDoc.roles = {
                  ADMIN: userDoc.isAdmin,
                  SUPER_ADMIN: userDoc.isSuperAdmin,
                }
              }
              // merge auth and db user
              authUser = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                providerData: authUser.providerData,
                ...userDoc,
              }
              next(authUser)
            })
          },
          (error) => {
            if (error.code === 'auth/user-token-expired') {
              // token invalidated. No action required as onAuthStateChanged will be fired again with null
              console.log('token expired. relogin')
            } else {
              console.error('Unexpected error: ' + error.code)
              fallback()
            }
          }
        )
      } else {
        fallback()
      }
    })

  // *** User API ***

  user = (uid) => this.db.ref(`/users/${uid}`)

  users = () => this.db.ref('/users')
}
export default new Firebase()
