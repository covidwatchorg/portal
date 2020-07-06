import React, { Fragment, createRef } from 'react'
import { Redirect } from 'react-router-dom'
import * as ROUTES from '../constants/routes'
import doctor1 from '../../assets/doctor1.svg'
import doctor2 from '../../assets/doctor2.svg'
import ucsf_health from '../../assets/ucsf-health.svg'
import powered_by_cw from '../../assets/powered-by-cw.svg'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import ForgotPasswordModal from '../components/ForgotPasswordModal'
import PageTitle from '../components/PageTitle'
import Toast from '../components/Toast'
import ChangePasswordModal from '../components/ChangePasswordModal'
import Logging from '../util/logging'
import PendingOperationButton from '../components/PendingOperationButton'

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  redirect: false,
  showPassModal: false,
  toastMessage: 'Error logging in, email or password may be invalid',
}

const SignInFormBase = observer(
  class SignInFormBase extends React.Component {
    constructor(props) {
      super(props)
      this.state = { ...INITIAL_STATE }
      this.onChange = this.onChange.bind(this)
      this.errorToast = createRef()
      this.trySignInWithEmailLink()
    }

    clickSubmit = async () => {
      const { email, password } = this.state
      try {
        await this.props.store.signInWithEmailAndPassword(email, password)
      } catch (err) {
        this.errorToast.current.show()
      }
    }

    onChange = (name) => (event) => {
      this.setState({ [name]: event.target.value })
    }

    showModal = () => {
      this.setState({ showPassModal: true })
    }

    hideModal = () => {
      this.setState({ showPassModal: false })
    }

    trySignInWithEmailLink = async () => {
      // Based on https://firebase.google.com/docs/auth/web/email-link-auth
      if (this.props.store.isSignInWithEmailLink(window.location.href)) {
        Logging.log('signInWithEmailLink detected')
        var email = new URL(location.href).searchParams.get('email')
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        if (!email) {
          // User opened the link on a different device. To prevent session fixation
          // attacks, ask the user to provide the associated email again. For example:
          email = window.prompt('Please provide your email for confirmation')
        }
        await this.props.store
          .signInWithEmailLink(email, window.location.href)
          .then(() => {
            Logging.log('Logged in via signInWithEmailLink')
          })
          .catch((err) => {
            Logging.error(err)
          })
      }
    }

    bottomLevelContent = () => (
      <Fragment>
        <div className="doctorContainer">
          <div className="doctor1">
            <img src={doctor1} alt="" />
          </div>
          <div className="doctor2">
            <img src={doctor2} alt="" />
          </div>
        </div>
      </Fragment>
    )

    loginForm = () => (
      <Fragment>
        <PageTitle title="Welcome" />
        <div className="topNav">
          <img src={ucsf_health} id="orgLogo" alt={this.props.store.data.organization.name || 'UCSF Health'} />
          <img src={powered_by_cw} id="poweredByCWLogo" alt="Powered by Covid Watch" />
        </div>
        <div className="mainContainer">
          <div className="welcome">
            <h1 id="heroTitle">Welcome to the Covid Watch Community Tracing Portal</h1>
            <h3>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquet nullam condimentum quam magna tortor.
            </h3>
          </div>
          <div className="loginContainer">
            <label htmlFor="email">Email</label>
            <input onChange={this.onChange('email')} type="email" id="email" name="email" />
            <label htmlFor="password">Password</label>
            <input onChange={this.onChange('password')} type="password" id="password" name="password" />
            <PendingOperationButton operation={this.clickSubmit}>Login</PendingOperationButton>
            <a onClick={this.showModal}>Forgot password?</a>
          </div>
          <ForgotPasswordModal hidden={!this.state.showPassModal} onClose={this.hideModal} />
        </div>
        <Toast ref={this.errorToast} isSuccess={false} message={this.state.toastMessage} />
      </Fragment>
    )

    render() {
      return (
        <Fragment>
          <div className="module-container">
            {this.loginForm()}
            {this.bottomLevelContent()}
          </div>
          {this.props.store.data.user.isSignedIn ? (
            this.props.store.data.user.isFirstTimeUser ? (
              <ChangePasswordModal
                visible={true}
                heading={'Welcome!'}
                subHeading={
                  'To make your account secure, please create a new password to replace the temporary password you were given in the email invitation.'
                }
              />
            ) : this.props.store.data.user.passwordResetCompletedInCurrentSession ||
              (this.props.store.data.user.passwordResetRequested &&
                this.props.store.data.user.signedInWithEmailLink) ? (
              <ChangePasswordModal visible={true} heading={'Reset Password'} subHeading={''} />
            ) : (
              <Redirect to={ROUTES.CODE_VALIDATIONS} />
            )
          ) : null}
        </Fragment>
      )
    }
  }
)

const SignInForm = withStore(SignInFormBase)

export default SignInForm
