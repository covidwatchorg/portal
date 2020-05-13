import { types, flow } from 'mobx-state-tree'
import firebase from './../../Firebase.js'

const User = types
  .model({
    isAdmin: types.boolean,
  })
  .actions((self) => {
    const signIn = flow(function* (email, password) {
      try {
        yield firebase.auth().signInWithEmailAndPassword(email, password)
        console.log('Successfully logged in')

        const idTokenResult = yield firebase.auth().currentUser.getIdTokenResult(true)

        self.isAdmin = idTokenResult.claims.isAdmin
        console.log(`isAdmin set to ${self.isAdmin}`)
      } catch (e) {
        console.log(e)
      }
    })

    return {
      signIn,
    }
  })

const Store = types
  .model({
    user: types.maybeNull(User),
  })
  .actions((self) => {
    const signOut = flow(function* () {
      try {
        yield firebase.auth().signOut()
        console.log('Successfully logged out')
        self.user.isAdmin = false
      } catch (e) {
        console.log(e)
      }
    })

    return {
      signOut,
    }
  })

export default Store.create({
  user: {
    isAdmin: false,
  },
})
