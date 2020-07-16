import React, { useState, useRef, useEffect } from 'react'
import Toast from '../components/Toast'
import '../../Styles/screens/branding.scss'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import * as ROUTES from '../constants/routes'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import Logging from '../util/logging'

const AccountBrandingBase = observer((props) => {
  const [isSuccess, setIsSuccess] = useState(false)

  const [diagnosisText, setDiagnosisText] = useState(props.store.data.organization.diagnosisText)
  const [exposureText, setExposureText] = useState(props.store.data.organization.exposureText)

  const [diagnosisTextIsEditing, setDiagnosisTextIsEditing] = useState(false)
  const [exposureTextIsEditing, setExposureTextIsEditing] = useState(false)

  const diagnosisTextRef = useRef()
  const exposureTextRef = useRef()

  const statusToast = useRef()

  // Called any time the v-dom is updated
  // This is functioning as a callback that gets triggered after we set any state variable
  useEffect(() => {
    if (diagnosisTextIsEditing) {
      diagnosisTextRef.current.focus()
    } else if (exposureTextIsEditing) {
      exposureTextRef.current.focus()
    }
  })

  const resetAllTextBoxes = () => {
    setDiagnosisTextIsEditing(false)
    setExposureTextIsEditing(false)
    setDiagnosisText(props.store.data.organization.diagnosisText)
    setExposureText(props.store.data.organization.exposureText)
  }

  const noTextBoxesBeingEdited = () => {
    return !(diagnosisTextIsEditing || exposureTextIsEditing)
  }

  const focusFlash = (inputRef) => {
    inputRef.current.blur()
    setTimeout(() => {
      inputRef.current.focus()
      setTimeout(() => {
        inputRef.current.blur()
        setTimeout(() => {
          inputRef.current.focus()
        }, 80)
      }, 80)
    }, 80)
  }

  const focusFlashBoxBeingEdited = () => {
    if (diagnosisTextIsEditing) {
      focusFlash(diagnosisTextRef)
    } else if (exposureTextIsEditing) {
      focusFlash(exposureTextRef)
    }
  }

  const onContactUsClicked = () => {
    Logging.log('TODO contact us')
  }

  const saveData = async () => {
    try {
      await props.store.updateOrganization({ diagnosisText: diagnosisText, exposureText: exposureText })
      Logging.log('Branding data saved successfully')
      setIsSuccess(true)
      statusToast.current.show()
    } catch (err) {
      Logging.log(`Branding data failed to save: ${err}`)
      setIsSuccess(false)
      statusToast.current.show()
    }
    setDiagnosisTextIsEditing(false)
    setExposureTextIsEditing(false)
  }

  return !props.store.data.user.isSignedIn ||
    !props.store.data.user.isAdmin ||
    props.store.data.user.isFirstTimeUser ||
    (props.store.data.user.passwordResetRequested && props.store.data.user.signedInWithEmailLink) ? (
    <Redirect to={ROUTES.LANDING} />
  ) : (
    <div className="module-container module-container-branding">
      <PageTitle title="Account Branding" />
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
            value={diagnosisText}
            onChange={(e) => setDiagnosisText(e.target.value)}
            disabled={!diagnosisTextIsEditing}
            ref={diagnosisTextRef}
            onFocus={() => {
              diagnosisTextRef.current.select()
            }}
          />
          {!diagnosisTextIsEditing ? (
            <div
              className="button btn-small btn-tertiary"
              onClick={() => {
                if (noTextBoxesBeingEdited()) {
                  setDiagnosisTextIsEditing(true)
                } else {
                  focusFlashBoxBeingEdited()
                }
              }}
            >
              Edit
            </div>
          ) : (
            <div>
              <div className="button btn-small btn-tertiary" style={{ display: 'inline-block' }} onClick={saveData}>
                Save
              </div>
              <div
                className="button btn-small btn-gray cancel-button"
                style={{ display: 'inline-block' }}
                onClick={resetAllTextBoxes}
              >
                Cancel
              </div>
            </div>
          )}
        </div>
        <div className="branding-section">
          <h2 className="section-heading">Possible Exposure</h2>
          <p className="section-description">
            This text will be displayed to anyone who is notified of a potential exposure.
          </p>
          <textarea
            className="section-input"
            type="text"
            value={exposureText}
            onChange={(e) => setExposureText(e.target.value)}
            disabled={!exposureTextIsEditing}
            ref={exposureTextRef}
            onFocus={() => {
              exposureTextRef.current.select()
            }}
          />
          {!exposureTextIsEditing ? (
            <div
              className="button btn-small btn-tertiary"
              onClick={() => {
                if (noTextBoxesBeingEdited()) {
                  setExposureTextIsEditing(true)
                } else {
                  focusFlashBoxBeingEdited()
                }
              }}
            >
              Edit
            </div>
          ) : (
            <div>
              <div className="button btn-small btn-tertiary" style={{ display: 'inline-block' }} onClick={saveData}>
                Save
              </div>
              <div
                className="button btn-small btn-gray cancel-button"
                style={{ display: 'inline-block' }}
                onClick={resetAllTextBoxes}
              >
                Cancel
              </div>
            </div>
          )}
        </div>
        <div className="branding-section">
          <h2 className="section-heading">Other Branding and Customization</h2>
          <p className="section-description">
            Your dedicated account manager will gladly help you with other branding and customization needs.
          </p>
          <div className="button btn-short-and-wide btn-tertiary" id="contact-button" onClick={onContactUsClicked}>
            Contact Us
          </div>
        </div>
      </div>
      <Toast
        ref={statusToast}
        isSuccess={isSuccess}
        message={isSuccess ? 'Branding saved successfully' : 'Failed to save branding'}
      />
    </div>
  )
})

const AccountBranding = withStore(AccountBrandingBase)

export default AccountBranding
