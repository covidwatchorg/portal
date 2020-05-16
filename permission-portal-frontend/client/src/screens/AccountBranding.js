import React, { useState } from 'react';
import PendingOperationButton from '../components/PendingOperationButton';
import "../../Styles/screens/branding.scss";
import { withAuthorization } from '../components/Session';
import * as ROLES from '../constants/roles';
import { compose } from 'recompose';
import store from '../store'
import { useObserver } from 'mobx-react'
import 'mobx-react/batchingForReactDom'

const AccountBrandingBase = () => {
  const getDiagnosisText = () => {
    if (diagnosisText !== "Loading text...") {
      return diagnosisText
    }
    return store.organization ? store.organization.diagnosisText : "Loading text..."
  }

  const getExposureText = () => {
    if (exposureText !== "Loading text...") {
      return exposureText
    }
    return store.organization ? store.organization.exposureText : "Loading text..."
  }

  const [diagnosisText, setDiagnosisText] = useState(
    store.organization ? store.organization.diagnosisText : "Loading text..."
  );
  const [exposureText, setExposureText] = useState(
    store.organization ? store.organization.exposureText : "Loading text..."
  );

  const onContactUsClicked = () => {
    console.log("TODO contact us");
  };

  const saveData = async () => {
    try {
      await store.organization
        .setOrganizationalBranding(diagnosisText, exposureText)
      
      console.log("Branding data saved successfully")
    } catch (err) {
      console.warn("Branding data failed to save", err)
    }
  }

  return useObserver(() => (
    <div className="module-container">
      <h1 className="branding-header">Account Branding</h1>
      <div className="branding-container">
        <div className="branding-section">
          <h2 className="section-heading">Share Positive Diagnosis</h2>
          <p className="section-description">
          This text will be displayed to anyone who shares a positive diagnosis and notifies everyone.
          </p>
          <textarea
            className="section-input"
            type="text"
            value={getDiagnosisText()}
            onChange={e => setDiagnosisText(e.target.value)}
          />
        </div>
        <div className="branding-section">
          <h2 className="section-heading">Possible Exposure</h2>
          <p className="section-description">
          This text will be displayed to anyone who is notified of a potential exposure.
          </p>
          <textarea
            className="section-input"
            type="text"
            value={getExposureText()}
            onChange={e => setExposureText(e.target.value)}
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
          <PendingOperationButton className="save-button" operation={saveData}>
            Save Changes
          </PendingOperationButton>
      </div>
    </div>
  ));
};

const condition = authUser => {
  var result = authUser && authUser.roles[ROLES.ADMIN];
  return result;
}

const AccountBranding =  compose(
  withAuthorization(condition),
)(AccountBrandingBase);

export default AccountBranding;