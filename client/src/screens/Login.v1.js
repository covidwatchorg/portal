import React, { Fragment, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { compose } from 'recompose';
import { Redirect } from 'react-router-dom';
import  * as ROUTES from '../constants/routes';


//import { Redirect } from 'react-router-dom';
//import { signin } from '../util/auth';

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

  onSubmit = event => {
    event.preventDefault();

    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then((user) => {
        this.setState({ ...INITIAL_STATE });
        this.props.firebase.generateUserDocument(user.user).then( userDoc => { 
          if (userDoc.isAdmin === true) {
            this.props.history.push(ROUTES.ORG_ADMIN);

            //this.setState({redirect:true});
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
/*
  redirectUser = () => {
    const { redirect } = this.state;

    if (redirect === true) {
      console.log('redirecting');
      return <Redirect to='/orgAdmin' />;
    }
  };*/

  //loginForm = () => (
  render() {
    return (
    <Fragment>
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
          <label htmlFor="email">Email</label>
          <input   onChange={this.onChange('email')} type="email" id="email" name="email" />
          <label htmlFor="password">Password</label>
          <input onChange={this.onChange('password')} type="password" id="password" name="password" />
          <button onClick={this.onSubmit}>
            Login
            </button>
          <a href="url">Forgot password?</a>
        </div>
      </div>
    </Fragment>
    );
  }
/*
  
  render() {
    return (
      <React.Fragment>
        {this.loginForm()}
        {this.redirectUser()}
      </React.Fragment>
    );
  }
  render() {
    return (
      <Fragment>
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
          <label htmlFor="email">Email</label>
          <input   onChange={this.onChange('email')} type="email" id="email" name="email" />
          <label htmlFor="password">Password</label>
          <input onChange={this.onChange('password')} type="password" id="password" name="password" />
          <button onClick={this.onSubmit}>
            Login
            </button>
          <a href="url">Forgot password?</a>
        </div>
      </div>
      </Fragment>
    );
    
  }*/
}


const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

const Login = () => (
    <SignInForm />
);
 

export default Login;
