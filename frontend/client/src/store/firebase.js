import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/functions'
import * as firebaseConfigLocal from '../config/firebase.config.local'
import * as firebaseConfigDev from '../config/firebase.config.dev'
import * as firebaseConfigTest from '../config/firebase.config.test'
import * as firebaseConfigProd from '../config/firebase.config.prod'
import * as firebaseConfigStaging from '../config/firebase.config.staging'
import Logging from '../util/logging'

var firebaseConfigMap = {
  development: firebaseConfigDev,
  test: firebaseConfigTest,
  production: firebaseConfigProd,
  local: firebaseConfigLocal,
  staging: firebaseConfigStaging,
}

const config = firebaseConfigMap[process.env ? process.env.NODE_ENV : 'development']

Logging.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`)

app.initializeApp(config)
const auth = app.auth()
const SESSION = app.auth.Auth.Persistence.SESSION
const db = app.firestore()
const createUserCallable = app.functions().httpsCallable('createUser')

export { auth, db, createUserCallable, SESSION }
