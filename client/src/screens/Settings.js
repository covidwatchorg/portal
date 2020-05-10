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
    marginTop: 20
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
    
      <Grid container spacing={2} direction='row' justify='center'>
        <Grid item xs={4} justify='center'>
          <Grid container spacing={1} direction='column'>
              Profile Picture
            
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
              <Button onClick={console.log('button clicked')} className={classes.root} variant='contained' style={{backgroundColor:'#2C58B1', color:'white', width:'75%', fontSize:'smaller'}}>
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
          </Grid>
        </Grid>
    
      </Grid>
    </form>

    </Fragment>
  );
  
return(
     <React.Fragment>
           <h1>My Settings</h1>
            <div className={classes.root}>
           {settingsForm()}
           </div>
     </React.Fragment>
   )
};

export default Settings;