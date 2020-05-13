import React, { Fragment, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { compose } from 'recompose';
import  * as ROUTES from '../constants/routes';
import store from '../store'


const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  redirect: false,
};


class SignInFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  clickSubmit = async (event) => {
    event.preventDefault()
    //this.setValues({ ...values, error: false })
    const { email, password } = this.state;


    try {
      await store.signIn(email, password);
      if (store.user) {
        this.props.history.push(store.user.isAdmin ?
          ROUTES.MANAGE_MEMBERS : ROUTES.CODE_VALIDATIONS);
      }
      //setValues({ ...values, redirect: store.user.isAdmin })
    } catch (err) {
      console.log(err)
      setValues({ ...values, redirect: store.user.isAdmin })
    }
  }


  onSubmit = event => {
    event.preventDefault();
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then((user) => {
        this.setState({ ...INITIAL_STATE });
        this.props.firebase.generateUserDocument(user.user).then( userDoc => { 
          if (userDoc.isAdmin === true) {
            this.props.history.push(ROUTES.MANAGE_MEMBERS);
          }
        })
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  bottomLevelContent = () => (
    <Fragment>
      <div className="doctorContainer">
        <div className="doctor1">
          <img src="/client/assets/doctor1.svg" />
        </div>
        <div className="doctor2">
          <img src="/client/assets/doctor2.svg" />
        </div>
      </div>
    </Fragment>
  )

  loginForm = () => (
    <Fragment>
      <div className="topNav">
          <img src="/client/assets/ucsf-health.svg" id="ucsfLogo" />
          <img src="/client/assets/powered-by-cw.svg" id="poweredByCWLogo" />
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