import React, { useState, createRef } from 'react'
import Toast from '../components/Toast'
import info_icon from '../../assets/info-icon.svg'
import '../../Styles/screens/code_validations.scss'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import PendingOperationButton from '../components/PendingOperationButton'

// snackbars docs can be found here:
// https://material-ui.com/components/snackbars/

const CodeValidationsBase = observer((props) => {
  const [code, setCode] = useState('123-45-6')
  const [toastInfo, setToastInfo] = useState({
    success: false,
    msg: '',
  })

  let confirmedToast = createRef()

  //TODO show confired toast when code confirmed by app

  const genNewCode = async () => {
    // TODO get new code from server
    try {
      setCode('123-45-9')
    } catch (err) {
      setToastInfo({ success: false, msg: 'Could not generate new code, please try again' })
      confirmedToast.current.show()
    }
  }

  return props.store.data.user.isSignedIn ? (
    <div className="module-container">
      <PageTitle title="Positive Test Validations" />
      <h1>Positive Test Validations</h1>
      <div id="actions-box" className="gray-background">
        <div className="validation-container">
          <div className="section-heading-container">
            <h2>Validation Code</h2>
            <div className="tooltip">
              <img src={info_icon} alt="info" />
              <div className="tooltip-msg">
                {/* TODO replace tooltip text */}
                <div className="tooltip-title">Test Validation Codes</div>
                <div className="tooltip-body">
                  Quisque sagittis, vel hendrerit consectetur tincidunt senectus. Feugiat aenean nunc, tempus tempus,
                  porta nibh. Nunc id donec enim ut potenti risus amet amet.
                </div>
              </div>
            </div>
          </div>
          <div className="validation-text">
            Provide this validation code to the person you want to verify over the phone
          </div>
          <div className="code-box">{code}</div>
          <PendingOperationButton className="save-button generate-button" operation={genNewCode}>
            Generate New Code
          </PendingOperationButton>
        </div>
      </div>
      <Toast ref={confirmedToast} isSuccess={toastInfo.success} message={toastInfo.msg} />
    </div>
  ) : (
    <Redirect to={ROUTES.LANDING} />
  )
})

const CodeValidations = withStore(CodeValidationsBase)

export default CodeValidations
