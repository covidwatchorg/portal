import React from 'react'
import Modal from '../components/Modal'
import ModalInput from '../components/ModalInput'
import PendingOperationButton from '../components/PendingOperationButton'
import { withStore } from '../store'
import Logging from '../util/logging'

class ChangePasswordModalBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      heading: this.props.heading,
      subHeading: this.props.subHeading,
      isDismissible: false,
      visible: props.visible,
      password: '',
      confirmPassword: '',
      passwordsMatch: true,
      passwordIsValid: false,
      formHasBeenEdited: false,
      confirmPasswordHasBeenEdited: false,
      showNewPasswordInputs: true,
    }
    this.onChange = this.onChange.bind(this)
    this.onClose = this.onClose.bind(this)
    this.canSubmit = this.canSubmit.bind(this)
    this.handleFirebaseError = this.handleFirebaseError.bind(this)
    this.tryUpdatePassword = this.tryUpdatePassword.bind(this)
  }

  onChange(event) {
    let fieldName = event.target.name
    let fieldContent = event.target.value
    // Serialize updates
    this.setState((state) => {
      let newState = {
        formHasBeenEdited: true,
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
    this.props.store.setPasswordResetCompletedInCurrentSession(false)
    this.props.store.signOut()
    this.setState({ visible: false })
  }

  handleFirebaseError(err) {
    Logging.error(err)
    this.setState({
      heading: 'Oops!',
      subHeading:
        'An error occured while trying to reset your password. Please close this message and restart the process.',
      isDismissible: true,
      showNewPasswordInputs: false,
    })
    throw err
  }

  async tryUpdatePassword() {
    try {
      // Change user password to state.password
      await this.props.store.updatePassword(this.state.password)
      // Set passwordResetCompletedInCurrentSession to true so that modal is not dismissed on updateUser (see Login.js)
      this.props.store.setPasswordResetCompletedInCurrentSession(true)
      // updateUser
      await this.props.store.updateUser({
        isFirstTimeUser: false,
        passwordResetRequested: false,
      })
      // Update Modal state
      this.setState({
        isDismissible: true,
        heading: 'Password Successfully Reset',
        subHeading: 'Your password has successfully been updated. Go ahead and log in with your new password.',
        showNewPasswordInputs: false,
      })
    } catch (err) {
      this.handleFirebaseError()
    }
  }

  canSubmit() {
    return this.state.passwordIsValid && this.state.passwordsMatch
  }

  render() {
    return (
      <Modal
        title={this.state.heading}
        hidden={!this.state.visible}
        containerClass="change-password-modal-container"
        isDismissible={this.state.isDismissible}
        onClose={this.onClose}
      >
        <p>{this.state.subHeading}</p>
        {this.state.showNewPasswordInputs && (
          <form className="change-password-form">
            <ModalInput
              label="New Password"
              id="new-password"
              required={true}
              password={true}
              value={this.state.password}
              onChange={this.onChange}
              validation={!this.state.passwordIsValid && this.state.formHasBeenEdited}
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

            <PendingOperationButton
              className={'btn-fullwidth'}
              disabled={!this.canSubmit()}
              operation={this.tryUpdatePassword}
            >
              Save
            </PendingOperationButton>
          </form>
        )}
      </Modal>
    )
  }
}

const ChangePasswordModal = withStore(ChangePasswordModalBase)

export default ChangePasswordModal
