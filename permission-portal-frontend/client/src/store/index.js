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
          // signed in, get user's document from the db
          const userDocumentSnapshot = await db.collection('users').doc(user.email).get()
          // update the store with data from this document and set isSignedIn to true
          rootStore.user.__update({ ...userDocumentSnapshot.data(), email: userDocumentSnapshot.id, isSignedIn: true })
          // set up a listener to respond to current user's document changes
          if (this.userDocumentListener === null) {
            this.userDocumentListener = db
              .collection('users')
              .doc(user.email)
              .onSnapshot((updatedUserDocumentSnapshot) => {
                console.log('Remote user document changed')
                rootStore.user.__update({
                  ...updatedUserDocumentSnapshot.data(),
                  email: updatedUserDocumentSnapshot.id,
                  isSignedIn: true,
                })
              })
          }

          const userImageDocumentSnapshot = await db.collection('userImages').doc(user.email).get()
          if (userImageDocumentSnapshot.exists) {
            rootStore.user.__update({
              imageBlob: userImageDocumentSnapshot.data().blob,
            })
          }
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

          const organizationID = rootStore.user.organizationID

          //  get the user's organization's document from the db
          const organizationDocumentSnapshot = await db.collection('organizations').doc(organizationID).get()
          // update state object with organization document data
          rootStore.organization.__update({
            ...organizationDocumentSnapshot.data(),
            id: organizationDocumentSnapshot.id,
          })

          // set up a listener to respond to current user's organization's document changes
          if (this.organizationDocumentListener === null) {
            this.organizationDocumentListener = db
              .collection('organizations')
              .doc(organizationID)
              .onSnapshot((updatedOrganizationDocumentSnapshot) => {
                console.log('Remote organization document changed')
                rootStore.organization.__update({
                  ...updatedOrganizationDocumentSnapshot.data(),
                  id: updatedOrganizationDocumentSnapshot.id,
                })
              })
          }

          if (rootStore.user.isAdmin) {
            // If admin, get the user's organization's members from the db
            const usersSnapshot = await db.collection('users').where('organizationID', '==', organizationID).get()
            rootStore.organization.__setMembers(
              // See https://stackoverflow.com/a/24806827
              usersSnapshot.docs.reduce((result, userDoc) => {
                if (userDoc.id !== rootStore.user.email) {
                  result.push({ ...userDoc.data(), email: userDoc.id })
                }
                return result
              }, [])
            )
            // Set up  a listener to respond to changes in current user's organization's members
            if (this.organizationMembersListener === null) {
              this.organizationMembersListener = db
                .collection('users')
                .where('organizationID', '==', organizationID)
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
