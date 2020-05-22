import { types, flow, getParent } from 'mobx-state-tree'
import { firebase } from '../components/Firebase'

const User = types
  .model({
    email: types.maybeNull(types.string),
    isAdmin: types.boolean,
    isSuperAdmin: types.boolean,
    disabled: types.boolean,
    prefix: types.maybeNull(types.string),
    firstName: types.string,
    lastName: types.string,
    organizationID: types.string,
  })
  .actions((self) => {
    const sendPasswordResetEmail = flow(function* () {
      try {
        yield firebase.sendPasswordResetEmail(self.email)
        return true
      } catch (err) {
        console.warn(err)
        return false
      }
    })

    return {
      sendPasswordResetEmail,
    }
  })

const Organization = types
  .model({
    name: types.string,
    welcomeText: types.maybeNull(types.string),
    enableExposureText: types.maybeNull(types.string),
    recommendExposureText: types.maybeNull(types.string),
    notifyingOthersText: types.maybeNull(types.string),
    exposureInfoText: types.maybeNull(types.string),
    exposureAboutText: types.maybeNull(types.string),
    exposureDetailsText: types.maybeNull(types.string),
    exposureDetailsLearnText: types.maybeNull(types.string),
    verificationStartText: types.maybeNull(types.string),
    verificationIdentifierText: types.maybeNull(types.string),
    verificationIdentifierAboutText: types.maybeNull(types.string),
    verificationAdministrationDateText: types.maybeNull(types.string),
    verificationReviewText: types.maybeNull(types.string),
    verificationSharedText: types.maybeNull(types.string),
    verificationNotSharedText: types.maybeNull(types.string),
    diagnosisText: types.string,
    exposureText: types.string,
    members: types.maybeNull(types.array(User)),
  })
  .actions((self) => {
    const store = getParent(self)
    const setOrganizationalBranding = flow(function* (diagnosisText, exposureText) {
      try {
        yield firebase.updateOrgTexts(store.user.organizationID, {
          diagnosisText: diagnosisText,
          exposureText: exposureText,
        })
        self.diagnosisText = diagnosisText
        self.exposureText = exposureText
        saveState(store)
      } catch (err) {
        console.warn(err)
        throw err
      }
    })

    return {
      setOrganizationalBranding,
    }
  })

const Store = types
  .model({
    user: types.maybeNull(User),
    organization: types.maybeNull(Organization),
  })
  .actions((self) => {
    const initialize = flow(function* () {
      try {
        const oldState = loadState()
        console.log(oldState)
        if (oldState) {
          console.log('Email', oldState.user.email)
          const userDoc = yield firebase.getUserDocument(oldState.user.email)
          self.user = { email: oldState.user.email, ...userDoc }
          let orgDoc = yield firebase.getOrganizationDocument(oldState.user.organizationID)
          self.organization = orgDoc

          if (oldState.user.isAdmin) {
            const members = yield firebase.getMembersOfOrg(oldState.user.organizationID)
            self.organization.members = members
          }
        } else {
          console.log('No cached user info')
        }
      } catch (err) {
        console.warn('unexpected error ', err)
      }
    })

    const signIn = flow(function* (email, password) {
      try {
        yield firebase.doSignInWithEmailAndPassword(email, password)
        console.log('Successfully logged in')

        yield firebase.auth.currentUser.getIdTokenResult(true)
        const userDoc = yield firebase.getUserDocument(email)

        self.user = { email: email, ...userDoc }

        const orgDoc = yield firebase.getOrganizationDocument(self.user.organizationID)

        self.organization = orgDoc

        if (self.user.isAdmin) {
          const members = yield firebase.getMembersOfOrg(self.user.organizationID)
          self.organization.members = members
        }

        saveState(self)
      } catch (e) {
        console.error(e)
      }
    })

    const signOut = flow(function* () {
      try {
        yield firebase.doSignOut()

        console.log('Successfully logged out')
        localStorage.removeItem('state')
        localStorage.removeItem('authUser')
        self.user.isAdmin = false
      } catch (e) {
        console.log(e)
      }
    })

    const sendMemberInvitationEmail = flow(function* (newUser) {
      try {
        yield firebase.doCreateUser(newUser)
      } catch (e) {
        throw e
      }
    })

    return {
      initialize,
      signIn,
      signOut,
      sendMemberInvitationEmail,
    }
  })

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (err) {
    console.warn(err)
  }
}

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) {
      return null
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return null
  }
}

var store = Store.create({
  user: null,
  organization: null,
})

export default store
