import React, { useState, useEffect } from 'react'
import Toast from '../components/Toast'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import PendingOperationButton from '../components/PendingOperationButton'
import Clock from '../../assets/clock.svg'
import DatePicker from 'react-datepicker'

import {
  getOneHourAheadDisplayString,
  getDefaultTimezoneString,
  localStringToZeroUTCOffsetString,
  toDashSeperatedYYYYMMDDString,
  getFourteenDaysAgoDate,
} from '../util/time'

const codePlaceholder = '00000000'
let needsResetGlobal = false

const CodeValidationsBase = observer((props) => {
  const [testType] = useState('confirmed')
  const [symptomDateYYYYMMDD, setSymptomDateYYYYMMDD] = useState('')
  const [symptomDateObject, setSymptomDateObject] = useState()
  const [dateInvalid, setDateInvalid] = useState(false)
  const [needsReset, setNeedsReset] = useState(false)
  const [code, setCode] = useState(codePlaceholder)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [expirationTime, setExpirationTime] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [toastInfo, setToastInfo] = useState({
    success: false,
    msg: '',
  })

  const confirmedToast = React.createRef()
  const datePickerEle = React.createRef()
  const codeBoxEle = React.createRef()
  const radioFromEle = React.createRef()

  useEffect(() => {
    updateButtonDisabled()
  })

  useEffect(() => {
    needsResetGlobal = needsReset
  }, [needsReset])

  // Updates the buttonDisabled variable state based on other state variables
  const updateButtonDisabled = () => {
    if (needsReset || dateInvalid) {
      setButtonDisabled(true)
    } else {
      setButtonDisabled(false)
    }
  }

  const countdown = (num = 60) => {
    setTimeout(() => {
      if (num > 0 && needsResetGlobal) {
        setTimeLeft(num - 1)
        countdown(num - 1)
      }
    }, 600000)
  }

  const genNewCode = async () => {
    try {
      let code = await props.store.getVerificationCode({
        testType: testType,
        symptomDate:
          symptomDateYYYYMMDD === '' ? symptomDateYYYYMMDD : localStringToZeroUTCOffsetString(symptomDateYYYYMMDD),
      })
      setCode(code.data.split('').join(''))
      codeTimeStamp()
      setNeedsReset(true)
      countdown()
      updateButtonDisabled()
      props.store.analytics.logEvent('verificationCodeGenerated', {
        organizationID: props.store.data.user.organizationID,
        organizationName: props.store.data.organization.name,
      })
    } catch (err) {
      setToastInfo({
        success: false,
        msg: 'Could not generate new code, please try again',
      })
      confirmedToast.current.show()
    }
  }

  const handleDate = (date) => {
    if (date) {
      setSymptomDateObject(date)
      const selectedDate = toDashSeperatedYYYYMMDDString(date)
      setDateInvalid(false)
      setSymptomDateYYYYMMDD(selectedDate)
      updateButtonDisabled()
    } else {
      setSymptomDateObject(undefined)
      setSymptomDateYYYYMMDD('')
    }
  }

  const resetState = () => {
    datePickerEle.current.input.value = ''
    radioFromEle.current.reset()
    setCode(codePlaceholder)
    setSymptomDateYYYYMMDD('')
    setSymptomDateObject('')
    setTimeLeft(60)
    setNeedsReset(false)
    setDateInvalid(false)
    updateButtonDisabled()
  }

  const codeTimeStamp = () => {
    setExpirationTime(getOneHourAheadDisplayString())
  }

  let datePicker = (
    <DatePicker
      id="date-picker"
      ref={datePickerEle}
      className={symptomDateYYYYMMDD ? 'with-value' : 'no-value'}
      selected={symptomDateObject}
      minDate={getFourteenDaysAgoDate()}
      maxDate={new Date()}
      onChange={handleDate}
      placeholderText="Choose a date in last 14 days"
    />
  )

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
        <form id="radio-form" className="col-2" ref={radioFromEle}>
          <div className="radio">
            <input
              defaultChecked
              className="radio-input"
              name="testType"
              type="radio"
              id="confirmed"
              value="confirmed"
            ></input>
            <label htmlFor="confirmed" className="col-2-header-container">
              <div className="col-2-header">Confirmed Positive Test</div>
              <div className="col-2-sub-header">Confirmed positive result from an official testing source.</div>
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
          {datePicker}
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
          <div
            id="code-box"
            ref={codeBoxEle}
            className={code === codePlaceholder ? 'no-value' : 'with-value code-generated'}
          >
            {code}
          </div>

          {needsReset && (
            <div>
              <div id="share-urgently">
                <img src={Clock}></img>
                <div>Share the code ASAP. &nbsp;</div>
                {timeLeft > 0 ? (
                  <span>
                    It will expire in {timeLeft} min at {expirationTime}
                  </span>
                ) : (
                  <span>Code expired after 60 minutes - generate new code.</span>
                )}
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
