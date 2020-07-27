import React from 'react'

const Footer = () => {
  const cwImg = require('../../assets/powered-by-cw.svg')

  return (
    <div id="footer">
      <div className="footerContainer">
        <div id="footer-img">
          <img src={cwImg}></img>
        </div>
        <div className="xs-text" id="footer-text">
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
