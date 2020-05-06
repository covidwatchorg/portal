import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { signin } from '../auth'



function Copyright() {
  return (
    <p>Copyright</p>
  );
}

const Login = () => {

  const [values, setValues] = useState({
    email: '',
    password: '',
    error: '',
    redirect: false,
  })

  const { email, password, error, redirect } = values

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value })
  }

  const clickSubmit = (event) => {
    event.preventDefault()
    setValues({ ...values, error: false })
    signin.checkIfAdmin({ email, password });
    if (signin.isAdmin === true) {
      setValues({ ...values, redirect: true })
    }
  }


  const redirectUser = () => {
    if (redirect === true) {
      console.log('redirecting')
      return <Redirect to='/orgAdmin' />
    }
  }

  const loginForm = () => (
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
  )

  return (
    <React.Fragment>
      {loginForm()}
      {redirectUser()}
    </React.Fragment>

  )
};

export default Login;
