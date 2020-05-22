import React, { Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import { withStyles } from '@material-ui/styles'
import { autobind } from 'core-decorators'
import { withAuthorization } from '../components/Session'
import * as ROLES from '../constants/roles'
import Toast from '../components/Toast'
import { compose } from 'recompose'
//import invariant from 'invariant'
import store from '../store'
import { Observer } from 'mobx-react'
import { withDatastore } from '../components/Datastore/hoc'

const styles = () => ({
  root: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bolder',
    color: '#585858',
    marginTop: 20,
    padding: 40,
  },
  input: {
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
  primary: {
    backgroundColor: '#2C58B1',
    color: 'white',
    width: '75%',
    fontSize: '18px',
    padding: '5px',
    borderRadius: '7px',
    height: 40,
    marginTop: 20,
  },
  secondary: {
    color: '#2C58B1',
    width: '195px',
    height: 40,
    fontSize: '18px',
    padding: '5px',
    border: '2px solid #BDBDBD',
    borderRadius: '7px',
  },
  changeImage: {
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

const INITIAL_STATE = {
  open: false,
  showBanner: false,
  pwdResetSuccess: false,
}

@withDatastore
@autobind
class SettingsBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...INITIAL_STATE }
    //var test = this.props.firestore
    this.classes = this.props.classes
    this.saveSettings = this.saveSettings.bind(this)
  }

  handleOpen = () => {
    this.setState({ open: true })
  }
  handleClose = () => {
    this.setState({ open: false })
  }

  saveSettings = async (event) => {
    event.preventDefault()
    //this.setValues({ ...values, error: false })
    try {
      await store.user
    } catch (err) {
      console.log(err)
    }
  }

  fetchData() {
    var query = '{({firestore}) => firestore.collection("users")}'
    //invariant(this.props.query, '({firestore}) => firestore.collection("users")')
    return this.props.firestore.query(query)
  }

  resetPassword = async (e) => {
    e.preventDefault()
    try {
      const success = await store.user.sendPasswordResetEmail()
      this.setState({ showBanner: true, pwdResetSuccess: success })
    } catch (err) {
      console.warn(err)
      this.setState({ showBanner: true, pwdResetSuccess: false })
    }
  }

  changeImageModal = () => (
    <div className={this.classes.changeImage}>
      <input type="file" accepts="image/jpeg, image/png" />
      <div style={{ alignContent: 'right', marginTop: '35px' }}>
        <button
          onClick={this.handleClose}
          className={this.classes.secondary}
          style={{ width: '100px', border: 'none' }}
        >
          Discard
        </button>
        <button
          onClick={this.handleClose}
          className={this.classes.primary}
          style={{ width: '70px', borderStyle: 'none' }}
        >
          Save
        </button>
      </div>
    </div>
  )

  settingsForm = () => (
    <Fragment>
      <h1>My Settings</h1>
      <form>
        <Grid container className={this.classes.root} spacing={2} direction="row" justify="center">
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
              <button onClick={this.handleOpen} type="button" className={this.classes.secondary}>
                Change Image
              </button>
              <Modal open={this.state.open} onClose={this.handleClose}>
                {this.changeImageModal()}
              </Modal>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="prefix">Prefix</label>
              <input
                type="text"
                id="prefix"
                name="prefix"
                className={this.classes.input}
                defaultValue={store.user ? store.user.prefix : ''}
              ></input>
              <label htmlFor="firstName">
                First Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className={this.classes.input}
                defaultValue={store.user ? store.user.firstName : ''}
              ></input>
              <label htmlFor="email">
                Email Address <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                readOnly
                required
                className={this.classes.input}
                defaultValue={store.user ? store.user.email : ''}
              ></input>
              <button type="submit" onClick={this.saveSettings} className={this.classes.primary}>
                Save Changes
              </button>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="role">
                Role <span style={{ color: 'red' }}>*</span>
              </label>
              {store.user && (
                <select
                  type="text"
                  id="role"
                  name="role"
                  disabled={!store.user.isAdmin}
                  required
                  className={this.classes.input}
                  style={!store.user.isAdmin ? { backgroundColor: '#E0E0E0' } : {}}
                >
                  <option value={ROLES.ADMIN_LABEL} defaultValue={store.user.isAdmin}>
                    {ROLES.ADMIN_LABEL}
                  </option>
                  <option value={ROLES.NON_ADMIN_LABEL} defaultValue={!store.user.isAdmin}>
                    {ROLES.NON_ADMIN_LABEL}
                  </option>
                </select>
              )}
              <label htmlFor="lastName">
                Last Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className={this.classes.input}
                defaultValue={store.user ? store.user.lastName : ''}
              ></input>
              <label htmlFor="password">
                Password <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                required
                className={this.classes.input}
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
                onClick={(e) => this.resetPassword(e)}
              >
                Change Password
              </a>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <Toast
        open={this.showBanner}
        onClose={() => this.setState({ showBanner: true })}
        isSuccess={this.pwdResetSuccess}
        message={
          this.pwdResetSuccess
            ? 'Password reset email has been sent'
            : 'Failed to send password email. Please try again'
        }
      />
    </Fragment>
  )
  render() {
    //data = this.fetchData()

    return <Observer>{() => <React.Fragment>{this.settingsForm()}</React.Fragment>}</Observer>
  }
}

const condition = (authUser) => {
  var result = authUser
  return result
}

const Settings = compose(withStyles(styles), withAuthorization(condition), withDatastore)(SettingsBase)

export default Settings
