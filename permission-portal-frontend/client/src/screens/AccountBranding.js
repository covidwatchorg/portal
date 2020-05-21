import React, { useState } from 'react'
import PendingOperationButton from '../components/PendingOperationButton'
import Toast from '../components/Toast'
import '../../Styles/screens/branding.scss'
import { compose } from 'recompose'
import { withStore } from '../state'
import { Redirect } from 'react-router-dom'
import * as ROUTES from '../constants/routes'

const AccountBrandingBase = (props) => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [toastShouldOpen, setToastShouldOpen] = useState(false)

  const [diagnosisText, setDiagnosisText] = useState(props.store.organization.diagnosisText)
  const [exposureText, setExposureText] = useState(props.store.organization.exposureText)

  const onContactUsClicked = () => {
    console.log('TODO contact us')
  }

  const saveData = async () => {
    try {
      await props.store.updateOrganization({ diagnosisText: diagnosisText, exposureText: exposureText })
      console.log('Branding data saved successfully')
      setIsSuccess(true)
      setToastShouldOpen(true)
    } catch (err) {
      console.log(`Branding data failed to save: ${err}`)
      setIsSuccess(false)
      setToastShouldOpen(true)
    }
  }

  return props.store.user.isSignedIn && props.store.user.isAdmin ? (
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
            defaultValue={props.store.organization.diagnosisText}
            onChange={(e) => setDiagnosisText(e.target.value)}
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
            defaultValue={props.store.organization.exposureText}
            onChange={(e) => setExposureText(e.target.value)}
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
      <Toast
        open={toastShouldOpen}
        onClose={() => setToastShouldOpen(false)}
        isSuccess={isSuccess}
        message={isSuccess ? 'Branding saved successfully' : 'Failed to save branding'}
      />
    </div>
  ) : props.store.user.isSignedIn ? (
    <Redirect to={ROUTES.SETTINGS} />
  ) : (
    <Redirect to={ROUTES.SETTINGS} />
  )
}

const AccountBranding = compose(withStore)(AccountBrandingBase)

export default AccountBranding
