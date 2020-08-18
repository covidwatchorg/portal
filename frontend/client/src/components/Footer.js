import React from 'react'
import { withStore } from '../store'
import { observer } from 'mobx-react'

const FooterBase = observer((props) => {
  const cwImg = require('../../assets/powered-by-cw.svg')

  return (
    <div id="footer">
      <div className={props.store.data.user.isSignedIn ? 'footerContainer footer-not-login' : 'footerContainer'}>
        <div id="footer-img">
          <img src={cwImg}></img>
        </div>
        <div className="xs-text" id="footer-text">
          <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
          <a
            target="_blank"
            href="https://drive.google.com/file/d/1vSPtUEjSYQ0jWxYHlP8OzTzCAWgT9B0E/view?usp=sharing"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          {/* <a target="_blank" rel="noreferrer">
            Terms of Use
          </a> */}
          <a target="_blank" href="https://covidwatch.zendesk.com/hc/en-us" rel="noreferrer">
            Support
          </a>
        </div>
      </div>
    </div>
  )
})

const Footer = withStore(FooterBase)

export default Footer
