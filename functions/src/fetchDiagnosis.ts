import { firestore } from "firebase-admin"
import * as functions from "firebase-functions"
import { respond, makeError } from "./utils"
import { DateClass, Field, parse } from "sparkson"

function getDiagnosisReportsFrom(db: firestore.Firestore, timestamp: Date) {
  return db
    .collection("positive_diagnosis")
    .where("timestamp", ">=", timestamp)
    .get()
    .then((snapshot) => {
      const data: Record<string, string | number | object>[] = []
      snapshot.forEach((doc) => {
        const docData = doc.data()
        console.log("Record matched", docData)

        const payload: Record<string, string | number | object> = {}
        payload["timestamp"] = new Date(
          docData.timestamp._seconds * 1000
        ).toISOString()
        const diagnosisKeys = []
        for (const diagnosisKey of docData["diagnosis_keys"]) {
          diagnosisKeys.push({
            rolling_start_number: diagnosisKey["rolling_start_number"],
            key_data: diagnosisKey["key_data"].toString("base64"),
          })
        }
        payload["diagnosis_keys"] = diagnosisKeys
        data.push(payload)
      })
      return { data: data }
    })
}

function getFourteenDaysAgo(): Date {
  const fourteenDaysMs = 1000 * 60 * 60 * 24 * 14
  const now = new Date()
  return new Date(now.getTime() - fourteenDaysMs)
}

export const fetchDiagnosisHandler = function (
  db: firestore.Firestore,
  request: functions.https.Request,
  response: functions.Response
) {
  // ISO 8601 timestamp e.g. 2020-04-16T04:55:54.120Z
  class FetchDiagnosis {
    constructor(
      @Field("timestamp", true, undefined, getFourteenDaysAgo())
      public timestamp: DateClass
    ) {}
  }

  function validateFetch(fetch: FetchDiagnosis): Date {
    const fourteenDaysAgo = getFourteenDaysAgo()
    if (fetch.timestamp < fourteenDaysAgo) {
      const diff = new Date(
        fourteenDaysAgo.getTime() - fetch.timestamp.getTime()
      )
      console.log(
        `Requested time ${fetch.timestamp.toISOString()} is ${diff.getTime()} ms too old`
      )
      return fourteenDaysAgo
    }
    return fetch.timestamp
  }

  const endpointDescription = "fetch diagnosis"
  console.log(endpointDescription, request.body)

  try {
    // validate format
    const fetch = parse(FetchDiagnosis, request.body)
    console.log("Report JSON received: ", fetch)

    const fetchDate = validateFetch(fetch)
    console.log("Query from date ago", fetchDate.toISOString())

    return respond(
      response,
      endpointDescription,
      getDiagnosisReportsFrom(db, fetchDate)
    )
  } catch (error) {
    return response
      .status(400)
      .send(makeError(`Error processing ${endpointDescription}: ${error}`, 400))
  }
}
