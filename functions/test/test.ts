/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />

import { assert } from "chai"
import * as firebase from "@firebase/testing"
import { setup } from "./utils"

/*
 * ============
 *    Setup
 * ============
 */

const projectId = 'covidwatch-354ce'
const coverageUrl =
    `http://${process.env['FIRESTORE_EMULATOR_HOST']}/emulator/v1/projects/${
        projectId}:ruleCoverage.html`

// /*
//  * ============
//  *  Test Cases
//  * ============
//  */

beforeEach(
    async () => {// Clear the database between tests
                 await firebase.clearFirestoreData({projectId})})

after(async () => {
  // Tear down Firebase apps
  await Promise.all(firebase.apps().map((app) => app.delete()))
  console.log(`View rule coverage information at ${coverageUrl}\n`)
})

const adminAuth = {
  uid: "covid"
}
const nonAdminAuth = {
  uid: "abc"
}

const mockData = {
  "users/covid": {
    userRole: "Admin"
  },
  "signed_reports/alice": {
    contact_event_key_bytes: "blah",
    end_index: 21,
    memo_data: "SGVsbG8sIF",
    memo_type: 1,
    report_verification_public_key_bytes: "oxChFfFyTH",
    signature_bytes: "ETuzy1VioX",
    start_index: 1,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  },
  "random/bob":{ 
    foo: "bar"
  }

@suite
export class CovidWatchFirestore {

  @test
  async "With firestore.rules, admin can read and write any document"() {
    const db = await setup(projectId, adminAuth, mockData);

    const ranRef = db.collection("random");
    await firebase.assertSucceeds(ranRef.get());
    const foo = await firebase.assertSucceeds(ranRef.doc("bob").get());
    assert.equal(foo.data()["foo"], "bar", "Admin can read any document");

    const sigRef = db.collection("signed_reports");
    let alice = await sigRef.doc("alice");
    await firebase.assertSucceeds(
      alice.update({
        contact_event_key_bytes: "new_data",
      })
    );
    alice = await firebase.assertSucceeds(sigRef.doc("alice").get());
    assert.equal(alice.data()["contact_event_key_bytes"], "new_data", "Updated value is as expected");
  }

  @test
  async "With firestore.rules, non-admin can only read signed_reports"() {
    const db = await setup(projectId, nonAdminAuth, mockData);
    const ranRef = db.collection("random");
    await firebase.assertFails(ranRef.get());
    await firebase.assertFails(ranRef.doc("bob").get());

    const sigRef = db.collection("signed_reports");
    await firebase.assertSucceeds(sigRef.get());
    const alice = await firebase.assertSucceeds(sigRef.doc("alice"));
    await firebase.assertFails(
      alice.update({
        contact_event_key_bytes: "new_data",
      })
    );
  }
