import React, { Fragment, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { compose } from 'recompose';
import  * as ROUTES from '../constants/routes';
import store from '../store'
import doctor1 from '../../assets/doctor1.svg'
import doctor2 from '../../assets/doctor2.svg'
import ucsf_health from '../../assets/ucsf-health.svg'
import powered_by_cw from '../../assets/powered-by-cw.svg'
import ForgotPasswordModal from '../screens/ForgotPasswordModal'


const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  redirect: false,
  showPassModal: false,
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
    } catch (err) {
      console.log(err)
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
  
    showModal = () => {
        this.setState({ showPassModal: true });
    };

    hideModal = () => {
        this.setState({ showPassModal: false });
    };



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
                <img src={powered_by_cw}  id="poweredByCWLogo" />
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
                <ForgotPasswordModal hidden={!this.state.showPassModal} onClose={this.hideModal}/>  
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
