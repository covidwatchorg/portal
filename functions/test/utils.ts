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

  // Insecure rules opens write access so we can store admin in /users
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync("./firestore.insecure.rules", "utf8"),
  })

  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  // Once admin is stored we can switch to production rules
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync("../firestore.rules", "utf8"),
  })
  return db
}

export { setup, authedApp }
