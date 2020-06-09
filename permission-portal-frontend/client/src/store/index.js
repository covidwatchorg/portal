import React from 'react'
import { rootStore, defaultUser, defaultOrganization } from './model'
import { auth, db } from './firebase'

const PAGE_SIZE = 15

const RootStoreContext = React.createContext()

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.data = rootStore
      this.__userDocumentListener = null
      this.__userImageListener = null
      this.__organizationDocumentListener = null
      this.__pageOfMembersListener = null
      this.__lastVisibleMember = null // pagination helper
      this.__firstVisibleMember = null // pagination helper
      this.__authStateListener = auth.onAuthStateChanged(async (user) => {
        if (user) {
          console.log('User signed in')
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
                })
                // If DNE, set up organization listener within this callback,
                // since it relies on this.data.user.organizationID being set
                if (this.__organizationDocumentListener === null) {
                  this.__organizationDocumentListener = db
                    .collection('organizations')
                    .doc(this.data.user.organizationID)
                    .onSnapshot((updatedOrganizationDocumentSnapshot) => {
                      console.log('Remote organization document changed')
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
          console.log('User signed out')
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
