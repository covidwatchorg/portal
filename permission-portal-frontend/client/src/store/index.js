import { types, flow , onSnapshot, getSnapshot, getParent } from 'mobx-state-tree'
import { firebase } from '../components/Firebase'


const User = types
  .model({
    uuid: types.string,
    email: types.maybeNull(types.string),
    isAdmin: types.boolean,
    isSuperAdmin: types.boolean,
    disabled: types.boolean,
    prefix: types.string,
    firstName: types.string,
    lastName: types.string,
    organizationID: types.string
  });

const Organization = types
  .model({
    name: types.string,
    diagnosisText: types.string,
    exposureText: types.string,
    members: types.maybeNull(types.array(User))
  })
  .actions(self => {
    const store = getParent(self)
    const setOrganizationalBranding = flow(function* (diagnosisText, exposureText) {
      try {
        yield firebase.updateOrgTexts(store.user.organizationID, {
          diagnosisText: diagnosisText,
          exposureText: exposureText
        })
        self.diagnosisText = diagnosisText
        self.exposureText = exposureText
        saveState(store)
      } catch (err) {
        console.warn(err)
      }
    })

    return {
      setOrganizationalBranding
    }
  })

const Store = types
  .model({
    user: types.maybeNull(User),
    organization: types.maybeNull(Organization)
  })
  .actions((self) => {
    const signIn = flow(function* (email, password) {
      try {
        yield firebase.doSignInWithEmailAndPassword(email, password)
        console.log('Successfully logged in')

        yield firebase.auth.currentUser.getIdTokenResult(true)
        const userDoc = yield firebase.getUserDocument(email)

        self.user = {email: email, ...userDoc}

        const orgDoc = yield firebase.getOrganizationDocument(self.user.organizationID)

        self.organization = orgDoc

        if (self.user.isAdmin) {
          const members = yield firebase.getMembersOfOrg(self.user.organizationID)
          self.organization.members = members
        }

        saveState(self)
      } catch (e) {
        console.log(e)
      }
    })

    const afterCreate = flow(function* () {
      try {
        const oldState = loadState()
        console.log(oldState)
        if (oldState) {
          console.log('Email', oldState.user.email)
          const userDoc = yield firebase.getUserDocument(oldState.user.email)
    
          self.user = userDoc
          console.log(self.user)
    
          const orgDoc = yield firebase.getOrganizationDocument(oldState.user.organizationID)
    
          self.organization = orgDoc
    
          if (oldState.user.isAdmin) {
            const members = yield firebase.getMembersOfOrg(oldState.user.organizationID)
            self.organization.members = members
          }
          console.log(self.organization)
        }
      } catch (err) {
        console.warn('unexpected error ', err);
      }
    })
    
    const signOut = flow(function* () {
      try {
        yield firebase.doSignOut()

        console.log('Successfully logged out')
        localStorage.removeItem('state');
        localStorage.removeItem('authUser');
        self.user.isAdmin = false
      } catch (e) {
        console.log(e)
      }
    })

    const sendMemberInvitationEmail = flow(function* (state) {
      // TODO state validation
      throw "TODO implement sendMemberInvitationEmail";
    })

    return {
      signIn,
      signOut,
      afterCreate,
      sendMemberInvitationEmail
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
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return null
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return null
  }
}

var store = Store.create((() => {
  try {
    const snapshot = loadState()
    if (snapshot) {
      console.log('Data', snapshot)
      self = snapshot
    }
  } catch (err) {
    console.warn('unexpected error ', err);
  }
})());

export default store;