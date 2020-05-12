import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';

const Footer = (props) => {
  return (
    <Grid container justify='center' alignItems='flex-end'>
      <Grid item>
        <div className={'footerContainer' + (props.branded ? ' branded' : '')}>
          <p id='copyright'>© 2020 Covid Watch. All rights reserved.</p>
          <a href='url'>Privacy Policy</a>
          <a href='url'>Terms of Use</a>
        </div>
      </Grid>
    </Grid>
  );
};

export default Footer;
