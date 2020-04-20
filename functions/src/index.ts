import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { Field, parse } from "sparkson"
//import { registerStringMapper, Field, parse } from "sparkson"
//registerStringMapper(Buffer, (val: string) => Buffer.from(val, "base64"))

import tcn from "tcn-node"

// Check for DEBUG_LOGGING
const DEBUG_LOGGING = process.env.DEBUG_LOGGING || ""
const log = parseInt(DEBUG_LOGGING) === 1 ? true : false
if (!log) {
  // replace console.log with a noop
  console.log = () => undefined
}

admin.initializeApp(functions.config().firebase)

export const firestore = admin.firestore()

export class Report {
  constructor(
    @Field("temporary_contact_key_bytes")
    public temporary_contact_key_bytes: string,
    @Field("memo_data") public memo_data: string,
    @Field("memo_type") public memo_type: number,
    @Field("start_index") public start_index: number,
    @Field("end_index") public end_index: number,
    @Field("signature_bytes") public signature_bytes: string,
    @Field("report_verification_public_key_bytes")
    public report_verification_public_key_bytes: string
  ) {}
}

export const submitReport = functions.https.onRequest((request, response) => {
  console.log(request.body)
  console.log("Call TCN Rust", tcn.tcn_example()) // should print "symptom data"

  try {
    // validate format
    const report = parse(Report, request.body)
    console.log("Report JSON received: ", report)

    // prepare for storage
    const jsonObject = JSON.parse(JSON.stringify(report))
    jsonObject["timestamp"] = admin.firestore.FieldValue.serverTimestamp() // add server side timestamp

    // convert base64 strings to bytes
    jsonObject["temporary_contact_key_bytes"] = Buffer.from(
      jsonObject["temporary_contact_key_bytes"],
      "base64"
    )

    jsonObject["memo_data"] = Buffer.from(jsonObject["memo_data"], "base64")

    jsonObject["signature_bytes"] = Buffer.from(
      jsonObject["signature_bytes"],
      "base64"
    )

    jsonObject["report_verification_public_key_bytes"] = Buffer.from(
      jsonObject["report_verification_public_key_bytes"],
      "base64"
    )

    // validate crypto

    firestore
      .collection("signed_reports")
      .doc()
      .set(jsonObject)
      .then(() => {
        return response.status(201).send({
          status: "201",
          message: "Success",
        })
      })
      .catch((error) => {
        console.log(`Error writing to firestore: ${error}`)
        response.status(400).send(error)
      })
  } catch (error) {
    console.log(`Error processing report: ${error}`)
    response.status(400).send(error)
  }
})
