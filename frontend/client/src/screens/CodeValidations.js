import React, { useState } from 'react'
// import Toast from '../components/Toast'
import '../../Styles/screens/code_validations.scss'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
// import PendingOperationButton from '../components/PendingOperationButton'

const CodeValidationsBase = observer((props) => {
  // const [code, setCode] = useState('')
  const [testType, setTestType] = useState('')
  const [testDate, setDate] = useState('')
  // const [toastInfo, setToastInfo] = useState({
  //   success: false,
  //   msg: '',
  // })

  // let confirmedToast = createRef()

  // const genNewCode = async () => {
  //   try {
  //     // TODO: testType and testDate should be set by fields in the interface; blocked awaiting v4 figma
  //     let code = await props.store.getVerificationCode({
  //       testType: 'confirmed',
  //       testDate: new Date().toJSON().substring(0, 10),
  //     })
  //     setCode(code.data.split('').join(' '))
  //   } catch (err) {
  //     setToastInfo({ success: false, msg: 'Could not generate new code, please try again' })
  //     confirmedToast.current.show()
  //   }
  // }

  const handleRadio = (e) => {
    setTestType(e.target.value)
  }

  const handleDate = (e) => {
    setDate(e.target.value)
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
      <p>{testType}</p>
      <p>{testDate}</p>

      <div className="row" id="test-type-form">
        <div className="col-1">
          <div className="sect-header">COVID-19 Diagnosis</div>
        </div>
        <div className="col-2">
          <div className="radio">
            <input name="testType" type="radio" onClick={handleRadio} value="confirmed"></input>
            <div className="col-2-header-container">
              <div className="col-2-header">Confirmed Positive Test</div>
              <div className="col-2-sub-header">Confirmed positive result from an official testing source.</div>
            </div>
          </div>

          <div className="radio">
            <input name="testType" type="radio" onClick={handleRadio} value="likely"></input>
            <div className="col-2-header-container">
              <div className="col-2-header">Likely Positive Diagnosis</div>
              <div className="col-2-sub-header">Clincial diagnosis without a test.</div>
            </div>
          </div>

          <div className="radio">
            <input name="testType" type="radio" onClick={handleRadio} value="negative"></input>
            <div className="col-2-header-container">
              <div className="col-2-header">Confirmed Negative Test</div>
              <div className="col-2-sub-header">Confirmed negative result from an official testing source.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row" id="test-date-form">
        <div className="col-1">
          <div className="sect-header">Symptom Onset Date</div>
          <p>The date must be within the past 14 days</p>
        </div>
        <div className="col-2">
          <input name="date" type="date" onChange={handleDate}></input>
          <div className="date-desc">This system is basted on UTC dates, so you may need to adjust accordingly.</div>
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
        <div className="col-2"></div>
      </div>

      {/* <div id="actions-box" className="gray-background">
        <div className="validation-container">
          <div className="section-heading-container">
            <h2>Validation Code</h2>
          </div>
          <div className="validation-text">
            Provide this code to the person you want to verify over the phone. Each code can only be used once.
          </div>
          <div className="code-box">{code}</div>
          <PendingOperationButton className="save-button generate-button" operation={genNewCode}>
            Generate New Code
          </PendingOperationButton>
        </div> */}
      {/* </div> */}
      {/* <Toast ref={confirmedToast} isSuccess={toastInfo.success} message={toastInfo.msg} /> */}
    </div>
  )
})

const CodeValidations = withStore(CodeValidationsBase)

export default CodeValidations
