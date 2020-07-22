import React from 'react'

const Footer = () => {
  const cwImg = require('../../assets/powered-by-cw.svg')

  return (
    <div id="footer">
      <div className="footerContainer">
        <div id="footer-img">
          <img src={cwImg}></img>
        </div>
        <div id="footer-text">
          <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
          <a target="_blank" href="https://covidwatch.org/covid_watch_privacy_policy.pdf" rel="noreferrer">
            Privacy Policy
          </a>
          <a target="_blank" href="url" rel="noreferrer">
            Terms of Use
          </a>
          <a target="_blank" href="https://covidwatch.org/get_support" rel="noreferrer">
            Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer
