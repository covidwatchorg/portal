import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import {DateClass, Field, parse} from 'sparkson'
import tcn from 'tcn-node'

admin.initializeApp(functions.config().firebase)

export const firestore = admin.firestore()

export class Report {
  constructor(
      @Field('contact_event_key_bytes') public contact_event_key_bytes: string,
      @Field('memo_data') public memo_data: string,
      @Field('memo_type') public memo_type: number,
      @Field('start_index') public start_index: number,
      @Field('end_index') public end_index: number,
      @Field('signature_bytes') public signature_bytes: string,
      @Field('report_verification_public_key_bytes')
      public report_verification_public_key_bytes: string,
      @Field('timestamp') public timestamp: DateClass) {}
}

export const submitReport = functions.https.onRequest((request, response) => {
  console.log(request.body)

  console.log(
      'Call TCN Rust', tcn.tcn_example());  // should print "symptom data"

  try {
    // validate format
    const report = parse(Report, request.body)
    console.log('Report JSON received: ', report)

    // validate crypto

    // prepare for storage
    const jsonObject = JSON.parse(JSON.stringify(report))
    console.log('Saving report: ', jsonObject)

    firestore
      .collection('signed_reports')
      .doc()
      .set(jsonObject)
      .then(() => {
        return response.status(201).send({
          status: '201',
          message: 'Success',
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
