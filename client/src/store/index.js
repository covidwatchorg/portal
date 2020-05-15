import { types, flow , onSnapshot, getRoot, getSnapshot} from 'mobx-state-tree'
import { firebase } from '../components/Firebase'


const User = types
  .model({
    uuid: types.string, 
    uid: types.string,
    isAdmin: types.boolean,
    isSuperAdmin: types.boolean,
    prefix: types.string,
    firstName: types.string,
    lastName: types.string,
    role: types.optional(types.string, "", [null, undefined]),
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
      signOut,
       afterCreate() {
        onSnapshot(self, () => {
          try {
            const transformedSnapshot = getSnapshot(self);
            saveState(transformedSnapshot)
          } catch (err) {
            console.warn('unexpected error ' + err);
          }
        });
      }
    }
  })

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};


export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    // Ignore write errors.
  }
};


var store = loadState();
if(!store) {
  store = Store.create({
    user: null,
    organization: null
  });
}

export default store;