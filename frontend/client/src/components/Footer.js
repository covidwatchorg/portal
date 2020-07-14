import React from 'react'
import { useLocation } from 'react-router'

const Footer = () => {
  const cwImg = require('../../assets/powered-by-cw.svg')
  let location = useLocation()
  let footerContainerStyle = {}
  let footerStyle = { display: 'flex' }

  if (location.pathname === '/404') {
    footerContainerStyle = {
      display: 'none',
    }

    footerStyle = {
      display: 'none',
    }
  } else {
    footerContainerStyle = {
      minHeight: '100%',
      position: 'relative',
      background: 'url(' + cwImg + ')',
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: '115px',
      backgroundPositionY: '36px',
    }
  }

  return (
    <div id="footer" style={footerStyle}>
      <div className="footerContainer" style={footerContainerStyle}>
        <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
        <a href="url">Privacy Policy</a>
        <a href="url">Terms of Use</a>
      </div>
    </div>
  )
}

export default Footer
