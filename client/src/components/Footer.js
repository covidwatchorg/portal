import React from 'react';

const Footer = (props) => {
  return (
    <div className={"footerContainer" + (props.branded ? " branded" : "")}>
      <p id="copyright">© 2020 Covid Watch. All rights reserved.</p>
      <a href="url">Privacy Policy</a>
      <a href="url">Terms of Use</a>
    </div>
  );
};

export default Footer;
