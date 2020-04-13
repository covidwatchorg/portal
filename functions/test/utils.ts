import "fs"

const firebase = require("@firebase/testing")
const fs = require("fs")

interface Dictionary<T> {
  [Key: string]: T
}

const authedApp = async (projectId: string, auth: object | null) => {
  const app = await firebase.initializeTestApp({
    projectId,
    auth,
  })
  return app
}

const setup = async (
  projectId: string,
  auth: object | null,
  data: Dictionary<any> = {}
) => {
  const app = await authedApp(projectId, auth)
  const db = app.firestore()

  // Clear rules
  // Here we load the insecure rules temporarily so we can write to the emulator
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync("firestore.insecure.rules", "utf8"),
  })

  // Write mock documents before rules
  if (data) {
    for (const collection in data) {
      for (const doc in data[collection]) {
        const ref = db.collection(collection).doc(doc)
        await ref.set(data[collection][doc])
      }
    }
  }

  // Apply rules
  // Restore the correct rules so we can test them
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync("../firestore.rules", "utf8"),
  })

  return db
}

export { setup, authedApp }
