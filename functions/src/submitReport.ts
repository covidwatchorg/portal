import { firestore } from "firebase-admin"
import * as functions from "firebase-functions"

import { Field, parse } from "sparkson"
import { respond, makeError } from "./utils"
import { verifySignature, verifyMemoType } from "./verify"

class Report {
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

export const submitReportHandler = function (
  db: firestore.Firestore,
  request: functions.https.Request,
  response: functions.Response
) {
  const endpointDescription = "tcn submit report"
  console.log(endpointDescription, request.body)

  try {
    // validate format
    const report = parse(Report, request.body)
    console.log("Report JSON received: ", report)

    // prepare for storage
    const jsonObject = JSON.parse(JSON.stringify(report))
    jsonObject["timestamp"] = firestore.FieldValue.serverTimestamp() // add server side timestamp

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
    console.log(verifyMemoType(jsonObject["memo_type"]))

    if(!verifyMemoType(jsonObject["memo_type"])){
      throw new Error("Invalid memo type")
    }
    // validate crypto
    if (
      !verifySignature(
        jsonObject["temporary_contact_key_bytes"],
        jsonObject["memo_data"],
        jsonObject["signature_bytes"],
        jsonObject["report_verification_public_key_bytes"],
        jsonObject["start_index"],
        jsonObject["end_index"],
        jsonObject["memo_type"]
      )
    ) {
      console.log("here?")
      throw new Error("Unable to verify signature")
    }

    return respond(
      response,
      endpointDescription,
      db.collection("signed_reports").doc().set(jsonObject)
    )
  } catch (error) {
    return response
      .status(400)
      .send(makeError(`Error processing ${endpointDescription}: ${error}`, 400))
  }
}
