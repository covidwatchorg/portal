import React from 'react'
import Modal from '../components/Modal'
import PendingOperationButton from '../components/PendingOperationButton'
import { auth } from '../store/firebase'
import { withStore } from '../store'
import Logging from '../util/logging'
import firebase from 'firebase'

class ChangePasswordModalBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      heading: this.props.heading,
      subHeading: this.props.subHeading,
      isDismissible: false,
      visible: props.visible,
      currentPassword: '',
      password: '',
      confirmPassword: '',
      passwordsMatch: true,
      passwordIsValid: false,
      loginTimeoutError: false,
      formHasBeenEdited: false,
      confirmPasswordHasBeenEdited: false,
    }
    this.onChange = this.onChange.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.canSubmit = this.canSubmit.bind(this)
    this.handleFirebaseError = this.handleFirebaseError.bind(this)
    this.reauthenticate = this.reauthenticate.bind(this)
    this.updatePasswordAndClose = this.updatePasswordAndClose.bind(this)
  }

  onChange(event) {
    let fieldName = event.target.name
    let fieldContent = event.target.value
    // Serialize updates
    this.setState((state) => {
      let newState = {
        formHasBeenEdited: true,
      }
      if (fieldName === 'current-password') {
        newState.currentPassword = fieldContent
      }
      if (fieldName === 'new-password') {
        newState.password = fieldContent
        newState.passwordIsValid = newState.password && newState.password.length >= 6
        newState.passwordsMatch = newState.password === state.confirmPassword
      }
      if (fieldName === 'confirm-password') {
        newState.confirmPasswordHasBeenEdited = true
        newState.confirmPassword = fieldContent
        newState.passwordsMatch = state.password === newState.confirmPassword
      }
      return newState
    })
  }

  onClose() {
    this.props.store.updateUser({ passwordResetCompletedInCurrentSession: false })
    this.props.store.signOut()
    this.setState({ visible: false })
  }

  handleFirebaseError(err) {
    Logging.error(err)
    if (err.code === 'auth/requires-recent-login') {
      this.setState({
        loginTimeoutError: true,
        heading: 'Oops!',
        subHeading:
          'Unfortunately, we were unable to change your password because you signed in too long ago. Please re-authenticate with the temporary password you were given in the email invitation and try again.',
      })
    }
    throw err
  }

  reauthenticate(user) {
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, this.state.currentPassword)
    return user.reauthenticateWithCredential(credential).catch(this.handleFirebaseError)
  }

  updatePasswordAndClose(user) {
    // 1. Change user password to state.password
    const updatePwd = user.updatePassword(this.state.password)
    // 2. Set user.isFirstTimeUser to false
    const setFirstTimeUser = updatePwd.then(() => {
      Logging.log('passwordResetCompletedInCurrentSession set to true')
      this.props.store.updateUser({
        isFirstTimeUser: false,
        passwordResetRequested: false,
        passwordResetCompletedInCurrentSession: true,
      })
    }, this.handleFirebaseError)
    // 3. Close the modal and pop the toast
    return setFirstTimeUser.then(() => {
      this.setState({
        isDismissible: true,
        heading: 'Password Successfully Reset',
        subHeading: 'Your password has successfully been updated. Go ahead and log in with your new password.',
      })
    })
  }

  onSubmit() {
    const user = auth.currentUser
    if (user) {
      if (this.state.loginTimeoutError) {
        return this.reauthenticate(user).then(() => {
          this.updatePasswordAndClose(user)
        })
      } else {
        return this.updatePasswordAndClose(user)
      }
    } else {
      return Promise.reject('auth.currentUser is null or undefined')
    }
  }

  canSubmit() {
    return (
      (!this.state.loginTimeoutError || this.state.currentPassword) &&
      this.state.passwordIsValid &&
      this.state.passwordsMatch
    )
  }

  render() {
    return (
      <>
        <Modal
          hidden={!this.state.visible}
          containerClass={`change-password-modal-container${this.state.loginTimeoutError ? ' err-timeout' : ''}`}
          isDismissible={this.state.isDismissible}
          onClose={this.onClose}
        >
          <h2>{this.state.heading}</h2>
          <p>{this.state.subHeading}</p>
          {!this.props.store.data.user.passwordResetCompletedInCurrentSession && (
            <form className="change-password-form">
              {this.state.loginTimeoutError && (
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
                    value={this.state.currentPassword}
                    onChange={this.onChange}
                  />
                  <div className="validationResult">
                    {!this.state.currentPassword ? 'Current password cannot be blank' : ''}
                  </div>
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
                value={this.state.password}
                onChange={this.onChange}
              />
              <div className="validationResult">
                {!this.state.passwordIsValid && this.state.formHasBeenEdited
                  ? this.state.password.length > 0
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
                value={this.state.confirmPassword}
                onChange={this.onChange}
              />
              <div className="validationResult">
                {!this.state.passwordsMatch && this.state.confirmPasswordHasBeenEdited ? 'Passwords must match' : ''}
              </div>

              <PendingOperationButton
                className={`save-password${this.canSubmit() ? '' : '-disabled'}`}
                operation={this.onSubmit}
              >
                {!this.state.loginTimeoutError ? 'Save' : 'Retry'}
              </PendingOperationButton>
            </form>
          )}
        </Modal>
      </>
    )
  }
}

const ChangePasswordModal = withStore(ChangePasswordModalBase)

export default ChangePasswordModal
