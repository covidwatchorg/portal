import React, { Fragment, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { compose } from 'recompose';


//import { Redirect } from 'react-router-dom';
//import { signin } from '../util/auth';

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};
class SignInFormBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };


  

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };



  render() {
    return (
      <React.Fragment>
        <div className="topNav">
        <img src="/client/assets/ucsf-health.svg" id="ucsfLogo" />
        <img src="/client/assets/powered-by-cw.svg" id="poweredByCWLogo" />
      </div>
      <div className="mainContainer">
        <div className="welcome">
          <h1 id="heroTitle">Welcome to the Covid Watch Community Tracing Portal</h1>
          <h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquet nullam condimentum quam magna tortor.</h3>
        </div>
        <div className="loginContainer">
          <label for="email">Email</label>
          <input onChange={handleChange('email')} type="email" id="email" name="email" />
          <label for="password">Password</label>
          <input onChange={handleChange('password')} type="password" id="password" name="password" />
          <button onClick={clickSubmit}>
            Login
            </button>
          <a href="url">Forgot password?</a>
        </div>
      </div>
      </React.Fragment>
    );
  }
}


const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

const Login = () => (
    <SignInForm />
);
 

export default Login;
