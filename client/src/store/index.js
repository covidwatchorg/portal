import { types, flow } from 'mobx-state-tree'
import { firebase } from '../components/Firebase'

const User = types
  .model({
    uid: types.string,
    isAdmin: types.boolean,
    isSuperAdmin: types.boolean,
    prefix: types.string,
    firstName: types.string,
    lastName: types.string,
    role: types.string,
    organizationID: types.string
  });

const Organization = types
  .model({
    name: types.string,
    diagnosisText: types.string,
    exposureText: types.string
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

        self.user = userDoc
        console.log("user: ", self.user)

        const orgDoc = yield firebase.getOrganizationDocument(self.user.organizationID)

        self.organization = orgDoc
        console.log("organization: ", self.organization)
      } catch (e) {
        console.log(e)
      }
    })
    
    const signOut = flow(function* () {
      try {
        yield firebase.doSignOut()
        console.log('Successfully logged out')
        self.user.isAdmin = false
      } catch (e) {
        console.log(e)
      }
    })

    return {
      signIn,
      signOut
    }
  })

export default Store.create({
  user: null,
  organization: null
})
