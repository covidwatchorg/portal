import React from 'react'
import { useLocation } from 'react-router'

const Footer = () => {
  const cwImg = require('../../assets/powered-by-cw.svg')
  let location = useLocation()
  let style = {};
  let text = (
    <div className="footer">
      <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
      <a href="url">Privacy Policy</a>
      <a href="url">Terms of Use</a>
    </div>
  )
  
  if (location.pathname === '/') {
    // style remains empty object {}
  } else if (location.pathname === '/404') {
    // style remains empty object {}
    text = (
      <div></div>
    );
  } else {
    style = {
      minHeight: '100%',
      position: 'relative',
      background: 'url(' + cwImg + ')',
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: '115px',
      backgroundPositionY: '36px',
    }
  }

  return (
    <div id="footer">
      <div
        className="footerContainer"
        style={style}
      >
        {text}
        {/* <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
        <a href="url">Privacy Policy</a>
        <a href="url">Terms of Use</a> */}
      </div>
    </div>
  )
}

export default Footer
