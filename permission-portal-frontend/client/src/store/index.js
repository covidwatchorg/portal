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
import { types, cast, flow } from 'mobx-state-tree'

var firebaseConfigMap = {
  development: firebaseConfigDev,
  test: firebaseConfigTest,
  production: firebaseConfigProd,
  local: firebaseConfigLocal,
  staging: firebaseConfigStaging,
}

const config = firebaseConfigMap[process.env ? process.env.NODE_ENV : 'development']

console.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`)

app.initializeApp(config)
const auth = app.auth()
const db = app.firestore()
const createUserCallable = app.functions().httpsCallable('createUser')

const RootStoreContext = React.createContext()

const User = types
  .model({
    isSignedIn: types.maybe(types.boolean),
    email: types.string,
    isAdmin: types.boolean,
    isSuperAdmin: types.boolean,
    disabled: types.boolean,
    prefix: types.maybe(types.string),
    imageBlob: types.maybeNull(types.string),
    firstName: types.string,
    lastName: types.string,
    organizationID: types.string,
  })
  .actions((self) => {
    const __update = (updates) => {
      Object.keys(updates).forEach((key) => {
        if (self.hasOwnProperty(key)) self[key] = updates[key] // eslint-disable-line no-prototype-builtins
      })
      console.log('Updated User:')
      console.log(self)
    }
    const update = flow(function* (updates) {
      try {
        yield db.collection('users').doc(self.email).update(updates)
      } catch (err) {
        console.error('Error updating users', err)
      }
    })
    const updateImage = flow(function* (blob) {
      try {
        // .set() with { merge: true } so that if the document dne, it's created, otherwise its updated
        yield db.collection('userImages').doc(self.email).set({ blob: blob }, { merge: true })
      } catch (err) {
        console.error('Error updating image', err)
      }
    })

    return { __update, update, updateImage }
  })

const Organization = types
  .model({
    id: types.string,
    name: types.string,
    welcomeText: types.string,
    enableExposureText: types.string,
    recommendExposureText: types.string,
    notifyingOthersText: types.string,
    exposureInfoText: types.string,
    exposureAboutText: types.string,
    exposureDetailsText: types.string,
    exposureDetailsLearnText: types.string,
    verificationStartText: types.string,
    verificationIdentifierText: types.string,
    verificationIdentifierAboutText: types.string,
    verificationAdministrationDateText: types.string,
    verificationReviewText: types.string,
    verificationSharedText: types.string,
    verificationNotSharedText: types.string,
    diagnosisText: types.string,
    exposureText: types.string,
    membersPage: types.number, // TODO: controls pagination
    members: types.array(User),
  })
  .actions((self) => {
    const __update = (updates) => {
      Object.keys(updates).forEach((key) => {
        if (self.hasOwnProperty(key)) self[key] = updates[key] // eslint-disable-line no-prototype-builtins
      })
      console.log('Updated Organization:')
      console.log(self)
    }

    const update = flow(function* (updates) {
      try {
        yield db.collection('organizations').doc(self.id).update(updates)
      } catch (err) {
        console.error('Error updating organization texts', err)
      }
    })

    const __setMembers = (members) => {
      self.members = cast(members)
      console.log('Set members:')
      console.log(self.members)
    }

    return { __update, __setMembers, update }
  })

const Store = types
  .model({
    user: User,
    organization: Organization,
  })
  .actions(() => {
    const signInWithEmailAndPassword = flow(function* (email, password) {
      yield auth.signInWithEmailAndPassword(email, password)
    })

    const signOut = flow(function* () {
      yield auth.signOut()
    })

    const createUser = flow(function* (newUser) {
      try {
        const result = yield createUserCallable(newUser)
        console.log(`Created new user: ${JSON.stringify(result.data)}`)
        return result.data
      } catch (err) {
        console.log(err)
        throw err
      }
    })

    const sendPasswordResetEmail = flow(function* (email) {
      try {
        yield auth.sendPasswordResetEmail(email)
        return true
      } catch (err) {
        console.warn(err)
        return false
      }
    })

    return { signInWithEmailAndPassword, signOut, createUser, sendPasswordResetEmail }
  })

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
  imageBlob: null,
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
  membersPage: 1,
  members: [],
}

const rootStore = Store.create({
  user: defaultUser,
  organization: defaultOrganization,
})

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
            console.warn(userImageDocumentSnapshot)
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
            // TODO will want pagination
            const usersSnapshot = await db.collection('users').where('organizationID', '==', organizationID).get()
            rootStore.organization.__setMembers(
              usersSnapshot.docs.map((userDoc) => {
                return { ...userDoc.data(), email: userDoc.id }
              })
            )
            // Set up  a listener to respond to changes in current user's organization's members
            if (this.organizationMembersListener === null) {
              this.organizationMembersListener = db
                .collection('users')
                .where('organizationID', '==', organizationID)
                .onSnapshot((updatedUsersSnapshot) => {
                  rootStore.organization.__setMembers(
                    updatedUsersSnapshot.docs.map((userDoc) => {
                      return { ...userDoc.data(), email: userDoc.id }
                    })
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
