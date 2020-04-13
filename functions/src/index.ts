import * as functions from "firebase-functions"
import { parse, DateClass, Field } from "sparkson"

export class Report {
  constructor(
    @Field("contact_event_key_bytes") public contact_event_key_bytes: string,
    @Field("memo_data") public memo_data: string,
    @Field("memo_type") public memo_type: number,
    @Field("start_index") public start_index: number,
    @Field("end_index") public end_index: number,
    @Field("signature_bytes") public signature_bytes: string,
    @Field("report_verification_public_key_bytes")
    public report_verification_public_key_bytes: string,
    @Field("timestamp") public timestamp: DateClass
  ) {}
}

export const submitReport = functions.https.onRequest((request, response) => {
  console.log(request.body)

  try {
    const report = parse(Report, request.body)
    console.log("I got the report", report)
    response.status(200).send(report)
  } catch (error) {
    console.log(`Got an error: ${error}`)
    response.status(400).send(error)
  }
})
