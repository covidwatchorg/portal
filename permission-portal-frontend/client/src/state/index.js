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
  membersPage: 1, // controls pagination
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
      this.authStateListener = this.auth.onAuthStateChanged(async (user) => {
        const state = this.state
        if (user) {
          console.log('User signed in')
          // signed in, get user's document from the db
          const userDocumentSnapshot = await this.db.collection('users').doc(user.email).get()
          // update the state object with data from this document and set isSignedIn to true
          state.user = { ...state.user, ...userDocumentSnapshot.data(), email: userDocumentSnapshot.id }
          state.user.isSignedIn = true

          const organizationID = userDocumentSnapshot.data().organizationID

          //  get the user's organization's document from the db
          const organizationDocumentSnapshot = await this.db.collection('organizations').doc(organizationID).get()
          // update state object with organization document data
          state.organization = {
            ...state.organization,
            ...organizationDocumentSnapshot.data(),
            id: organizationDocumentSnapshot.id,
          }

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
      get: (key) => {
        return this.state[key]
      },
      set: (key, value) => {
        const state = this.state
        state[key] = value
        this.setState(state)
      },
      remove: (key) => {
        const state = this.state
        delete state[key]
        this.setState(state)
      },
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
    }

    updateUserWithSnapshot(userDocumentSnapshot) {
      const state = this.state
      state.user = { ...state.user, ...userDocumentSnapshot.data(), email: userDocumentSnapshot.id }
      this.setState(state)
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
