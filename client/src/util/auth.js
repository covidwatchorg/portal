import firebase from './../../Firebase.js'

export const auth = {
  isAdmin: false,
  signIn(user) {
    return firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(() => {
        console.log('Successfully logged in')
        firebase
          .auth()
          .currentUser.getIdTokenResult(true)
          .then((idTokenResult) => {
            this.isAdmin = idTokenResult.claims.isAdmin
            console.log(`isAdmin set to ${this.isAdmin}`)
          })
          .catch((err) => {
            console.log(err)
            self.isAdmin = false
          })
      })
  },
}
