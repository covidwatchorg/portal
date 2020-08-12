import React, { useState, useEffect } from 'react'
import Toast from '../components/Toast'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import PendingOperationButton from '../components/PendingOperationButton'
import Clock from '../../assets/clock.svg'
import {
  getOneHourAheadDisplayString,
  getFourteenDaysAgoString,
  moreThanFourteenDaysAgo,
  dateInFuture,
  getTodayString,
  getDefaultTimezoneString,
  localStringToZeroUTCOffsetString,
} from '../util/time'

const codePlaceholder = '00000000'

const CodeValidationsBase = observer((props) => {
  const [testType, setTestType] = useState('')
  const [symptomDate, setSymptomDate] = useState('')
  const [dateInvalid, setDateInvalid] = useState(false)
  const [needsReset, setNeedsReset] = useState(false)
  const [code, setCode] = useState(codePlaceholder)
  const [codeGenStamp, setCodeGenStamp] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [expirationTime, setExpirationTime] = useState('')
  const [toastInfo, setToastInfo] = useState({
    success: false,
    msg: '',
  })

  let confirmedToast = React.createRef()

  useEffect(() => {
    updateButtonDisabled()
  })

  // Updates the buttonDisabled variable state based on other state variables
  const updateButtonDisabled = () => {
    if (needsReset || testType === '' || dateInvalid) {
      setButtonDisabled(true)
    } else {
      setButtonDisabled(false)
    }
  }

  const genNewCode = async () => {
    try {
      let code = await props.store.getVerificationCode({
        testType: testType,
        symptomDate: symptomDate === '' ? symptomDate : localStringToZeroUTCOffsetString(symptomDate),
      })
      setCode(code.data.split('').join(''))
      codeTimeStamp()
      setNeedsReset(true)
      updateButtonDisabled()
    } catch (err) {
      setToastInfo({ success: false, msg: 'Could not generate new code, please try again' })
      confirmedToast.current.show()
    }
  }

  const handleRadio = (e) => {
    setTestType(e.target.value)
    updateButtonDisabled()
  }

  const handleDate = (e) => {
    e.target.classList.add('with-value')
    e.target.classList.remove('no-value')

    // does not allow symptomDate in state to be set if date selected is more than 14 days ago or in the future
    if (moreThanFourteenDaysAgo(e.target.value)) {
      setDateInvalid(true)
      setToastInfo({ success: false, msg: 'Date cannot be more than 14 days ago' })
      confirmedToast.current.show()
    } else if (dateInFuture(e.target.value)) {
      setDateInvalid(true)
      setToastInfo({ success: false, msg: 'Date cannot be in the future' })
      confirmedToast.current.show()
    } else {
      setDateInvalid(false)
      setSymptomDate(e.target.value)
    }
    updateButtonDisabled()
  }

  const resetState = () => {
    document.getElementById('radio-form').reset()
    document.getElementById('date-form').reset()
    document.getElementById('date-picker').classList.remove('with-value')
    document.getElementById('date-picker').classList.add('no-value')
    document.getElementById('code-box').classList.toggle('with-value')
    document.getElementById('code-box').classList.toggle('no-value')
    document.getElementById('code-box').classList.toggle('code-generated')
    setCode(codePlaceholder)
    setCodeGenStamp('')
    setSymptomDate('')
    setTestType('')
    setNeedsReset(false)
    setDateInvalid(false)
    updateButtonDisabled()
  }

  const codeTimeStamp = () => {
    // since this is nearly the same moment that a code is generated, we also make the code text black (this assumes the API call will never fail)
    document.getElementById('code-box').classList.toggle('with-value')
    document.getElementById('code-box').classList.toggle('no-value')
    document.getElementById('code-box').classList.toggle('code-generated')
    setCodeGenStamp(new Date().getMinutes())
    setExpirationTime(getOneHourAheadDisplayString())
  }

  return !props.store.data.user.isSignedIn ||
    props.store.data.user.isFirstTimeUser ||
    (props.store.data.user.passwordResetRequested && props.store.data.user.signedInWithEmailLink) ? (
    <Redirect to={ROUTES.LANDING} />
  ) : (
    <div className="module-container" id="diagnosis-codes">
      <PageTitle title="Diagnosis Verification Codes" />
      <h1>Diagnosis Verification Codes</h1>
      <h2>Submit this form when you are prepared to generate and immediately share the code with a patient.</h2>
      <div className="row" id="test-type-form">
        <div className="col-1">
          <div className="sect-header">COVID-19 Diagnosis</div>
        </div>
        <form id="radio-form" className="col-2">
          <div className="radio">
            <input
              className="radio-input"
              name="testType"
              type="radio"
              onClick={handleRadio}
              id="confirmed"
              value="confirmed"
            ></input>
            <label htmlFor="confirmed" className="col-2-header-container">
              <div className="col-2-header">Confirmed Positive Test</div>
              <div className="col-2-sub-header">Confirmed positive result from an official testing source.</div>
            </label>
          </div>

          <div className="radio">
            <input
              className="radio-input"
              name="testType"
              type="radio"
              onClick={handleRadio}
              id="likely"
              value="likely"
            ></input>
            <label htmlFor="likely" className="col-2-header-container">
              <div className="col-2-header">Likely Positive Diagnosis</div>
              <div className="col-2-sub-header">Clincial diagnosis without a test.</div>
            </label>
          </div>

          <div className="radio">
            <input
              className="radio-input"
              name="testType"
              type="radio"
              onClick={handleRadio}
              id="negative"
              value="negative"
            ></input>
            <label htmlFor="negative" className="col-2-header-container">
              <div className="col-2-header">Confirmed Negative Test</div>
              <div className="col-2-sub-header">Confirmed negative result from an official testing source.</div>
            </label>
          </div>
        </form>
      </div>

      <div className="row" id="onset-date-form">
        <div className="col-1">
          <div className="sect-header">Symptom Onset Date</div>
          <p>The date must be within the past 14 days</p>
        </div>
        <div className="col-2">
          <form id="date-form">
            <input
              id="date-picker"
              className="no-value"
              type="date"
              min={getFourteenDaysAgoString()}
              max={getTodayString()}
              onChange={handleDate}
            ></input>
          </form>
          <p className="date-desc">Time zone set to {getDefaultTimezoneString()}</p>
        </div>
      </div>

      <div className="row" id="code-form">
        <div className="col-1">
          <div className="sect-header">Diagnosis Verification Code</div>
          <p>
            Ask the patient to enter this code in the Covid Watch mobile app so that they can anonymously share a
            verified positive diagnosis with others who were nearby when they were possibly contagious.
          </p>
        </div>
        <div className="col-2">
          <PendingOperationButton disabled={buttonDisabled} className="save-button" operation={genNewCode}>
            Generate Code
          </PendingOperationButton>
          <div id="code-box" className="no-value">
            {code}
          </div>

          {needsReset && (
            <div>
              <div id="share-urgently">
                <img src={Clock}></img>
                <div>Share the code ASAP. &nbsp;</div>
                <span>
                  It will expire in {60 - Math.abs(codeGenStamp - new Date().getMinutes())} min at {expirationTime}
                </span>
              </div>

              <PendingOperationButton operation={resetState} className="save-button">
                Reset Code and Form
              </PendingOperationButton>
            </div>
          )}
        </div>
      </div>
      <Toast ref={confirmedToast} isSuccess={toastInfo.success} message={toastInfo.msg} />
    </div>
  )
})

const CodeValidations = withStore(CodeValidationsBase)

export default CodeValidations
