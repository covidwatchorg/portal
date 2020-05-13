import React, { Fragment, useState } from 'react'
import { Redirect } from 'react-router-dom'
import store from '../store'
import doctor1 from '../../assets/doctor1.svg'
import doctor2 from '../../assets/doctor2.svg'
import ucsf_health from '../../assets/ucsf-health.svg'
import powered_by_cw from '../../assets/powered-by-cw.svg'

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

  const clickSubmit = async (event) => {
    event.preventDefault()
    setValues({ ...values, error: false })
    console.log(`isAdmin = ${store.user.isAdmin}`)

    try {
      await store.user.signIn(email, password);
      setValues({ ...values, redirect: store.user.isAdmin })
    } catch (err) {
      console.log(err)
      setValues({ ...values, redirect: store.user.isAdmin })
    }
  }

  const redirectUser = () => {
    if (redirect === true) {
      console.log('redirecting')
      return <Redirect to="/manage_members" />
    }
  }

  const bottomLevelContent = () => (
    <fragment>
      <div className="doctorContainer">
        <div className="doctor1">
          <img src={doctor1} />
        </div>
        <div className="doctor2">
          <img src={doctor2} />
        </div>
      </div>
    </fragment>
  )

  const loginForm = () => (
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
          <label for="email">Email</label>
          <input onChange={handleChange('email')} type="email" id="email" name="email" />
          <label for="password">Password</label>
          <input onChange={handleChange('password')} type="password" id="password" name="password" />
          <button onClick={clickSubmit}>Login</button>
          <a href="url">Forgot password?</a>
        </div>
      </div>
    </Fragment>
  )

  return (
    <React.Fragment>
      {loginForm()}
      {redirectUser()}
      {bottomLevelContent()}
    </React.Fragment>
  )
}

export default Login
