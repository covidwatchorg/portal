import React from 'react'
import { Link } from 'react-router-dom'
import MaleDoctor from '../../assets/404-doctor.svg'
import FemaleDoctor from '../../assets/female-doctor-404.svg'
import '../../Styles/screens/404.scss'
import PageTitle from '../components/PageTitle'

const NotFound = () => {
  return (
    <div id="not-found">
      <PageTitle title="404 Not Found" />
      <div id="doctor-img">
        <img src={MaleDoctor} alt="doctor" />
      </div>

      <div id="message">
        <div id="main">404</div>
        <span>This page does not exist.</span>
        <Link className="button" to="/code_validations">
          Go Back
        </Link>

        {/* this could maybe link to a help desk page outside of React?  Just set to reload page for now */}
        <a href="/404">Get Support</a>
      </div>

      <div id="female-doctor-img">
        <img src={FemaleDoctor} alt="doctor" />
      </div>
    </div>
  )
}

export default NotFound
