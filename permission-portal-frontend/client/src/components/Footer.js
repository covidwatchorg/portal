import React from 'react'
import { useLocation } from 'react-router'

const Footer = () => {
  const cwImg = require('../../assets/powered-by-cw.svg')
  let location = useLocation()

  return (
    <div id="footer">
      <div
        className='footerContainer'
        style={(location.pathname !== '/') ? {
          minHeight: '100%',
          position: 'relative',
          background: 'url(' + cwImg + ')',
          backgroundRepeat: 'no-repeat',
          backgroundPositionX: '115px',
          backgroundPositionY: '36px'
        }: {}}
      >
        <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
        <a href="url">Privacy Policy</a>
        <a href="url">Terms of Use</a>
      </div>
    </div>
  )
}

export default Footer
