import React, { Fragment, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root : {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bolder',
    color: '#585858',
    marginTop: 20,
    padding: 40
  }
})

const inputStyles = makeStyles({
  root : {
    fontFamily: 'Montserrat',
    boxShadow: 'inset 0px 2px 10px rgba(0, 0, 0, 0.2)',
    borderRadius: 7,
    border: '2px solid #BDBDBD',
    paddingLeft: 10,
    width: '75%',
    height: 30,
    fontSize: 18,
    marginTop: 10,
    marginBottom: 40
      
  }
})

const primaryButtonStyles = makeStyles({
  root : {
  backgroundColor:'#2C58B1', 
  color:'white',
  width:'75%', 
  fontSize:'18px',
  padding:'5px',
  borderRadius:'7px',
  height: 40,
  marginTop: 30
  }

})
const secondaryButtonStyles = makeStyles({
  root : { 
  color:'#2C58B1', 
  width:'195px', 
  height: 40,
  fontSize:'18px', 
  padding:'5px',
  border: '2px solid #BDBDBD',
  borderRadius:'7px'
}
})

const Settings = () => {

  const classes = useStyles();
  const input = inputStyles();
  const secondaryButton = secondaryButtonStyles();
  const primaryButton = primaryButtonStyles()
 
  const settingsForm = () => (
    <Fragment>
   
    <form >
    
      <Grid container className={classes.root} spacing={2} direction='row' justify='center'>
        <Grid item xs={4}>
          <Grid container spacing={2} direction='column'>
              Profile Photo
              <div style={{marginTop:'20px', height:'200px', width:'195px', backgroundColor:'#E0E0E0', border: '2px dashed #828282'}}>
              </div>
              <text style={{marginTop:'15px', fontSize:'12px', color:'#585858'}}>
                Accepted file types: jpg or png
              </text>
              <text style={{ marginBottom:'15px', fontSize:'12px', color:'#585858'}}>
                Maximum file size: __ MB
              </text>
              <button type='submit' className={secondaryButton.root}>Change Image</button>
          </Grid>
        </Grid>

        <Grid item xs={4}>
          <Grid container spacing={2} direction='column'>
              <label for='prefix'>
                Prefix 
              </label>
              <input type="text" id='prefix' name='prefix' className={input.root}></input>
              <label for='firstName'>
                First Name <text style={{color:'red'}}>*</text>
              </label>
              <input type="text" id='firstName' name='firstName' required className={input.root}></input>
              <label for='email'>
                Email Address <text style={{color:'red'}}>*</text>
              </label>
              <input type="text" id='email' name='email' required className={input.root}></input>
              <button type='submit' className={primaryButton.root}>Save Changes</button>
          </Grid>
        </Grid>

        <Grid item xs={4}>
          <Grid container spacing={2} direction='column'>
            <label for='role'>
              Role <text style={{color:'red'}}>*</text>
            </label>
            <input type="text" id='role' name='role' value='Administrator' required className={input.root} style={{backgroundColor:'#E0E0E0'}}></input>
            <label for='lastName'>
              Last Name <text required style={{color:'red'}}>*</text>
            </label>
            <input type="text" id='lastName' name='lastName' required className={input.root}></input>
            <label for='password'>
              Password <text style={{color:'red'}}>*</text>
            </label>
            <input required className={input.root}  id='password' name='password' type="password"  value='example' style={{backgroundColor: '#E0E0E0'}}/>
            <a href='' style={{fontSize:'12px', textAlign:'right', marginRight:'50px', color:'#2C58B1', fontStyle:'underline'}}>Change Password</a>
          </Grid>
        </Grid>
    
      </Grid>
    </form>

    </Fragment>
  );
  
return(
     <React.Fragment>
           <h1>My Settings</h1>
           {settingsForm()}
     </React.Fragment>
   )
};

export default Settings;