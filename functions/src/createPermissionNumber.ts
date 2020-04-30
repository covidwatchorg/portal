import { firestore } from "firebase-admin"
import * as functions from "firebase-functions"
import { respond, makeError } from "./utils"

function createPermissionNumber(db: firestore.Firestore): Promise<string[]> {
  const promises = []
  // TODO: replace this
  const randomNumber: string = Math.random().toString(36).substring(2, 7)
  const permissionRef = db.collection("diagnosis_permission_number")
  for (const permissionNumber of [randomNumber]) {
    const promise = permissionRef
      .doc()
      .set({ key: permissionNumber })
      .then(() => {
        return permissionNumber
      })
    promises.push(promise)
  }

  return Promise.all(promises)
}

export const createPermissionNumbersHandler = function (
  db: firestore.Firestore,
  request: functions.https.Request,
  response: functions.Response
) {
  const endpointDescription = "permission numbers"
  console.log(endpointDescription, request.body)

  try {
    return respond(
      response,
      endpointDescription,
      createPermissionNumber(db).then((permissionNumber) => {
        console.log("got this after writing", permissionNumber)
        return { data: permissionNumber }
      })
    )
  } catch (error) {
    return response
      .status(400)
      .send(makeError(`Error processing ${endpointDescription}: ${error}`, 400))
  }
}
