import React, { Fragment, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import { makeStyles } from '@material-ui/core/styles'
import { withAuthorization } from '../components/Session'
import * as ROLES from '../constants/roles'
import { compose } from 'recompose'
import store from '../store'

const useStyles = makeStyles({
  root: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bolder',
    color: '#585858',
    marginTop: 20,
    padding: 40,
  },
})

const inputStyles = makeStyles({
  root: {
    fontFamily: 'Montserrat',
    boxShadow: 'inset 0px 2px 10px rgba(0, 0, 0, 0.2)',
    borderRadius: 7,
    border: '2px solid #BDBDBD',
    paddingLeft: 10,
    width: '75%',
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    marginTop: 10,
    marginBottom: 30,
  },
})

const primaryButtonStyles = makeStyles({
  root: {
    backgroundColor: '#2C58B1',
    color: 'white',
    width: '75%',
    fontSize: '18px',
    padding: '5px',
    borderRadius: '7px',
    height: 40,
    marginTop: 20,
  },
})
const secondaryButtonStyles = makeStyles({
  root: {
    color: '#2C58B1',
    width: '195px',
    height: 40,
    fontSize: '18px',
    padding: '5px',
    border: '2px solid #BDBDBD',
    borderRadius: '7px',
  },
})

const changeImageModalStyles = makeStyles({
  root: {
    fontFamily: 'Montserrat',
    margin: 'auto',
    marginTop: '200px',
    width: '40%',
    height: '20%',
    backgroundColor: 'white',
    padding: 50,
    borderRadius: '7px',
  },
})

const SettingsBase = () => {
  const classes = useStyles()
  const input = inputStyles()
  const secondaryButton = secondaryButtonStyles()
  const primaryButton = primaryButtonStyles()
  const changeImage = changeImageModalStyles()
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  const changeImageModal = (
    <div className={changeImage.root}>
      <input type="file" accepts="image/jpeg, image/png" />
      <div style={{ alignContent: 'right', marginTop: '35px' }}>
        <button onClick={handleClose} className={secondaryButton.root} style={{ width: '100px', border: 'none' }}>
          Discard
        </button>
        <button onClick={handleClose} className={primaryButton.root} style={{ width: '70px', borderStyle: 'none' }}>
          Save
        </button>
      </div>
    </div>
  )

  const settingsForm = () => (
    <Fragment>
      <form>
        <Grid container className={classes.root} spacing={2} direction="row" justify="center">
          <Grid item xs={4}>
            <Grid container spacing={2} direction="column">
              Profile Photo
              <div
                style={{
                  marginTop: '10px',
                  height: '200px',
                  width: '195px',
                  backgroundColor: '#E0E0E0',
                  border: '2px dashed #828282',
                  textAlign: 'center',
                }}
              >
                <img
                  src="client/assets/photo-add.png"
                  style={{ height: '50px', width: '50px', display: 'block', margin: 'auto', marginTop: '75px' }}
                ></img>
              </div>
              <div style={{ marginTop: '15px', fontSize: '12px', color: '#585858' }}>
                Accepted file types: jpg or png
              </div>
              <div style={{ marginBottom: '15px', fontSize: '12px', color: '#585858' }}>Maximum file size: __ MB</div>
              <button onClick={handleOpen} type="button" className={secondaryButton.root}>
                Change Image
              </button>
              <Modal open={open} onClose={handleClose}>
                {changeImageModal}
              </Modal>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="prefix">Prefix</label>
              <input type="text" id="prefix" name="prefix" className={input.root}></input>
              <label htmlFor="firstName">
                First Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="text" id="firstName" name="firstName" required className={input.root}></input>
              <label htmlFor="email">
                Email Address <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="text" id="email" name="email" required className={input.root}></input>
              <button type="submit" className={primaryButton.root}>
                Save Changes
              </button>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="role">
                Role <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                type="text"
                id="role"
                name="role"
                disabled={!store.user.isAdmin}
                required
                className={input.root}
                style={!store.user.isAdmin ? { backgroundColor: '#E0E0E0' } : {}}
              >
                <option value={ROLES.ADMIN_LABEL} defaultValue={store.user.isAdmin}>
                  {ROLES.ADMIN_LABEL}
                </option>
                <option value={ROLES.NON_ADMIN_LABEL} defaultValue={!store.user.isAdmin}>
                  {ROLES.NON_ADMIN_LABEL}
                </option>
              </select>
              <label htmlFor="lastName">
                Last Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input type="text" id="lastName" name="lastName" required className={input.root}></input>
              <label htmlFor="password">
                Password <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                required
                className={input.root}
                id="password"
                name="password"
                type="password"
                defaultValue="example"
                style={{ backgroundColor: '#E0E0E0' }}
              />
              <a
                href=""
                style={{
                  fontSize: '12px',
                  textAlign: 'right',
                  marginRight: '50px',
                  color: '#2C58B1',
                  fontStyle: 'underline',
                }}
              >
                Change Password
              </a>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Fragment>
  )

  return (
    <React.Fragment>
      <h1>My Settings</h1>
      {settingsForm()}
    </React.Fragment>
  )
}

const condition = (authUser) => {
  var result = authUser
  return result
}

const Settings = compose(withAuthorization(condition))(SettingsBase)

export default Settings
