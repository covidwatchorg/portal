import React, { Fragment } from 'react'
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

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  redirect: false,
  showPassModal: false,
  showToast: false,
  toastMessage: 'Please enter a valid email and password',
}

const SignInFormBase = observer(
  class SignInFormBase extends React.Component {
    constructor(props) {
      super(props)
      this.state = { ...INITIAL_STATE }
      this.onChange = this.onChange.bind(this)
    }

    clickSubmit = async (event) => {
      event.preventDefault()
      const { email, password } = this.state
      try {
        await this.props.store.signInWithEmailAndPassword(email, password)
      } catch (err) {
        this.setState({ showToast: true })
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
          <img src={ucsf_health} id="orgLogo" alt={this.props.store.organization.name || 'UCSF Health'} />
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
            <button onClick={this.clickSubmit}>Login</button>
            <a onClick={this.showModal}>Forgot password?</a>
          </div>
          <ForgotPasswordModal hidden={!this.state.showPassModal} onClose={this.hideModal} />
        </div>
        <Toast
          open={this.state.showToast}
          onClose={() => this.setState({ showToast: false })}
          isSuccess={false}
          message={this.state.toastMessage}
        />
      </Fragment>
    )

    render() {
      return this.props.store.user.isSignedIn ? (
        <Redirect to={ROUTES.CODE_VALIDATIONS} />
      ) : (
        <Fragment>
          {this.loginForm()}
          {this.bottomLevelContent()}
        </Fragment>
      )
    }
  }
)

const SignInForm = withStore(SignInFormBase)

export default SignInForm
