import React from 'react'
import { rootStore, defaultUser, defaultOrganization } from './model'
import Logging from '../util/logging'
import { auth, db, SESSION, createUserCallable, initiatePasswordRecoveryCallable } from './firebase'

const PAGE_SIZE = 15

const RootStoreContext = React.createContext()

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      auth.setPersistence(SESSION)
      this.data = rootStore
      this.__userDocumentListener = null
      this.__userImageListener = null
      this.__organizationDocumentListener = null
      this.__pageOfMembersListener = null
      this.__lastVisibleMember = null // pagination helper
      this.__firstVisibleMember = null // pagination helper
      this.__signedInWithEmailLink = false // firebase doesn't tell us this so we need to track it ourself
      this.__authStateListener = auth.onAuthStateChanged(async (user) => {
        if (user) {
          Logging.log('User signed in')
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
                      Logging.log('Remote organization document changed')
                      this.data.organization.__update({
                        ...updatedOrganizationDocumentSnapshot.data(),
                        id: updatedOrganizationDocumentSnapshot.id,
                        currentPage: this.data.organization.currentPage,
                      })
                      if (this.data.user.isAdmin && this.__pageOfMembersListener === null) {
                        var newListener = db
                          .collection('users')
                          .where('organizationID', '==', this.data.organization.id)
                          .orderBy('lastName')
                          .orderBy('firstName')
                          .limit(PAGE_SIZE)
                          .onSnapshot((pageOfMembersSnapshot) => {
                            this.__updatePageOfMembersOnSnapshot(pageOfMembersSnapshot.docs, newListener)
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
                    imageBlob: updatedUserImageDocumentSnapshot.data().blob,
                  })
                }
              })
          }
        } else {
          Logging.log('User signed out')
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
          if (this.__pageOfMembersListener !== null) {
            this.__pageOfMembersListener()
            this.__pageOfMembersListener = null
          }
        }
      })
    }

    __updatePageOfMembersOnSnapshot(pageOfMembersSnapshotDocs, newListener) {
      if (pageOfMembersSnapshotDocs.length > 0) {
        if (this.__pageOfMembersListener != newListener) {
          this.__pageOfMembersListener = newListener
        }
        // Based on https://firebase.google.com/docs/firestore/query-data/query-cursors#paginate_a_query
        this.__firstVisibleMember = pageOfMembersSnapshotDocs[0]
        this.__lastVisibleMember = pageOfMembersSnapshotDocs[pageOfMembersSnapshotDocs.length - 1]
        this.data.organization.__setCurrentPageOfMembers(
          // See https://stackoverflow.com/a/24806827
          pageOfMembersSnapshotDocs.reduce((result, userDoc) => {
            if (userDoc.id !== this.data.user.email) {
              result.push({ ...userDoc.data(), email: userDoc.id })
            }
            return result
          }, [])
        )
      }
    }

    nextPageOfMembers() {
      var newListener = db
        .collection('users')
        .where('organizationID', '==', this.data.organization.id)
        .orderBy('lastName')
        .orderBy('firstName')
        .startAfter(this.__lastVisibleMember)
        .limit(PAGE_SIZE)
        .onSnapshot((pageOfMembersSnapshot) => {
          this.__updatePageOfMembersOnSnapshot(pageOfMembersSnapshot.docs, newListener)
        })
    }

    previousPageOfMembers() {
      var newListener = db
        .collection('users')
        .where('organizationID', '==', this.data.organization.id)
        .orderBy('lastName', 'desc')
        .orderBy('firstName', 'desc')
        .startAfter(this.__firstVisibleMember)
        .limit(PAGE_SIZE)
        .onSnapshot((pageOfMembersSnapshot) => {
          this.__updatePageOfMembersOnSnapshot(pageOfMembersSnapshot.docs.reverse(), newListener)
        })
    }

    async updateUser(updates) {
      try {
        await db.collection('users').doc(this.data.user.email).update(updates)
      } catch (err) {
        Logging.error('Error updating users', err)
      }
    }

    async updateUserImage(blob) {
      try {
        // .set() with { merge: true } so that if the document dne, it's created, otherwise its updated
        await db.collection('userImages').doc(this.data.user.email).set({ blob: blob }, { merge: true })
      } catch (err) {
        Logging.error('Error updating image', err)
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
        Logging.log(`Created new user: ${JSON.stringify(result.data)}`)
        return result.data
      } catch (err) {
        Logging.log(err)
        throw err
      }
    }

    async sendPasswordResetEmail(email) {
      try {
        await auth.sendPasswordResetEmail(email)
        return true
      } catch (err) {
        Logging.error(err)
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
