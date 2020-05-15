import { types, flow } from 'mobx-state-tree'
import { firebase } from '../components/Firebase'

const User = types
  .model({
    uuid: types.string,
    isAdmin: types.boolean,
    isSuperAdmin: types.boolean,
    isActive: types.boolean,
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
    members: types.array(User)
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

        const orgDoc = yield firebase.getOrganizationDocument(self.user.organizationID)

        self.organization = orgDoc

        if (self.user.isAdmin) {
          const members = yield firebase.getMembersOfOrg(self.user.organizationID)
          self.organization.members = members
        }
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
