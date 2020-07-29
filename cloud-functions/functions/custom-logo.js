// this is meant to be run by Covid Watch devs to set a custom logo for different organizations to appear in the NavBar
// perhaps at some point this could be adapted for an admin user to set their organization's logo

const admin = require('firebase-admin');
const fs = require('fs');

// these desktop paths for testing purposes, they work!  simulating a dev downloading a file from browser, saving to desktop, then referencing in this script to upload
const soylentLogoPath = '../../../../soylent-green-logo.png'; // https://fanart.tv/fanart/movies/12101/hdmovielogo/soylent-green-51744f6296779.png
const pepsiPath = '../../../../pepsi-logo.png'; //https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/1200px-Pepsi_logo_2014.svg.png

// from some tests, svgs and jpegs don't work. line 39 hardcodes to png based base64 so that may be part of it
const uOfAPath = '../../frontend/client/assets/uofa-logo.svg';
const jpegExample = '../../../../Jesse_Colligan.jpeg';

// note: environment should be manually set to "dev", "staging", or "production", depending on where you would like to update the logo
const setLogo = (environment, organizationID, logoPath) => {
  // Initialize admin SDK

  // note: only the dev-firebase-admin keys are found in this directory.  staging and prod are elsewhere so this path is not correct for staging and prod
  const serviceAccount = require(`../../permission-portal-cloud-functions/functions/permission-portal-${environment}-firebase-admin-key.json`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://permission-portal-${environment}.firebaseio.com`,
  });

  const db = admin.firestore();
  const organization = db.collection('organizations').doc(organizationID);

  fs.readFile(logoPath, (err, data) => {
    if (err) throw err;
    // data is a <Buffer> object, binary data
    // <Buffer 3c 73 76 67 20 77 69 64 74 68 3d 22 32 31 33 22 20 68 65 69 67 68 74 3d 22 35 30 22 20 76 69 65 77 42 6f 78 3d 22 30 20 30 20 32 31 33 20 35 30 22 20 ... 19374 more bytes>
    // a Buffer can be stringified to base64.... more on Buffers: https://nodejs.org/docs/latest-v9.x/api/buffer.html#buffer_class_buffer
    
    const logo = data.toString('base64');

    // organization.update I think presupposes that there is an empty key of logoBlob already, this will have to be set previously (should add to reset-infrastructure and then manually to prod?)
    organization.update({
      logoBlob: "data:image/png;base64," + logo,
    });
  });
};

// note: organizationID "nNYhr3UnnIPvjHcf3gDm" is Soylent Green
setLogo('dev', 'nNYhr3UnnIPvjHcf3gDm', soylentLogoPath);




    