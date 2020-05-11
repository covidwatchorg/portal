import * as firebase from 'firebase/app'
import 'firebase/auth'

// Initialize client SDK
// WARNING: currently hardcoded to the dev infrastructure
const firebaseConfig = {
  apiKey: 'AIzaSyAKbS8JEe1UVSZdaJfN4RnsRFPE7Tb-YpM',
  authDomain: 'permission-portal-dev.firebaseapp.com',
  databaseURL: 'https://permission-portal-dev.firebaseio.com',
  projectId: 'permission-portal-dev',
  storageBucket: 'permission-portal-dev.appspot.com',
  messagingSenderId: '885750041965',
  appId: '1:885750041965:web:14133265537c686c1dde64',
}
firebase.initializeApp(firebaseConfig)

export default firebase
