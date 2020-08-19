import React from 'react'
import { rootStore, defaultUser, defaultOrganization } from './model'
import Logging from '../util/logging'
import {
  auth,
  db,
  SESSION,
  NONE,
  createUserCallable,
  initiatePasswordRecoveryCallable,
  getVerificationCodeCallable,
} from './firebase'
import imageCompression from 'browser-image-compression'

const PAGE_SIZE = 15

const RootStoreContext = React.createContext()

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      // Set auth persistence to SESSION for development so that every change registered by the hot-reload dev server doesn't log you out
      auth.setPersistence(process.env.NODE_ENV == 'development' ? SESSION : NONE)
      this.data = rootStore
      this.__userDocumentListener = null
      this.__userImageListener = null
      this.__organizationDocumentListener = null
      this.__membersListener = null
      this.__lastVisibleMember = null // pagination helper
      this.__firstVisibleMember = null // pagination helper
      this.__signedInWithEmailLink = false // firebase doesn't tell us this so we need to track it ourself
      this.__authStateListener = auth.onAuthStateChanged(async (user) => {
        if (user) {
          // get user's document from the db and at the same time set up a listener to respond to document changes
          if (this.__userDocumentListener === null) {
            this.__userDocumentListener = db
              .collection('users')
              .doc(user.email)
              .onSnapshot((updatedUserDocumentSnapshot) => {
                // update the store with data from this document and set isSignedIn to true
                this.data.user.__update({
                  ...updatedUserDocumentSnapshot.data(),
                  email: updatedUserDocumentSnapshot.id,
                  isSignedIn: true,
                  signedInWithEmailLink: this.__signedInWithEmailLink,
                })
                // If DNE, set up organization listener within this callback,
                // since it relies on this.data.user.organizationID being set
                if (this.__organizationDocumentListener === null) {
                  this.__organizationDocumentListener = db
                    .collection('organizations')
                    .doc(this.data.user.organizationID)
                    .onSnapshot((updatedOrganizationDocumentSnapshot) => {
                      this.data.organization.__update({
                        ...updatedOrganizationDocumentSnapshot.data(),
                        id: updatedOrganizationDocumentSnapshot.id,
                        currentPage: this.data.organization.currentPage,
                      })
                      if (this.data.user.isAdmin && this.__membersListener === null) {
                        var newListener = db
                          .collection('users')
                          .where('organizationID', '==', this.data.organization.id)
                          .orderBy('lastName')
                          .orderBy('firstName')
                          .onSnapshot((membersSnapshot) => {
                            this.__updateMembersOnSnapshot(membersSnapshot.docs, newListener)
                          })
                      }
                    })
                }
              })
          }
          // Get and set up listener for user's image
          if (this.__userImageListener === null) {
            this.__userImageListener = db
              .collection('userImages')
              .doc(user.email)
              .onSnapshot((updatedUserImageDocumentSnapshot) => {
                if (updatedUserImageDocumentSnapshot.exists) {
                  this.data.user.__update({
                    imageBlob: updatedUserImageDocumentSnapshot.data().imageBlob,
                  })
                }
              })
          }
        } else {
          // signed out
          // reset to default state
          this.data.user.__update(defaultUser)
          this.data.organization.__update(defaultOrganization)

          // detach listeners
          if (this.__userDocumentListener !== null) {
            this.__userDocumentListener()
            this.__userDocumentListener = null
          }
          if (this.__userImageListener !== null) {
            this.__userImageListener()
            this.__userImageListener = null
          }
          if (this.__organizationDocumentListener !== null) {
            this.__organizationDocumentListener()
            this.__organizationDocumentListener = null
          }
          if (this.__membersListener !== null) {
            this.__membersListener()
            this.__membersListener = null
          }
        }
      })
    }

    __updateMembersOnSnapshot(membersSnapshotDocs, newListener) {
      if (membersSnapshotDocs.length > 0) {
        if (this.__membersListener != newListener) {
          this.__membersListener = newListener
        }
        // Based on https://firebase.google.com/docs/firestore/query-data/query-cursors#paginate_a_query
        this.__firstVisibleMember = membersSnapshotDocs[0]
        this.__lastVisibleMember = membersSnapshotDocs[membersSnapshotDocs.length - 1]
        this.data.organization.__setMembers(
          // See https://stackoverflow.com/a/24806827
          membersSnapshotDocs.reduce((result, userDoc) => {
            if (userDoc.id !== this.data.user.email) {
              result.push({ ...userDoc.data(), email: userDoc.id })
            }
            return result
          }, [])
        )
      }
    }

    async updateUser(updates) {
      try {
        await db.collection('users').doc(this.data.user.email).update(updates)
      } catch (err) {
        Logging.error('Error updating users', err)
      }
    }

    async updateUserImage(imageBlob) {
      try {
        // .set() with { merge: true } so that if the document dne, it's created, otherwise its updated
        const options = { maxSizeMB: 0.6, maxWidthOrHeight: 900 }
        const compressedFile = await imageCompression(imageBlob, options)
        const dataURL = await imageCompression.getDataUrlFromFile(compressedFile)
        await db.collection('userImages').doc(this.data.user.email).set({ imageBlob: dataURL }, { merge: true })
      } catch (err) {
        Logging.error('Error updating image', err)
        throw err
      }
    }

    async updateOrganization(updates) {
      try {
        await db.collection('organizations').doc(this.data.organization.id).update(updates)
      } catch (err) {
        Logging.error('Error updating organization texts', err)
        throw err
      }
    }

    async signInWithEmailAndPassword(email, password) {
      this.__signedInWithEmailLink = false
      await auth.signInWithEmailAndPassword(email, password)
    }

    async signInWithEmailLink(email, link) {
      this.__signedInWithEmailLink = true
      return auth.signInWithEmailLink(email, link)
    }

    async signOut() {
      await auth.signOut()
    }

    async updatePassword(password) {
      await auth.currentUser.updatePassword(password)
    }

    async createUser(newUser) {
      try {
        const result = await createUserCallable(newUser)
        return result.data
      } catch (err) {
        Logging.log(err)
        throw err
      }
    }

    async sendPasswordRecoveryEmail(email) {
      try {
        await initiatePasswordRecoveryCallable({ email: email })
        // Save the email locally so you don't need to ask the user for it again if they open the link on the same device.
        // See https://firebase.google.com/docs/auth/web/email-link-auth#send_an_authentication_link_to_the_users_email_address
        window.localStorage.setItem('emailForSignIn', email)
        return true
      } catch (err) {
        Logging.error(err)
        throw err
      }
    }

    async updateUserByEmail(email, updates) {
      try {
        await db.collection('users').doc(email).update(updates)
      } catch (err) {
        Logging.error(`Error updating user: ${email}`, err)
        throw err
      }
    }

    // issueCodeRequest looks like {testType: "likely", symptomDate: "2020-07-02"} or {testType: "confirmed", symptomDate: "2020-07-02"}
    async getVerificationCode(issueCodeRequest) {
      try {
        return await getVerificationCodeCallable(issueCodeRequest)
      } catch (err) {
        Logging.error(err)
        throw err
      }
    }

    isSignInWithEmailLink(link) {
      return auth.isSignInWithEmailLink(link)
    }

    setPasswordResetCompletedInCurrentSession(val) {
      this.data.user.__update({ passwordResetCompletedInCurrentSession: val })
    }

    displayName = 'storeProvider'

    render() {
      return (
        <RootStoreContext.Provider value={this}>
          <WrappedComponent {...this.props} />
        </RootStoreContext.Provider>
      )
    }
  }
}

const withStore = (WrappedComponent) => {
  return class extends React.Component {
    displayName = 'storeConsumer'
    render() {
      return (
        <RootStoreContext.Consumer>
          {(store) => <WrappedComponent store={store} {...this.props} />}
        </RootStoreContext.Consumer>
      )
    }
  }
}

export { createStore, withStore, PAGE_SIZE }
