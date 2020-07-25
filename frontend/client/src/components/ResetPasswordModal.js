import React, { createRef } from 'react'
import Modal from '../components/Modal'
import ModalInput from '../components/ModalInput'
import PendingOperationButton from '../components/PendingOperationButton'
import { auth } from '../store/firebase'
import { withStore } from '../store'
import Logging from '../util/logging'
import firebase from 'firebase'

class ResetPasswordModalBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPassword: '',
      password: '',
      confirmPassword: '',
      passwordsMatch: true,
      passwordIsValid: false,
      successful: false,
      message: '',
      newPasswordHasBeenEdited: false,
      currentPasswordHasBeenEdited: false,
      confirmPasswordHasBeenEdited: false,
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.canSubmit = this.canSubmit.bind(this)
    this.handleFirebaseError = this.handleFirebaseError.bind(this)

    this.toast = createRef()
  }

  onChange(event) {
    let fieldName = event.target.name
    let fieldContent = event.target.value
    // Serialize updates
    this.setState((state) => {
      let newState = {}
      if (fieldName === 'current-password') {
        newState.currentPassword = fieldContent
        newState.currentPasswordHasBeenEdited = true
      }
      if (fieldName === 'new-password') {
        newState.newPasswordHasBeenEdited = true
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

  handleFirebaseError(err) {
    Logging.error(err)
    if (err.code === 'auth/wrong-password') {
      this.props.onFailure('Current password incorrect. Please try again.')
      this.setState({ currentPassword: '', currentPasswordHasBeenEdited: false })
    } else if (err.code === 'auth/too-many-requests') {
      this.props.onFailure('Too many incorrect attempts. Please try again later.')
    } else {
      this.props.onFailure('Failed to reset password. Please try again.')
    }
  }

  onSubmit() {
    const user = auth.currentUser
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, this.state.currentPassword)
    user
      .reauthenticateWithCredential(credential)
      .then(() => {
        user
          .updatePassword(this.state.password)
          .then(this.props.onSuccess())
          .catch((e) => this.handleFirebaseError(e))
      })
      .catch((e) => {
        this.handleFirebaseError(e)
      })
  }

  canSubmit() {
    return this.state.currentPassword && this.state.passwordIsValid && this.state.passwordsMatch
  }

  render() {
    return (
      <Modal
        hidden={this.props.hidden}
        onClose={this.props.onClose}
        containerClass="reset-password-modal-container"
        title="Change Password"
      >
        <form className="change-password-form modal-form">
          <ModalInput
            label="Current password"
            id="current-password"
            password={true}
            required={true}
            value={this.state.currentPassword}
            onChange={this.onChange}
            validation={!this.state.currentPassword && this.state.currentPasswordHasBeenEdited}
            validationMessage="Current password cannot be blank"
          />

          <ModalInput
            label="New password"
            id="new-password"
            required={true}
            password={true}
            value={this.state.password}
            onChange={this.onChange}
            validation={!this.state.passwordIsValid && this.state.newPasswordHasBeenEdited}
            validationMessage={
              this.state.password.length > 0
                ? 'Password must be at least 6 characters long'
                : 'New password cannot be blank'
            }
          />

          <ModalInput
            label="Confirm new password"
            id="confirm-password"
            required={true}
            password={true}
            value={this.state.confirmPassword}
            onChange={this.onChange}
            validation={!this.state.passwordsMatch && this.state.confirmPasswordHasBeenEdited}
            validationMessage="Passwords must match"
          />

          <PendingOperationButton className="save-button" operation={this.onSubmit} disabled={!this.canSubmit()}>
            Change Password
          </PendingOperationButton>
        </form>
      </Modal>
    )
  }
}

const ResetPasswordModal = withStore(ResetPasswordModalBase)

export default ResetPasswordModal
