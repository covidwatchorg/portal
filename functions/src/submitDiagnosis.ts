import { firestore } from "firebase-admin"
import * as functions from "firebase-functions"
import { ArrayField, Field, parse } from "sparkson"
import { respond, makeError } from "./utils"

class DiagnosisKey {
  constructor(
    @Field("key_data") public key_data: string,
    @Field("rolling_start_number") public rolling_start_number: number
  ) {}
}

class PositiveDiagnosis {
  constructor(
    @ArrayField("diagnosis_keys", DiagnosisKey)
    public diagnosis_keys: Array<DiagnosisKey>,
    @Field("public_health_authority_permission_number")
    public public_health_authority_permission_number: string
  ) {}
}

function validatePermissionNumber(data: Buffer): Boolean {
  console.log("got some data to verify", data, typeof data)
  if (data.length === 0) {
    return false
  }
  return true
}

function getPermissionNumberDocId(
  db: firestore.Firestore,
  data: Buffer
): Promise<string> {
  const permissionRef = db.collection("diagnosis_permission_number")
  return permissionRef
    .where("key", "==", data)
    .get()
    .then((snapshot) => {
      let docId = ""
      if (snapshot.empty) {
        console.log("No matching diagnosis_permission_number")
      }

      snapshot.forEach((doc) => {
        const docData = doc.data()
        if (!("used_timestamp" in docData)) {
          docId = doc.id
        }
      })

      return docId
    })
    .then((docId) => {
      if (docId === "") {
        throw new Error("Invalid diagnosis_permission_number")
      }
      return docId
    })
}

function checkAndSave(
  db: firestore.Firestore,
  docId: string,
  permissionNumber: Buffer,
  jsonObject: Object
) {
  const transaction = db.runTransaction((t) => {
    const permissionRef = db
      .collection("diagnosis_permission_number")
      .doc(docId)
    return t.get(permissionRef).then((doc) => {
      console.log("Found diagnosis_permission_number", doc.id, doc.data())
      let data = doc.data()
      if (
        data !== undefined &&
        doc.id === docId &&
        Buffer.compare(data["key"], permissionNumber) === 0
      ) {
        if ("used_timestamp" in data) {
          return Promise.reject(
            "public_health_authority_permission_number already used"
          )
        } else {
          data["used_timestamp"] = firestore.FieldValue.serverTimestamp()
        }
        let diagnosisRef = db.collection("positive_diagnosis").doc()
        t.update(permissionRef, data)
        t.set(diagnosisRef, jsonObject)
        return Promise.resolve("Positive Diagnosis saved")
      }
      return Promise.reject(
        "public_health_authority_permission_number does not exist"
      )
    })
  })
  return transaction
}

export const submitDiagnosisHandler = function (
  db: firestore.Firestore,
  request: functions.https.Request,
  response: functions.Response
) {
  const endpointDescription = "positive diagnosis"
  console.log(endpointDescription, request.body)

  try {
    // validate format
    const report = parse(PositiveDiagnosis, request.body)
    console.log("Report JSON received: ", report)

    // prepare for storage
    const jsonObject = JSON.parse(JSON.stringify(report))
    jsonObject["timestamp"] = firestore.FieldValue.serverTimestamp() // add server side timestamp

    // convert base64 strings to bytes
    jsonObject["public_health_authority_permission_number"] = Buffer.from(
      jsonObject["public_health_authority_permission_number"],
      "base64"
    )

    const permissionNumber =
      jsonObject["public_health_authority_permission_number"]
    if (!validatePermissionNumber(permissionNumber)) {
      return response
        .status(400)
        .send(
          makeError(`Invalid public_health_authority_permission_number`, 400)
        )
    }

    for (const diagnosisKey of jsonObject["diagnosis_keys"]) {
      console.log("before diagnosisKey", diagnosisKey)
      diagnosisKey["key_data"] = Buffer.from(diagnosisKey["key_data"], "base64")
      console.log("after diagnosisKey", diagnosisKey)
    }

    return respond(
      response,
      endpointDescription,
      getPermissionNumberDocId(db, permissionNumber).then((docId) => {
        console.log("found permission doc id", docId)
        return checkAndSave(db, docId, permissionNumber, jsonObject)
      })
    )
  } catch (error) {
    return response
      .status(400)
      .send(makeError(`Error processing ${endpointDescription}: ${error}`, 400))
  }
}
