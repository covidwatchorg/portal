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
    boxShadow: 'inset 0px 2px 10px rgba(0, 0, 0, 0.2)',
    borderRadius: 7,
    border: '2px solid #BDBDBD',
    width: '75%',
    marginTop: 5,
    marginBottom: 20

  }
})

const Settings = () => {

  const classes = useStyles();
  const input = inputStyles();
 
  const settingsForm = () => (
    <Fragment>
   
    <form >
    
      <Grid container className={classes.root} spacing={2} direction='row' justify='center'>
        <Grid item xs={4}>
          <Grid container spacing={2} direction='column'>
              Profile Photo
              <div style={{marginTop:'20px', height:'217px', width:'212px', backgroundColor:'#E0E0E0', border: '2px dashed #828282'}}>
              </div>

          </Grid>
        </Grid>

        <Grid item xs={4}>
          <Grid container spacing={2} direction='column'>
              <label>
                Prefix 
              </label>
              <TextField className={input.root} label="-" variant="outlined"/>
              <label>
                First Name <text style={{color:'red'}}>*</text>
              </label>
              <TextField required className={input.root} label="" variant="outlined" />
              <label>
                Email Address <text style={{color:'red'}}>*</text>
              </label>
              <TextField required className={input.root} label="" variant="outlined" />
              <Button onClick={console.log('button clicked')} className={classes.root} variant='contained' style={{backgroundColor:'#2C58B1', color:'white', width:'75%', fontSize:'smaller', padding:'5px'}}>
                Save Changes
              </Button>
          </Grid>
        </Grid>

        <Grid item xs={4}>
          <Grid container spacing={2} direction='column'>
            <label>
              Role <text style={{color:'red'}}>*</text>
            </label>
            <TextField required  className={input.root}  label="" variant="outlined" style={{backgroundColor: '#E0E0E0'}} />
            <label>
              Last Name <text style={{color:'red'}}>*</text>
            </label>
            <TextField required className={input.root} label="" variant="outlined" />
            <label>
              Password <text style={{color:'red'}}>*</text>
            </label>
            <TextField required className={input.root}  label="" type="password" variant="outlined" style={{backgroundColor: '#E0E0E0'}}/>
            <a style={{fontSize:'10px', textAlign:'right', color:'#2C58B1', fontStyle:'underline'}}>Change Password</a>
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