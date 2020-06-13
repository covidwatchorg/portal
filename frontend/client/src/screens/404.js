import React from 'react'
import { Link } from 'react-router-dom'
import doctor from '../../assets/404-doctor.svg'
import '../../Styles/screens/404.scss'
import PageTitle from '../components/PageTitle'
import ChangePasswordModal from '../components/ChangePasswordModal'

const NotFound = () => {
  return (
    <div id="not-found">
      <PageTitle title="404 Not Found" />
      <div id="doctor-img">
        <img src={doctor} alt="doctor" />
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
      <ChangePasswordModal />
    </div>
  )
}

export default NotFound
