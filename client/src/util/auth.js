import firebase from './../../Firebase.js'

export const auth = {
  client: firebase.auth(),
  signIn(user) {
    return this.client.signInWithEmailAndPassword(user.email, user.password)
  },
  checkIfAdmin() {
    return self.client
      .getIdTokenResult(true)
      .then((idTokenResult) => {
        return idTokenResult.claims.isAdmin
      })
      .catch((err) => {
        console.log(err)
        return false
      })
  },
}
