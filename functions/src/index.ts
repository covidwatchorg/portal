import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

import { submitReportHandler } from "./submitReport"
import { submitDiagnosisHandler } from "./submitDiagnosis"
import { fetchDiagnosisHandler } from "./fetchDiagnosis"
import { createPermissionNumbersHandler } from "./createPermissionNumber"

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

export const fetchDiagnosis = functions.https.onRequest((request, response) => {
  fetchDiagnosisHandler(firestore, request, response)
})

export const createPermissionNumber = functions.https.onRequest(
  (request, response) => {
    createPermissionNumbersHandler(firestore, request, response)
  }
)
