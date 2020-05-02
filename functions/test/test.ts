/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />

//import { assert } from "chai"
import * as firebase from "@firebase/testing"
import { setup } from "./utils"
import * as SignedReport from "../src/types/SignedReport"

/*
 * ============
 *    Setup
 * ============
 */

const projectId = "covidwatch-354ce"
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
  // Tear down Firebase apps
  await Promise.all(firebase.apps().map((app) => app.delete()))
  console.log(`View rule coverage information at ${coverageUrl}\n`)
})

const anyUser = {
  uid: "alice",
}

const mockData = () => {
  const signedReport: SignedReport.Welcome = {
    temporary_contact_key_bytes: "PvLGpfQZgGqnoQRtSr0AHd8J5/WdKwaJNLRCkhGlgHU=",
    memo_data: "SGVsbG8sIFdvcmxkIQ==",
    memo_type: 1,
    start_index: 1,
    end_index: 8,
    signature_bytes:
      "+k7HDsVZPY5Pxcz0cpwVBvDOHrrQ0+AyDVL/MbGkXBYG2WAyoqLaNxFuXiB9rSzkdCesDv1NSSk06hrjx2YABA==",
    report_verification_public_key_bytes:
      "v78liBBYQrFXqOH6YydUD1aGpXLMgruKATAjFZ0ycLk=",
  };
  return {
    "signed_reports/alice": signedReport,
    "random/bob": {
      foo: "bar",
    }
  }
}

@suite
export class CovidWatchFirestore {
  @test
  async "With firestore.rules, read and writes are disabled for any collection"() {
    const db = await setup(projectId, anyUser, mockData)

    const ranRef = db.collection("random")
    await firebase.assertFails(ranRef.get())
    await firebase.assertFails(ranRef.doc().set({ foo: "bar" }))
  }

  @test
  async "With firestore.rules, all users can only read signed_reports"() {
    const db = await setup(projectId, anyUser, mockData)
    const sigRef = db.collection("signed_reports")
    await firebase.assertSucceeds(sigRef.get())
    const alice = await firebase.assertSucceeds(sigRef.doc("alice"))
    await firebase.assertFails(
      alice.update({
        contact_event_key_bytes: "new_data",
      })
    )

    await firebase.assertFails(
      sigRef.doc().update({
        contact_event_key_bytes: "new_data",
      })
    )
  }
}
