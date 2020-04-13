/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />

import { expect } from "chai"

import * as firebase from "@firebase/testing"
import { setup } from "./utils"

/*
 * ============
 *    Setup
 * ============
 */

const projectId = "tagstwo-431e3"
const coverageUrl = `http://${process.env["FIRESTORE_EMULATOR_HOST"]}/emulator/v1/projects/${projectId}:ruleCoverage.html`

// /*
//  * ============
//  *  Test Cases
//  * ============
//  */

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId })
})

after(async () => {
  await Promise.all(firebase.apps().map((app) => app.delete()))
  console.log(`View rule coverage information at ${coverageUrl}\n`)
})

function makeSurveyData() {
  return {
    contact_event_key_bytes: "blah",
    end_index: 21,
    memo_data: "SGVsbG8sIF",
    memo_type: 1,
    report_verification_public_key_bytes: "oxChFfFyTH",
    signature_bytes: "ETuzy1VioX",
    start_index: 1,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

@suite
export class CovidWatchFirestore {
  @test
  async "user can read signed_reports"() {
    const mockData = {
      signed_reports: {
        alice: makeSurveyData(),
      },
    }
    const db = await setup(projectId, null, mockData)
    const report = db.collection("signed_reports").doc("alice")
    await firebase.assertSucceeds(report.get())
    await report
      .get()
      .then(function (doc: firebase.firestore.DocumentSnapshot) {
        if (doc.exists) {
          const data = doc.data()
          if (data !== undefined && "contact_event_key_bytes" in data) {
            return expect(data.contact_event_key_bytes).to.equal("blah")
          }
        }
        return expect(false)
      })
  }

  @test
  async "should not let anyone write a singed_reports"() {
    const db = await setup(projectId, null)
    const survey = db.collection("signed_reports").doc("123")
    await firebase.assertFails(
      survey.set({
        contact_event_key_bytes: "New Data",
      })
    )
  }
}
