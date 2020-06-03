import React, { useState, createRef } from 'react'
import Button from '@material-ui/core/Button'
import Toast from '../components/Toast'
import info_icon from '../../assets/info-icon.svg'
import '../../Styles/screens/code_validations.scss'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'

// snackbars docs can be found here:
// https://material-ui.com/components/snackbars/

const CodeValidationsBase = observer((props) => {
  const [code, setCode] = useState('')
  const [date, setDate] = useState('')

  let confirmedToast = createRef()

  return props.store.user.isSignedIn ? (
    <div className="module-container">
      {/* this is a Snackbar template to use for the success/failure notifications */}

      <PageTitle title="Positive Test Validations" />
      <h1>Positive Test Validations</h1>
      <div id="actions-box" className="gray-background">
        <div className="action-section">
          <div className="section-heading-container">
            <h2 className="section-heading">Validation Code</h2>
            <div className="tooltip">
              <img src={info_icon} alt="info" />
              <div className="tooltip-msg">
                {/* to replace tooltip text here: */}
                <div className="tooltip-title">This the tooltip title</div>
                <div className="tooltip-body">
                  Quisque sagittis, vel hendrerit consectetur tincidunt senectus. Feugiat aenean nunc, tempus tempus,
                  porta nibh. Nunc id donec enim ut potenti risus amet amet.
                </div>
              </div>
            </div>
          </div>
          <p className="section-description">
            Enter the positive test validation code the user gave to you over the phone.
          </p>
          <input type="text" placeholder="281-177-9" onChange={(e) => setCode(e.target.value)}></input>
        </div>

        <div className="action-section">
          <h2 className="section-heading">Tracing Start Date</h2>
          <p className="section-description">
            Enter facilisis etiam. Felis sed blandit in lacus urna et, arcu notiar, dui, lorem.
          </p>
          <input type="date" onChange={(e) => setDate(e.target.value)}></input>
        </div>

        <div id="white-box" className="white-background">
          {/* circle loading graphic demo working:
            To do: trigger this upon click and loading of data.  Will this data processing take sufficiently long to justify having this loading graphic at all?
          */}
          {/* <div id="progress-container">
            <CircularProgress />
          </div> */}

          <Button
            id={`verify-code-btn${date === '' || code === '' ? '-disabled' : ''}`}
            onClick={() => confirmedToast.current.show()}
            disabled={date === '' || code === ''}
          >
            Verify Code
          </Button>
        </div>
      </div>
      <Toast ref={confirmedToast} isSuccess={true} message="Code verification confirmed" />
    </div>
  ) : (
    <Redirect to={ROUTES.LANDING} />
  )
})

const CodeValidations = withStore(CodeValidationsBase)

export default CodeValidations
