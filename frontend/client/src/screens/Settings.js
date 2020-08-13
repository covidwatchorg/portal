import React, { useRef, Fragment, useState } from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Modal from '../components/Modal'
import * as ROLES from '../constants/roles'
import Toast from '../components/Toast'
import { Redirect } from 'react-router-dom'
import { withStore } from '../store'
import * as ROUTES from '../constants/routes'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import photo_add from '../../assets/photo-add.svg'
import Logging from '../util/logging'
import PendingOperationButton from '../components/PendingOperationButton'
import ResetPasswordModal from '../components/ResetPasswordModal'
import CircularProgress from '@material-ui/core/CircularProgress'

const MAXFILESIZE = 10 * 1024 * 1024

// Breakpoints customized to match those of _include-media.scss
const theme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 420,
      md: 768,
      lg: 1024,
      xl: 1920,
    },
  },
})
const SettingsBase = observer((props) => {
  const imgUploader = useRef()

  const [open, setOpen] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [toastInfo, setToastInfo] = useState({
    success: false,
    msg: '',
  })
  const [loading, setLoading] = useState(false)
  const toastRef = useRef()

  const resetPassword = async (e) => {
    e.preventDefault()
    setShowResetPasswordModal(true)
  }

  const onChange = async (event) => {
    if (event.target.name == 'prefix') {
      props.store.updateUser({ prefix: event.target.value })
    } else if (event.target.name == 'firstName') {
      props.store.updateUser({ firstName: event.target.value })
    } else if (event.target.name == 'lastName') {
      props.store.updateUser({ lastName: event.target.value })
    }
  }

  const saveImage = async () => {
    if (imgUploader.current.files.length == 0) {
      // No image uploaded
      return
    }

    setLoading(true)

    const file = imgUploader.current.files[0]

    try {
      let size = imgUploader.current.files[0].size

      if (size > MAXFILESIZE) {
        setLoading(false)
        setToastInfo({
          success: false,
          msg: 'Exceeded Max Image file size. Image has to be less than 10MB',
        })
        toastRef.current.show()
        imgUploader.current.value = null
      }
      let reader = new FileReader()
      // set up onload trigger to run when data is read
      reader.onload = async () => {
        return props.store
          .updateUserImage(file)
          .then(() => {
            setToastInfo({
              success: true,
              msg: 'Image Updated',
            })
            toastRef.current.show()
            setLoading(false)
            setOpen(false)
          })
          .catch(() => {
            setLoading(false)
            setToastInfo({
              success: false,
              msg: 'Error Updating Image, Please Try Again',
            })
            toastRef.current.show()
          })
      }
      // read data
      return reader.readAsDataURL(imgUploader.current.files[0])
    } catch (err) {
      Logging.log(err)
      return false
    }
  }

  const onChangePasswordSuccess = () => {
    setToastInfo({
      success: true,
      msg: 'Success: Password Reset',
    })
    toastRef.current.show()
    setShowResetPasswordModal(false)
  }

  const onChangePasswordFailure = (message) => {
    setToastInfo({
      success: false,
      msg: message,
    })
    toastRef.current.show()
  }

  const onChangePasswordClose = () => {
    setShowResetPasswordModal(false)
  }

  const changeImageModal = loading ? (
    <Modal
      title={'Uploading image...'}
      hidden={!open}
      onClose={() => {
        setOpen(false)
      }}
      containerClass="changeImageModalContainer"
    >
      <div className="save-image">
        <CircularProgress />
      </div>
    </Modal>
  ) : (
    <Modal
      title={'Please Select a File to Upload'}
      hidden={!open}
      onClose={() => {
        setOpen(false)
      }}
      containerClass="changeImageModalContainer"
    >
      <div>
        <input
          type="file"
          ref={imgUploader}
          accepts="image/jpeg, image/png"
          style={{ border: 'none', marginTop: '25px', marginBottom: '15px' }}
        />
        <PendingOperationButton operation={saveImage} className="save-button">
          Upload
        </PendingOperationButton>
      </div>
    </Modal>
  )

  const settingsForm = () => (
    <Fragment>
      <form>
        <Grid container id="settings-grid" spacing={2} direction="row" justify="center">
          <Grid item xs={12} md={4} xl={2}>
            <Grid container spacing={2} direction="column" className="profile-photo-container">
              <label> Profile Photo </label>
              <div
                style={{
                  marginTop: '25px',
                  height: '217px',
                  width: '212px',
                  backgroundColor: '#E0E0E0',
                  border: '2px dashed #BDBDBD',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  alt={props.store.data.user.imageBlob ? 'Profile photo' : 'Your profile photo would go here.'}
                  src={props.store.data.user.imageBlob ? props.store.data.user.imageBlob : photo_add}
                  className="profile_photo"
                  style={
                    props.store.data.user.imageBlob
                      ? { width: 212, height: 217, resize: 'cover' }
                      : { width: 100, height: 102, paddingLeft: 10, paddingTop: 10 }
                  }
                  onClick={() => setOpen(true)}
                ></img>
              </div>
              <div className="xs-text" style={{ marginTop: 10 }}>
                Accepted file format: jpg or png
              </div>
              <div className="xs-text">Maximum file size: 10 MB</div>
              {changeImageModal}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4} xl={5}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="prefix">Prefix</label>
              <input
                type="text"
                id="prefix"
                name="prefix"
                onChange={onChange}
                value={props.store.data.user.prefix}
              ></input>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                aria-required="true"
                onChange={onChange}
                value={props.store.data.user.firstName}
              ></input>
              <div className='email-container'>
                <label htmlFor="email">Email Address</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  required
                  disabled={true}
                  aria-required="true"
                  style={{ backgroundColor: '#e0e0e0' }}
                  value={props.store.data.user.email}
                ></input>
              </div>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4} xl={5}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="role">Role</label>
              {props.store.data.user && (
                <input
                  type="text"
                  id="role"
                  name="role"
                  disabled={true}
                  required
                  aria-required="true"
                  style={{ backgroundColor: '#e0e0e0' }}
                  value={props.store.data.user.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL}
                ></input>
              )}
              <div className='lastName-container'>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  aria-required="true"
                  onChange={onChange}
                  defaultValue={props.store.data.user.lastName}
                ></input>
              </div>
              <label htmlFor="password">Password</label>
              <input
                type="text"
                id="password"
                name="password"
                style={{ backgroundColor: '#e0e0e0', fontSize: '30px' }}
                disabled={true}
                required
                aria-required="true"
                defaultValue=" • • • • • • • •"
              ></input>
              <a href="" className="change-password-link" onClick={(e) => resetPassword(e)}>
                Change Password
              </a>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <Toast ref={toastRef} isSuccess={toastInfo.success} message={toastInfo.msg} />
    </Fragment>
  )

  return !props.store.data.user.isSignedIn ||
    props.store.data.user.isFirstTimeUser ||
    (props.store.data.user.passwordResetRequested && props.store.data.user.signedInWithEmailLink) ? (
    <Redirect to={ROUTES.LANDING} />
  ) : (
    <MuiThemeProvider theme={theme}>
      <PageTitle title="My Settings" />
      <div className="module-container">
        <div className="settings-header">
          <h1 style={{ marginBottom: 12 }}>My Settings</h1>
          <p className="xs-text">Changes are automatically saved</p>
        </div>
        {settingsForm()}
        <ResetPasswordModal
          hidden={!showResetPasswordModal}
          onClose={onChangePasswordClose}
          onSuccess={onChangePasswordSuccess}
          onFailure={onChangePasswordFailure}
        />
      </div>
    </MuiThemeProvider>
  )
})

const Settings = withStore(SettingsBase)

export default Settings
