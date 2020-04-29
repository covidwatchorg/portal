import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

import { addPermissionNumbersHandler } from "./addPermissionNumbers"
import { submitDiagnosisHandler } from "./submitDiagnosis"
import { submitReportHandler } from "./submitReport"

// Check for DEBUG_LOGGING
const DEBUG_LOGGING = process.env.DEBUG_LOGGING || ""
const log = parseInt(DEBUG_LOGGING) === 1 ? true : false
if (!log) {
  // replace console.log with a noop
  console.log = () => undefined
}

admin.initializeApp(functions.config().firebase)

export const firestore = admin.firestore()

export const submitReport = functions.https.onRequest((request, response) => {
  submitReportHandler(firestore, request, response)
})

export const submitDiagnosis = functions.https.onRequest(
  (request, response) => {
    submitDiagnosisHandler(firestore, request, response)
  }
)

export const addPermissionNumbers = functions.https.onRequest(
  (request, response) => {
    addPermissionNumbersHandler(firestore, request, response)
  }
)
