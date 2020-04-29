import * as functions from "firebase-functions"

export const respond = function (
  response: functions.Response,
  endpointDescription: string,
  promise: Promise<any>
) {
  return promise
    .then(() => {
      return response.status(201).send({
        status: "201",
        message: "Success",
      })
    })
    .catch((error: any) => {
      return response
        .status(400)
        .send(
          makeError(`Error processing ${endpointDescription}: ${error}`, 400)
        )
    })
}

export const makeError = function (message: string, code: number) {
  console.log("Sending Error: ", message)
  return {
    status: `${code}`,
    message: message,
  }
}
