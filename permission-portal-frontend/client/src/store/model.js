import { types, cast, flow, onSnapshot } from 'mobx-state-tree'
import { auth, db, createUserCallable, deleteUserCallable, SESSION } from './firebase'
import 'mobx-react-lite/batchingForReactDom'

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
    currentPageOfMembers: types.array(User),
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
        throw err
      }
    })

    const __setCurrentPageOfMembers = (pageOfMembers) => {
      self.currentPageOfMembers = cast(pageOfMembers)
    }

    return { __update, __setCurrentPageOfMembers, update }
  })

const Store = types
  .model({
    user: User,
    organization: Organization,
  })
  .actions(() => {
    const signInWithEmailAndPassword = flow(function* (email, password) {
      yield auth.setPersistence(SESSION)
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

    const deleteUser = flow(function* (email) {
      try {
        const result = yield deleteUserCallable({ email: email })
        console.log(result)
        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    })

    const sendPasswordResetEmail = flow(function* (email) {
      try {
        yield auth.sendPasswordResetEmail(email)
        return true
      } catch (err) {
        console.error(err)
        throw err
      }
    })

    const updateUserByEmail = flow(function* (email, updates) {
      try {
        yield db.collection('users').doc(email).update(updates)
      } catch (err) {
        console.error(`Error updating user: ${email}`, err)
        throw err
      }
    })

    return { signInWithEmailAndPassword, signOut, createUser, deleteUser, sendPasswordResetEmail, updateUserByEmail }
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
  currentPageOfMembers: [],
}

const defaultStore = {
  user: defaultUser,
  organization: defaultOrganization,
}

let initialStore = defaultStore

// Based on https://egghead.io/lessons/react-store-store-in-local-storage
if (localStorage.getItem('store')) {
  initialStore = JSON.parse(localStorage.getItem('store'))
}

const rootStore = Store.create({
  ...initialStore,
})

// Based on https://egghead.io/lessons/react-store-store-in-local-storage
onSnapshot(rootStore, (snapshot) => {
  localStorage.setItem('store', JSON.stringify(snapshot))
})

export { rootStore, defaultUser, defaultOrganization }
