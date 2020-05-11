import React, { useState } from 'react';
import "../../Styles/screens/branding.scss";

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

const getSavedDiagnosisText = () => {
  return defaultDiagnosisText;
};

const getSavedExposureText = () => {
  return defaultExposureText
}

// TODO this operation may fail, should return success confirmation
const SaveAccountBrandingData = (diagnosisText, setDiagnosisText, exposureText, setExposureText) => {
  console.log("TODO save account branding data");
  console.log(diagnosisText);
  console.log(exposureText);

  defaultDiagnosisText = diagnosisText;
  setDiagnosisText(defaultDiagnosisText);

  defaultExposureText = exposureText;
  setExposureText(defaultExposureText);
}

const AccountBranding = () => {
  const savedDiagnosisText = getSavedDiagnosisText();
  const savedExposureText = getSavedExposureText();

  const [diagnosisText, setDiagnosisText] = useState(savedDiagnosisText);
  const [exposureText, setExposureText] = useState(savedExposureText);

  const changedSinceLastSave = savedDiagnosisText !== diagnosisText || savedExposureText !== exposureText;

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
            onChange={e => setDiagnosisText(e.target.value)}
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
            onChange={e => setExposureText(e.target.value)}
          />
        </div>
        <div className="branding-section">
          <h2 className="section-heading">Other Branding and Customization</h2>
          <p className="section-description">
          Your dedicated account manager will gladly help you with other branding and customization needs.
          </p>
          <div id="contact-button" onClick={() => {}}>
            Contact Us
          </div>
        </div>
      </div>
      <div className="save-button-container">
        {
          changedSinceLastSave &&
          <div className="save-button" onClick={() => SaveAccountBrandingData(diagnosisText, setDiagnosisText, exposureText, setExposureText)}>
            Save Changes
          </div>
        }
      </div>
    </div>
  );
};

export default AccountBranding;