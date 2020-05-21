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

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      app.initializeApp(config)
      this.auth = app.auth()
      this.db = app.firestore()
      this.authStateListener = this.auth.onAuthStateChanged(async (user) => {
        const state = this.state
        if (user) {
          // signed in, get user's document from the db
          const userDocumentSnapshot = await this.db.collection('users').doc(user.email).get()
          // update the state object with data from this document and set isSignedIn to true
          this.updateUserWithSnapshot(userDocumentSnapshot)
          state.user.isSignedIn = true

          // set up a listener to respond to current user's document changes
          this.userDocumentListener = this.db
            .collection('users')
            .doc(user.email)
            .onSnapshot((updatedUserDocumentSnapshot) => {
              this.updateUserWithSnapshot(updatedUserDocumentSnapshot)
            })
        } else {
          // signed out
          // reset user to default state
          state.user = defaultUser

          // detach listener
          this.userDocumentListener()
        }
        this.setState(state)
      })
    }

    displayName = 'storeProvider'

    state = {
      user: defaultUser,
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
