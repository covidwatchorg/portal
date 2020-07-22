import React from 'react'
import '../../Styles/screens/branding.scss'
import { withStore } from '../store'
import { Redirect } from 'react-router-dom'
import * as ROUTES from '../constants/routes'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'

const AccountBrandingBase = observer((props) => {
  return !props.store.data.user.isSignedIn ||
    !props.store.data.user.isAdmin ||
    props.store.data.user.isFirstTimeUser ||
    (props.store.data.user.passwordResetRequested && props.store.data.user.signedInWithEmailLink) ? (
    <Redirect to={ROUTES.LANDING} />
  ) : (
      <div className="module-container module-container-not-login" id="mobile-application-settings">
      <PageTitle title="Mobile Application Settings" />
      <h1>Mobile Application Settings</h1>
      <p className="small-text">
        The settings on this page are for the Covid Watch mobile application and can only be edited by organization
        administrators. Edits made on this page will modify the content of the app, so please review all changes
        carefully before submitting them to application development review. Visit the{' '}
        <a href="https://www.covidwatch.org/">Covid Watch website</a> to learn more.
      </p>

      <div className="center-box-container">
        <div className="center-box">
          <span>This page is in progress.</span>
          <div>
            To edit your account settings and customize the messaging mobile app users receive in your region,
            <br></br>
            get in touch with your Covid Watch point of contact.
          </div>
        </div>
      </div>
    </div>
  )
})

const AccountBranding = withStore(AccountBrandingBase)

export default AccountBranding
