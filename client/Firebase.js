import * as firebase from 'firebase'

// Initialize client SDK
const firebaseConfig = {
  apiKey: 'AIzaSyAHVZXO-wFnGmUIBLxF6-mY3tuleK4ENVo',
  authDomain: 'permission-portal-test.firebaseapp.com',
  databaseURL: 'https://permission-portal-test.firebaseio.com',
  projectId: 'permission-portal-test',
  storageBucket: 'permission-portal-test.appspot.com',
  messagingSenderId: '1090782248577',
  appId: '1:1090782248577:web:184d481f492cfa4edc1780',
}
firebase.initializeApp(firebaseConfig)

export default firebase
