import React, { createRef } from 'react'
import Modal from '../components/Modal'
import PendingOperationButton from '../components/PendingOperationButton'
import { auth } from '../store/firebase'
import { withStore } from '../store'
import Logging from '../util/logging'
import Toast from '../components/Toast'
import firebase from 'firebase'

class ChangePasswordModalBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: props.store.user.isFirstTimeUser || false,
      currentPassword: '',
      password: '',
      confirmPassword: '',
      passwordsMatch: false,
      passwordIsValid: false,
      successful: false,
      message: '',
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onClose = this.onClose.bind(this)
    this.canSubmit = this.canSubmit.bind(this)

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
      }
      if (fieldName === 'new-password') {
        newState.password = fieldContent
        newState.passwordIsValid = newState.password && newState.password.length >= 6
        newState.passwordsMatch = newState.password === state.confirmPassword
      }
      if (fieldName === 'confirm-password') {
        newState.confirmPassword = fieldContent
        newState.passwordsMatch = state.password === newState.confirmPassword
      }
      return newState
    })
  }

  onClose() {
    this.setState({
      visible: false,
    })
  }

  onSubmit() {
    const user = auth.currentUser
    if (user) {
      // 0. Re-authenticate
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, this.state.currentPassword)
      const handleFirebaseError = (err) => {
        Logging.error(err)
        this.setState({
          successful: false,
          message: err.message,
        })
        this.toast.current.show()
        throw err
      }
      return user.reauthenticateWithCredential(credential).then(() => {
        // 1. Change user password to state.password
        const updatePwd = user.updatePassword(this.state.password)
        // 2. Set user.isFirstTimeUser to false
        const setFirstTimeUser = updatePwd.then(() => {
          this.props.store.user.update({ isFirstTimeUser: false })
        }, handleFirebaseError)
        // 3. Close the modal
        return setFirstTimeUser.then(() => {
          this.onClose()
          this.setState({
            successful: true,
            message: 'Password successfully updated.',
          })
          this.toast.current.show()
        })
      }, handleFirebaseError)
    } else {
      return Promise.reject('auth.currentUser is null or undefined')
    }
  }

  canSubmit() {
    return this.state.currentPassword && this.state.passwordIsValid && this.state.passwordsMatch
  }

  render() {
    return (
      <div>
        <Modal hidden={!this.state.visible} containerClass="change-password-modal-container" isDismissible={false}>
          <h2>Welcome!</h2>
          <p>
            To make your account secure, please create a new password to replace the temporary password you were given
            in the email invitation.
          </p>

          <form className="change-password-form">
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

            {/* TODO Enable if state.passwordIsValid && state.passwordsMatch */}
            <PendingOperationButton
              className={`save-password${this.canSubmit() ? '' : '-disabled'}`}
              operation={this.onSubmit}
            >
              Save
            </PendingOperationButton>
          </form>
        </Modal>
        <Toast ref={this.toast} isSuccess={this.state.successful} message={this.state.message} />
      </div>
    )
  }
}

const ChangePasswordModal = withStore(ChangePasswordModalBase)

export default ChangePasswordModal
