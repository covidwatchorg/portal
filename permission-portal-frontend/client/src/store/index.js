import React from 'react'
import { rootStore, defaultUser, defaultOrganization } from './model'
import { auth, db } from './firebase'

const RootStoreContext = React.createContext()

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      this.userDocumentListener = null
      this.userImageListener = null
      this.organizationDocumentListener = null
      this.organizationMembersListener = null
      this.authStateListener = auth.onAuthStateChanged(async (user) => {
        if (user) {
          console.log('User signed in')
          // get user's document from the db and at the same time set up a listener to respond to document changes
          if (this.userDocumentListener === null) {
            this.userDocumentListener = db
              .collection('users')
              .doc(user.email)
              .onSnapshot((updatedUserDocumentSnapshot) => {
                // update the store with data from this document and set isSignedIn to true
                rootStore.user.__update({
                  ...updatedUserDocumentSnapshot.data(),
                  email: updatedUserDocumentSnapshot.id,
                  isSignedIn: true,
                })
                // If DNE, set up organization listener within this callback,
                // since it relies on rootStore.user.organizationID being set
                if (this.organizationDocumentListener === null) {
                  this.organizationDocumentListener = db
                    .collection('organizations')
                    .doc(rootStore.user.organizationID)
                    .onSnapshot((updatedOrganizationDocumentSnapshot) => {
                      console.log('Remote organization document changed')
                      rootStore.organization.__update({
                        ...updatedOrganizationDocumentSnapshot.data(),
                        id: updatedOrganizationDocumentSnapshot.id,
                      })
                      if (rootStore.user.isAdmin && this.organizationMembersListener === null) {
                        this.organizationMembersListener = db
                          .collection('users')
                          .where('organizationID', '==', rootStore.organization.id)
                          // .orderBy('lastName')
                          // .orderBy('firstName')
                          .onSnapshot((updatedUsersSnapshot) => {
                            rootStore.organization.__setMembers(
                              // See https://stackoverflow.com/a/24806827
                              updatedUsersSnapshot.docs.reduce((result, userDoc) => {
                                if (userDoc.id !== rootStore.user.email) {
                                  result.push({ ...userDoc.data(), email: userDoc.id })
                                }
                                return result
                              }, [])
                            )
                          })
                      }
                    })
                }
              })
          }
          // Get and set up listener for user's image
          if (this.userImageListener === null) {
            this.userImageListener = db
              .collection('userImages')
              .doc(user.email)
              .onSnapshot((updatedUserImageDocumentSnapshot) => {
                if (updatedUserImageDocumentSnapshot.exists) {
                  rootStore.user.__update({
                    imageBlob: updatedUserImageDocumentSnapshot.data().blob,
                  })
                }
              })
          }
        } else {
          console.log('User signed out')
          // signed out
          // reset to default state
          rootStore.user.__update(defaultUser)
          rootStore.organization.__update(defaultOrganization)

          // detach listeners
          if (this.userDocumentListener !== null) {
            this.userDocumentListener()
            this.userDocumentListener = null
          }
          if (this.userImageListener !== null) {
            this.userImageListener()
            this.userImageListener = null
          }
          if (this.organizationDocumentListener !== null) {
            this.organizationDocumentListener()
            this.organizationDocumentListener = null
          }
          if (this.organizationMembersListener !== null) {
            this.organizationMembersListener()
            this.organizationMembersListener = null
          }
        }
      })
    }

    displayName = 'storeProvider'

    render() {
      return (
        <RootStoreContext.Provider value={rootStore}>
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

export { createStore, withStore }
