import React, { useState } from 'react';
import "../../Styles/screens/branding.scss";

const defaultDiagnosisText = `Next Steps:
- Please quarantine yourself
-
-
`;

const defaultExposureText = `Next Steps:
- Please quarantine yourself
- Do you need help with shelter, food etc.?
-
`;

const AccountBranding = () => {
  const [diagnosisText, setDiagnosisText] = useState(defaultDiagnosisText);
  const [exposureText, setExposureText] = useState(defaultExposureText);
  
  return (
    <div className="module-container">
      <h1>Account Branding</h1>
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
          {
            (diagnosisText !== defaultDiagnosisText) &&
            <div className="save-button" onClick={() => {}}>
              Save Changes
            </div>
          }
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
          {
            (exposureText !== defaultExposureText) &&
            <div className="save-button" onClick={() => {}}>
              Save Changes
            </div>
          }
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
    </div>
  );
};

export default AccountBranding;