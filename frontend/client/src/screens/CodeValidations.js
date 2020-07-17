import React, { useState, createRef } from 'react'
import Toast from '../components/Toast'
import '../../Styles/screens/code_validations.scss'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import PendingOperationButton from '../components/PendingOperationButton'
import Clock from '../../assets/clock.svg'
import { getOneHourAhead, getDay, getFourteenDaysAgo, moreThanFourteenDaysAgo, dateInFuture } from '../util/time'

const codePlaceholder = '00000000'

const CodeValidationsBase = observer((props) => {
  const [code, setCode] = useState(codePlaceholder)
  const [testType, setTestType] = useState('')
  const [testDate, setTestDate] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [codeGenStamp, setCodeGenStamp] = useState('')
  const [toastInfo, setToastInfo] = useState({
    success: false,
    msg: '',
  })

  let confirmedToast = createRef()

  const genNewCode = async () => {
    try {
      let code = await props.store.getVerificationCode({
        testType: testType,
        testDate: testDate,
      })
      setCode(code.data.split('').join(''))
      codeTimeStamp()
      setButtonDisabled(true)
    } catch (err) {
      setToastInfo({ success: false, msg: 'Could not generate new code, please try again' })
      confirmedToast.current.show()
    }
  }

  const handleRadio = (e) => {
    setTestType(e.target.value)
    if (testDate != '' && testType === '') {
      setButtonDisabled(false)
    }
  }

  const handleDate = (e) => {
    e.target.classList.add('with-value')
    e.target.classList.remove('no-value')

    // does not allow testDate in state to be set if date selected is more than 14 days ago or in the future
    if (moreThanFourteenDaysAgo(e.target.value)) {
      setToastInfo({ success: false, msg: 'Date cannot be more than 14 days ago' })
      confirmedToast.current.show()
    } else if (dateInFuture(e.target.value)) {
      setToastInfo({ success: false, msg: 'Date cannot be in the future' })
      confirmedToast.current.show()
    } else {
      setTestDate(e.target.value)
      if (testType !== '' && testDate === '') {
        setButtonDisabled(false)
      }
    }
  }

  const resetState = () => {
    document.getElementById('radio-form').reset()
    document.getElementById('date-form').reset()
    document.getElementById('date-picker').classList.remove('with-value')
    document.getElementById('date-picker').classList.add('no-value')
    document.getElementById('code-box').classList.toggle('with-value')
    document.getElementById('code-box').classList.toggle('no-value')
    document.getElementById('code-box').classList.toggle('code-generated')
    setButtonDisabled(true)
    setCode(codePlaceholder)
    setTestType('')
    setTestDate('')
    setCodeGenStamp('')
  }

  const codeTimeStamp = () => {
    // since this is nearly the same moment that a code is generated, we also make the code text black (this assumes the API call will never fail)
    document.getElementById('code-box').classList.toggle('with-value')
    document.getElementById('code-box').classList.toggle('no-value')
    document.getElementById('code-box').classList.toggle('code-generated')
    setCodeGenStamp(new Date().getMinutes())
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
            <input className="radio-input" name="testType" type="radio" onClick={handleRadio} value="confirmed"></input>
            <div className="col-2-header-container">
              <div className="col-2-header">Confirmed Positive Test</div>
              <div className="col-2-sub-header">Confirmed positive result from an official testing source.</div>
            </div>
          </div>

          <div className="radio">
            <input className="radio-input" name="testType" type="radio" onClick={handleRadio} value="likely"></input>
            <div className="col-2-header-container">
              <div className="col-2-header">Likely Positive Diagnosis</div>
              <div className="col-2-sub-header">Clincial diagnosis without a test.</div>
            </div>
          </div>

          <div className="radio">
            <input className="radio-input" name="testType" type="radio" onClick={handleRadio} value="negative"></input>
            <div className="col-2-header-container">
              <div className="col-2-header">Confirmed Negative Test</div>
              <div className="col-2-sub-header">Confirmed negative result from an official testing source.</div>
            </div>
          </div>
        </form>
      </div>

      <div className="row" id="test-date-form">
        <div className="col-1">
          <div className="sect-header">Test Date</div>
          <p>The date must be within the past 14 days</p>
        </div>
        <div className="col-2">
          <form id="date-form">
            <input
              id="date-picker"
              className="no-value"
              type="date"
              min={getFourteenDaysAgo()}
              max={getDay()}
              onChange={handleDate}
            ></input>
          </form>
          <div className="date-desc">This system is based on UTC dates, so you may need to adjust accordingly.</div>
          <div className="date-sub-desc">The current UTC date is {new Date().toJSON().substring(0, 10)}</div>
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
              {code.slice(0, 3)}-{code.slice(3, 6)}-{code.slice(6)}
          </div>

          {code !== codePlaceholder && (
            <div>
              <div id="share-urgently">
                <img src={Clock}></img>
                <div>Share the code ASAP. &nbsp;</div>
                <span>
                  It will expire in {60 - Math.abs(codeGenStamp - new Date().getMinutes())} min at {getOneHourAhead()}
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
