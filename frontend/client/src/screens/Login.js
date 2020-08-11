import React, { Fragment, createRef } from 'react'
import { Redirect } from 'react-router-dom'
import * as ROUTES from '../constants/routes'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import ForgotPasswordModal from '../components/ForgotPasswordModal'
import PageTitle from '../components/PageTitle'
import Toast from '../components/Toast'
import ChangePasswordModal from '../components/ChangePasswordModal'
import Logging from '../util/logging'
import PendingOperationButton from '../components/PendingOperationButton'
import Students from '../../assets/students.svg'

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  redirect: false,
  showPassModal: false,
  toastMessage: '',
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

    componentDidMount() {
      document.getElementById('email').select()
    }

    clickSubmit = async () => {
      const { email, password } = this.state
      try {
        await this.props.store.signInWithEmailAndPassword(email, password)
      } catch (err) {
        this.setState({ toastMessage: 'Unable to login. Email or password may be invalid.' })
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
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        var email = window.localStorage.getItem('emailForSignIn')
        if (!email) {
          // User opened the link on a different device. To prevent session fixation
          // attacks, ask the user to provide the associated email again. For example:
          email = window.prompt('Please provide your email for confirmation')
        }
        await this.props.store
          .signInWithEmailLink(email, window.location.href)
          .then(() => {
            // Clear email from storage.
            window.localStorage.removeItem('emailForSignIn')
            // You can access the new user via result.user
            // Additional user info profile not available via:
            // result.additionalUserInfo.profile == null
            // You can check if the user is new or existing:
            // result.additionalUserInfo.isNewUser
            Logging.log('Logged in via signInWithEmailLink')
          })
          .catch((err) => {
            // Some error occurred, you can inspect the code: error.code
            // Common errors could be invalid email and invalid or expired OTPs.
            Logging.error(err)
            if (err.code === 'auth/expired-action-code') {
              this.setState({
                toastMessage:
                  'This magic link has expired. Please sign in with your password or restart the password recovery process.',
              })
            } else {
              // Neither auth/invalid-email nor auth/user-disabled should happen
              this.setState({ toastMessage: 'Invalid magic link' })
            }
            this.errorToast.current.show()
          })
      }
    }

    loginForm = () => (
      <Fragment>
        <PageTitle title="Welcome" />
        <div className="mainContainer">
          <div className="welcome">
            <h1>Covid Watch Portal</h1>
            <h3 className="small-text welcome-blurb-desktop">
              Welcome to the Portal where your team can generate diagnosis verification codes to share with patients who
              test positive for COVID-19. With your help, they can decrease their risk to others by sharing a positive
              diagnosis, which allows the app to anonymously notify those who were nearby when the patient was likely
              infectious. <a href="https://www.covidwatch.org">Learn more</a>.
            </h3>

            <div id="students-container">
              <img src={Students}></img>
            </div>
          </div>
          <form className="loginContainer">
            <label className="small-text" htmlFor="email">
              Email Address
            </label>
            <input onChange={this.onChange('email')} type="email" id="email" name="email" />
            <label className="small-text" htmlFor="password">
              Password
            </label>
            <input onChange={this.onChange('password')} type="password" id="password" name="password" />
            <PendingOperationButton operation={this.clickSubmit} className="save-button" style={{ width: '370px' }}>
              Login
            </PendingOperationButton>
            <a onClick={this.showModal}>Forgot password?</a>
          </form>
          <h3 className="small-text welcome-blurb-mobile">
            <a href="https://www.covidwatch.org">Learn more</a>.
          </h3>
          <ForgotPasswordModal hidden={!this.state.showPassModal} onClose={this.hideModal} />
        </div>
        <Toast ref={this.errorToast} isSuccess={false} message={this.state.toastMessage} />
      </Fragment>
    )

    render() {
      return (
        <Fragment>
          <div className="module-container module-container-login">{this.loginForm()}</div>
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
