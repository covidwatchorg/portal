import React from 'react'
import { useLocation } from 'react-router'

const Footer = () => {
  const cwImg = require('../../assets/powered-by-cw.svg')
  let location = useLocation()
  let footerContainerStyle = {}

  if (location.pathname === '/404') {
    footerContainerStyle = {
      display: 'none',
    }

    footerStyle = {
      display: 'none',
    }
  }

  return (
    <div id="footer">
      <div className="footerContainer" style={footerContainerStyle}>
        <div id="footer-img">
          <img src={cwImg}></img>
        </div>
        <div id="footer-text">
          <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
          <a href="https://covidwatch.org/covid_watch_privacy_policy.pdf">Privacy Policy</a>
          <a href="url">Terms of Use</a>
          <a href="url">Support</a>
        </div>
      </div>
    </div>
  )
}

export default Footer
