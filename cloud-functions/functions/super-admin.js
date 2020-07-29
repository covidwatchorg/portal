/* 

Functions here are for "super admin" functions - such as setting a custom logo for different organizations to appear in the NavBar

To run this script in the console, use a command formatted in the following way:

node super-admin.js dev nNYhr3UnnIPvjHcf3gDm ../../../../pepsi-logo.png

This example command passes in three arguments: 

'dev' --> this determines the Firebase database to edit
'nNYhr3UnnIPvjHcf3gDm' --> this determines the Firebase organization to edit based on its organization ID
'../../../../pepsi-logo.png' -->  this defines the path the .png file to upload (note: only .png files work in this script)

*/

const admin = require('firebase-admin');
const fs = require('fs');

const setLogo = () => {
  const environment = process.argv[2]
  const organizationID = process.argv[3]
  const logoPath = process.argv[4]

  if (environment !== 'dev' && environment !== 'staging' && environment !== 'production') {
    throw new Error("Invalid environment argument. Use 'dev', 'staging', or 'production' as the first argument in the format: setLogo('dev', '12345abcde', './acme-logo.png'");
  }

  const serviceAccount = require(`../../permission-portal-cloud-functions/functions/permission-portal-${environment}-firebase-admin-key.json`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://permission-portal-${environment}.firebaseio.com`,
  });

  const db = admin.firestore();
  const organization = db.collection('organizations').doc(organizationID);

  fs.readFile(logoPath, (err, data) => {
    if (err) {
      console.log("setLogo only accepts .png currently, other file extensions will likely cause errors")
      throw err;
    }
    const logo = data.toString('base64');

    organization.update({
      logoBlob: "data:image/png;base64," + logo,
    });
  });
};

setLogo()






    