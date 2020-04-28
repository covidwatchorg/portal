/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />

import { assert } from "chai"
import * as firebase from "@firebase/testing"
import { setup } from "./utils"

/*
 * ============
 *    Setup
 * ============
 */

const projectId = "tagstwo-431e3"
const coverageUrl = `http://${process.env["FIRESTORE_EMULATOR_HOST"]}/emulator/v1/projects/${projectId}:ruleCoverage.html`
const auth = {
  uid: "covid"
}
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
  // Tear down Firebase apps
  await Promise.all(firebase.apps().map((app) => app.delete()))
  console.log(`View rule coverage information at ${coverageUrl}\n`)
})

const mockData = {
  contact_event_key_bytes: "blah",
  end_index: 21,
  memo_data: "SGVsbG8sIF",
  memo_type: 1,
  report_verification_public_key_bytes: "oxChFfFyTH",
  signature_bytes: "ETuzy1VioX",
  start_index: 1,
  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
}

@suite
export class CovidWatchFirestore {
  @test
  async "With firestore.rules, user with auth can read and write signed_reports"() {
    const db = await setup(projectId, auth)
    const report = db.collection("list").doc("item")

    await firebase.assertSucceeds(
      report.set({
        some_random_message: "qwerty",
      })
    )
    await firebase.assertSucceeds(report.get())
  }

  @test
  async "Authenticated user should pass sanity check on write and update"() {
    const db = await setup(projectId, auth)
    const alice = db.collection("signed_reports").doc("alice");

    await firebase.assertSucceeds(
      alice.set(mockData)
    )
    let aliceData = await firebase.assertSucceeds(alice.get())
    assert.equal(aliceData.data()["contact_event_key_bytes"], "blah", "Contact event key matched")

    await firebase.assertSucceeds(
      alice.update({
        contact_event_key_bytes: "qwerty",
      })
    )
    aliceData = await firebase.assertSucceeds(alice.get())
    assert.equal(aliceData.data()["contact_event_key_bytes"], "qwerty", "Contact event key updated")
  }

  @test
  async "With firestore.rules, user without auth cannot write a signed_reports"() {
    const db = await setup(projectId, null)
    const report = db.collection("signed_reports").doc("alice")
    await firebase.assertSucceeds(report.get())
    await firebase.assertFails(
      report.set({
        contact_event_key_bytes: "New Data",
      })
    )
  }
}
