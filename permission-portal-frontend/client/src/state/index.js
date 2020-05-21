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

var config = firebaseConfigMap[process.env ? process.env.NODE_ENV : 'dev']

const StoreContext = React.createContext()

const createStore = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props)
      app.initializeApp(config)
      this.auth = app.auth()
      this.db = app.firestore()
      this.authStateListener = this.auth.onAuthStateChanged((user) => {
        const state = this.state
        if (user) {
          state.user.isSignedIn = true
        } else {
          state.user.isSignedIn = false
        }
        this.setState(state)
      })
    }

    displayName = 'storeProvider'

    state = {
      user: {
        isSignedIn: false,
        email: '',
        isAdmin: false,
        isSuperAdmin: false,
        disabled: false,
        prefix: '',
        firstName: '',
        lastName: '',
        organizationID: '',
      },
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
        const state = this.state
        try {
          const userCredential = await this.auth.signInWithEmailAndPassword(email, password)
          const userDocumentSnapshot = await this.db.collection('users').doc(userCredential.user.email).get()
          state.user = { ...userDocumentSnapshot.data(), email: userDocumentSnapshot.id, isSignedIn: true }
          this.setState(state)
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