import { firestore } from "firebase-admin"
import * as functions from "firebase-functions"
import { ArrayField, parse } from "sparkson"
import { respond, makeError } from "./utils"

class PermissionNumbers {
  constructor(
    @ArrayField("permission_numbers", String)
    public permission_numbers: Array<string>
  ) {}
}

function createPermissionNumbers(
  db: firestore.Firestore,
  permissionNumbers: Array<string>
): Promise<firestore.WriteResult[]> {
  const promises = []
  const permissionRef = db.collection("diagnosis_permission_number")
  for (const permissionNumber of permissionNumbers) {
    const promise = permissionRef
      .doc()
      .set({ key: Buffer.from(permissionNumber, "base64") })
    promises.push(promise)
  }

  return Promise.all(promises)
}

export const addPermissionNumbersHandler = function (
  db: firestore.Firestore,
  request: functions.https.Request,
  response: functions.Response
) {
  const endpointDescription = "permission numbers"
  console.log(endpointDescription, request.body)

  try {
    // validate format
    const permissionNumbers = parse(PermissionNumbers, request.body)
    console.log("Report JSON received: ", permissionNumbers)

    return respond(
      response,
      endpointDescription,
      createPermissionNumbers(db, permissionNumbers.permission_numbers)
    )
  } catch (error) {
    return response
      .status(400)
      .send(makeError(`Error processing ${endpointDescription}: ${error}`, 400))
  }
}
