import React from 'react'
import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/functions'
import * as firebaseConfigLocal from '../config/firebase.config.local'
import * as firebaseConfigDev from '../config/firebase.config.dev'
import * as firebaseConfigTest from '../config/firebase.config.test'
import * as firebaseConfigProd from '../config/firebase.config.prod'
import * as firebaseConfigStaging from '../config/firebase.config.staging'

var firebaseConfigMap = {
  development: firebaseConfigDev,
  test: firebaseConfigTest,
  prod: firebaseConfigProd,
  local: firebaseConfigLocal,
  staging: firebaseConfigStaging,
}

const config = firebaseConfigMap[process.env ? process.env.NODE_ENV : 'dev']

const StoreContext = React.createContext()

const defaultUser = {
  isSignedIn: false,
  email: '',
  isAdmin: false,
  isSuperAdmin: false,
  disabled: false,
  prefix: '',
  firstName: '',
  lastName: '',
  organizationID: '',
}

const defaultOrganization = {
  id: '',
  name: '',
  welcomeText: '',
  enableExposureText: '',
  recommendExposureText: '',
  notifyingOthersText: '',
  exposureInfoText: '',
  exposureAboutText: '',
  exposureDetailsText: '',
  exposureDetailsLearnText: '',
  verificationStartText: '',
  verificationIdentifierText: '',
  verificationIdentifierAboutText: '',
  verificationAdministrationDateText: '',
  verificationReviewText: '',
  verificationSharedText: '',
  verificationNotSharedText: '',
  diagnosisText: '',
  exposureText: '',
  membersPage: 1, // TODO: controls pagination
  members: [],
}

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      app.initializeApp(config)
      this.auth = app.auth()
      this.db = app.firestore()
      this.userDocumentListener = null
      this.organizationDocumentListener = null
      this.organizationMembersListener = null
      this.authStateListener = this.auth.onAuthStateChanged(async (user) => {
        const state = this.state
        if (user) {
          console.log('User signed in')
          // signed in, get user's document from the db
          const userDocumentSnapshot = await this.db.collection('users').doc(user.email).get()
          // update the state object with data from this document and set isSignedIn to true
          state.user = { ...state.user, ...userDocumentSnapshot.data(), email: userDocumentSnapshot.id }
          state.user.isSignedIn = true
          // set up a listener to respond to current user's document changes
          if (this.userDocumentListener === null) {
            this.userDocumentListener = this.db
              .collection('users')
              .doc(user.email)
              .onSnapshot((updatedUserDocumentSnapshot) => {
                console.log('Remote user document changed')
                state.user = {
                  ...state.user,
                  ...updatedUserDocumentSnapshot.data(),
                  email: updatedUserDocumentSnapshot.id,
                }
                this.setState(state)
                console.log('state set:')
                console.log(state)
              })
          }

          const organizationID = state.user.organizationID

          //  get the user's organization's document from the db
          const organizationDocumentSnapshot = await this.db.collection('organizations').doc(organizationID).get()
          // update state object with organization document data
          state.organization = {
            ...state.organization,
            ...organizationDocumentSnapshot.data(),
            id: organizationDocumentSnapshot.id,
          }
          // set up a listener to respond to current user's organization's document changes
          if (this.organizationDocumentListener === null) {
            this.organizationDocumentListener = this.db
              .collection('organizations')
              .doc(organizationID)
              .onSnapshot((updatedOrganizationDocumentSnapshot) => {
                console.log('Remote organization document changed')
                state.organization = {
                  ...state.organization,
                  ...updatedOrganizationDocumentSnapshot.data(),
                  id: updatedOrganizationDocumentSnapshot.id,
                }
                this.setState(state)
                console.log('state set:')
                console.log(state)
              })
          }

          if (state.user.isAdmin) {
            // If admin, get the user's organization's members from the db
            // TODO will want pagination
            const usersSnapshot = await this.db.collection('users').where('organizationID', '==', organizationID).get()
            state.organization.members = usersSnapshot.docs.map((userDoc) => userDoc.data())
            // Set up  a listener to respond to changes in current user's organization's members
            if (this.organizationMembersListener === null) {
              this.organizationMembersListener = this.db
                .collection('users')
                .where('organizationID', '==', organizationID)
                .onSnapshot((updatedUsersSnapshot) => {
                  state.organization.members = updatedUsersSnapshot.docs.map((userDoc) => userDoc.data())
                  this.setState(state)
                  console.log('state set:')
                  console.log(state)
                })
            }
          }
        } else {
          console.log('User signed out')
          // signed out
          // reset to default state
          state.user = defaultUser
          state.organization = defaultOrganization

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
        this.setState(state)
        console.log('state set:')
        console.log(state)
      })
    }

    displayName = 'storeProvider'

    state = {
      user: defaultUser,
      organization: defaultOrganization,
      signInWithEmailAndPassword: async (email, password) => {
        try {
          await this.auth.signInWithEmailAndPassword(email, password)
        } catch (err) {
          console.error(err)
        }
      },
      signOut: async () => {
        await this.auth.signOut()
      },
      sendPasswordResetEmail: async () => {
        try {
          await this.auth.sendPasswordResetEmail(this.state.user.email)
          return true
        } catch (err) {
          console.warn(err)
          return false
        }
      },
      updateOrganization: async (updatesObject) => {
        try {
          await this.db.collection('organizations').doc(this.state.organization.id).update(updatesObject)
        } catch (err) {
          console.error('Error updating organization texts', err)
        }
      },
      createUser: async (newUser) => {
        const createUser = app.functions().httpsCallable('createUser')
        try {
          const result = await createUser(newUser)
          console.log(`Created new user: ${JSON.stringify(result.data)}`)
          return result.data
        } catch (err) {
          throw err
        }
      },
    }

    render() {
      return (
        <StoreContext.Provider value={this.state}>
          <WrappedComponent {...this.props} />
        </StoreContext.Provider>
      )
    }
  }
}

const withStore = (WrappedComponent) => {
  return class extends React.Component {
    displayName = 'storeConsumer'
    render() {
      return (
        <StoreContext.Consumer>{(store) => <WrappedComponent store={store} {...this.props} />}</StoreContext.Consumer>
      )
    }
  }
}

export { createStore, withStore }
