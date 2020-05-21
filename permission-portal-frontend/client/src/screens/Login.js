import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import * as ROUTES from '../constants/routes'
import doctor1 from '../../assets/doctor1.svg'
import doctor2 from '../../assets/doctor2.svg'
import ucsf_health from '../../assets/ucsf-health.svg'
import powered_by_cw from '../../assets/powered-by-cw.svg'
import { withStore } from '../state'

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  redirect: false,
}

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
      this.props.history.push(this.props.store.user.isAdmin ? ROUTES.MANAGE_MEMBERS : ROUTES.CODE_VALIDATIONS)
    } catch (err) {
      console.warn(err)
    }
  }

  onChange = (name) => (event) => {
    this.setState({ [name]: event.target.value })
  }

  bottomLevelContent = () => (
    <Fragment>
      <div className="doctorContainer">
        <div className="doctor1">
          <img src={doctor1} />
        </div>
        <div className="doctor2">
          <img src={doctor2} />
        </div>
      </div>
    </Fragment>
  )

  loginForm = () => (
    <Fragment>
      <div className="topNav">
        <img src={ucsf_health} id="ucsfLogo" />
        <img src={powered_by_cw} id="poweredByCWLogo" />
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
          <a href="url">Forgot password?</a>
        </div>
      </div>
    </Fragment>
  )

  render() {
    return (
      <Fragment>
        {this.loginForm()}
        {this.bottomLevelContent()}
      </Fragment>
    )
  }
}

const SignInForm = compose(withStore, withRouter)(SignInFormBase)

const Login = () => <SignInForm />

export default Login
