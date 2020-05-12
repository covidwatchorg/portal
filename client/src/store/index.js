import { types, flow } from 'mobx-state-tree'

const User = types
  .model({
    isAdmin: types.boolean,
  })
  .actions((self) => {
    const signIn = flow(function* (firebase, email, password) {
      try {
        yield firebase.doSignInWithEmailAndPassword(email, password)
        console.log('Successfully logged in')

        const idTokenResult = yield firebase.auth.currentUser.getIdTokenResult(true)

        this.isAdmin = idTokenResult.claims.isAdmin
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
    const signOut = flow(function* (firebase) {
      try {
        yield firebase.auth.signOut()
        console.log('Successfully logged out')
        this.user.isAdmin = false
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
