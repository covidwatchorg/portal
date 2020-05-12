import React, { useState } from 'react';
import PendingOperationButton from '../components/PendingOperationButton';
import "../../Styles/screens/branding.scss";
import { withAuthorization } from '../components/Session';
import * as ROLES from '../constants/roles';
import { compose } from 'recompose';

var defaultDiagnosisText = `Next Steps:
- Please quarantine yourself
-
-
`;

var defaultExposureText = `Next Steps:
- Please quarantine yourself
- Do you need help with shelter, food etc.?
-
`;

const getDiagnosisText = () => {
  return defaultDiagnosisText;
};

const getExposureText = () => {
  return defaultExposureText
}

const AccountBrandingBase = () => {
  const [dataDirty, setDataDirty] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState(getDiagnosisText());
  const [exposureText, setExposureText] = useState(getExposureText());

  const saveAccountBrandingData = () => {
    console.log("TODO save account branding data");
    setDataDirty(false);
  }

  const saveOperation = () => {
    return new Promise((resolutionFunc, rejectionFunc) => {
      setTimeout(()=>{
        saveAccountBrandingData();
        resolutionFunc();
      }, 2000);
    });
  };

  const onContactUsClicked = () => {
    console.log("TODO contact us");
  };

  return (
    <div className="module-container">
      <h1 className="branding-header">Account Branding</h1>
      <div className="branding-container">
        <div className="branding-section">
          <h2 className="section-heading">Share Positive Diagnosis</h2>
          <p className="section-description">
          This text wil be displayed ot anyone who shares a positive diagnosis and notifies everyone.
          </p>
          <textarea
            className="section-input"
            type="text"
            value={diagnosisText}
            onChange={e => {setDiagnosisText(e.target.value); setDataDirty(true)}}
          />
        </div>
        <div className="branding-section">
          <h2 className="section-heading">Possible Exposure</h2>
          <p className="section-description">
          This text wil be displayed to anyone who is notified of a potential exposure.
          </p>
          <textarea
            className="section-input"
            type="text"
            value={exposureText}
            onChange={e => {setExposureText(e.target.value); setDataDirty(true)}}
          />
        </div>
        <div className="branding-section">
          <h2 className="section-heading">Other Branding and Customization</h2>
          <p className="section-description">
          Your dedicated account manager will gladly help you with other branding and customization needs.
          </p>
          <div id="contact-button" onClick={onContactUsClicked}>
            Contact Us
          </div>
        </div>
      </div>
      <div className="save-button-container">
          <PendingOperationButton className="save-button" operation={saveOperation}>
            Save Changes
          </PendingOperationButton>
      </div>
    </div>
  );
};

const condition = authUser => {
  var result = authUser && authUser.roles[ROLES.ADMIN];
  return result;
}

const AccountBranding =  compose(
  withAuthorization(condition),
)(AccountBrandingBase);

export default AccountBranding;