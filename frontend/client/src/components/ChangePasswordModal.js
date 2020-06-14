import React, { useState, useRef } from 'react'
import Modal from '../components/Modal'
import PendingOperationButton from '../components/PendingOperationButton'
import { auth } from '../store/firebase'
import { withStore } from '../store'
import Logging from '../util/logging'
import Toast from '../components/Toast'
import firebase from 'firebase'

function ChangePasswordModalBase(props) {
  // State variables
  const [visible, setVisible] = useState(props.store.data.user.isFirstTimeUser || false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [passwordIsValid, setPasswordIsValid] = useState(false)
  const [loginTimeoutError, setLoginTimeoutError] = useState(false)
  const [formHasBeenEdited, setFormHasBeenEdited] = useState(false)
  const [confirmPasswordHasBeenEdited, setConfirmPasswordHasBeenEdited] = useState(false)

  const toastRef = useRef()
  const [toastState, setToastState] = useState({
    successful: false,
    message: '',
  })

  function displayToast(toastState) {
    setToastState(toastState)
    toastRef.current.show()
  }

  function onChange(event) {
    let fieldName = event.target.name
    let fieldContent = event.target.value

    setFormHasBeenEdited(true)

    let newFormState = {
      currentPassword: currentPassword,
      password: password,
      confirmPassword: confirmPassword,
    }

    if (fieldName === 'current-password') {
      newFormState.currentPassword = fieldContent
      setCurrentPassword(newFormState.currentPassword)
    }
    if (fieldName === 'new-password') {
      newFormState.password = fieldContent
      setPassword(newFormState.password)
    }
    if (fieldName === 'confirm-password') {
      newFormState.confirmPassword = fieldContent
      setConfirmPassword(newFormState.confirmPassword)
      setConfirmPasswordHasBeenEdited(true)
    }

    setPasswordIsValid(newFormState.password && newFormState.password.length >= 6)
    setPasswordsMatch(newFormState.password === newFormState.confirmPassword)
  }

  function handleFirebaseError(err) {
    Logging.error(err)
    if (err.code === 'auth/requires-recent-login') {
      setLoginTimeoutError(true)
    } else if (err.code === 'auth/wrong-password') {
      setToastState({
        successful: false,
        message: 'Current password incorrect, please try again.',
      })
      setCurrentPassword('')
    } else if (err.code === 'auth/too-many-requests') {
      setToastState({
        successful: false,
        message: 'Too many incorrect attempts. Please try again later.',
      })
    } else {
      setToastState({
        successful: false,
        message: 'Failed to update password, please try again.',
      })
    }
    throw err
  }

  function reauthenticate(user) {
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword)
    return user.reauthenticateWithCredential(credential).catch(handleFirebaseError)
  }

  function updatePasswordAndClose(user) {
    // 1. Change user password to state.password
    const updatePwd = user.updatePassword(password)
    // 2. Set user.isFirstTimeUser to false
    const setFirstTimeUser = updatePwd.then(() => {
      props.store.updateUser({ isFirstTimeUser: false })
    }, handleFirebaseError)
    // 3. Close the modal and pop the toast
    return setFirstTimeUser.then(() => {
      setVisible(false)
      displayToast({
        successful: true,
        message: 'Password successfully updated.',
      })
    })
  }

  function onSubmit() {
    const user = auth.currentUser
    if (user) {
      if (loginTimeoutError) {
        return reauthenticate(user).then(() => {
          updatePasswordAndClose(user)
        })
      } else {
        return updatePasswordAndClose(user)
      }
    } else {
      return Promise.reject('auth.currentUser is null or undefined')
    }
  }

  function canSubmit() {
    return (!loginTimeoutError || currentPassword) && passwordIsValid && passwordsMatch
  }

  return (
    <>
      <Modal
        hidden={!visible}
        containerClass={`change-password-modal-container${loginTimeoutError ? ' err-timeout' : ''}`}
        isDismissible={false}
      >
        {!loginTimeoutError ? (
          <>
            <h2>Welcome!</h2>
            <p>
              To secure your account, please create a new password to replace the temporary password you were given in
              the email invitation.
            </p>
          </>
        ) : (
          <>
            <h2>Oops!</h2>
            <p>
              Unfortunately, we were unable to change your password because you signed in too long ago. Please
              re-authenticate with the temporary password you were given in the email invitation and try again.
            </p>
          </>
        )}

        <form className="change-password-form">
          {loginTimeoutError && (
            <>
              <label htmlFor="current-password">
                Current password<span>*</span>
              </label>
              <input
                type="password"
                required
                aria-required={true}
                id="current-password"
                name="current-password"
                value={currentPassword}
                onChange={onChange}
              />
              <div className="validationResult">{!currentPassword ? 'Current password cannot be blank' : ''}</div>
            </>
          )}
          <label htmlFor="new-password">
            New password<span>*</span>
          </label>
          <input
            type="password"
            required
            aria-required={true}
            id="new-password"
            name="new-password"
            value={password}
            onChange={onChange}
          />
          <div className="validationResult">
            {!passwordIsValid && formHasBeenEdited
              ? password.length > 0
                ? 'Password must be at least 6 characters long'
                : 'New password cannot be blank'
              : ''}
          </div>
          <label htmlFor="confirm-password">
            Confirm new password<span>*</span>
          </label>
          <input
            type="password"
            required
            aria-required={true}
            id="confirm-password"
            name="confirm-password"
            value={confirmPassword}
            onChange={onChange}
          />
          <div className="validationResult">
            {!passwordsMatch && confirmPasswordHasBeenEdited ? 'Passwords must match' : ''}
          </div>

          <PendingOperationButton className={`save-password${canSubmit() ? '' : '-disabled'}`} operation={onSubmit}>
            {!loginTimeoutError ? 'Save' : 'Retry'}
          </PendingOperationButton>
        </form>
      </Modal>
      <Toast ref={toastRef} isSuccess={toastState.successful} message={toastState.message} />
    </>
  )
}

const ChangePasswordModal = withStore(ChangePasswordModalBase)

export default ChangePasswordModal
