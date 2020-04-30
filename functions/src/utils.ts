import * as functions from "firebase-functions"

export const respond = function (
  response: functions.Response,
  endpointDescription: string,
  promise: Promise<any>
) {
  return promise
    .then((extra) => {
      let payload: Record<string, string> = {
        status: "201",
        message: "Success",
      }
      // allow extra data to be sent to the client
      if (typeof extra === "object" && "data" in extra) {
        payload["data"] = extra["data"]
      }
      return response.status(201).send(payload)
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
