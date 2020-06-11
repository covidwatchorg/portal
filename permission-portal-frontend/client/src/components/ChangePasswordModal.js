import React from 'react'
import Modal from '../components/Modal'
import PendingOperationButton from '../components/PendingOperationButton'

class ChangePasswordModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
      password: '',
      confirmPassword: '',
      passwordsMatch: false,
    }
    this.onChange.bind(this)
  }

  onChange(event) {
    if (event.target.name === 'password') {
      this.setState({
        password: event.target.value,
      })
    }
    if (event.target.name === 'confirm-password') {
      this.setState({
        confirmPassword: event.target.value,
      })
    }
    this.setState((props, state) => {
      return {
        passwordsMatch: state.password === state.confirmPassword,
      }
    })
  }

  onClose() {
    this.setState({
      visible: false,
    })
  }

  render() {
    return (
      <Modal hidden={!this.state.visible} containerClass="change-password-modal-container">
        <h2>Welcome!</h2>
        <p>
          To make your account secure, please create a new password to replace the temporary password you were given in
          the email invitation.
        </p>

        <form className="change-password-form">
          <label htmlFor="password">
            New password<span>*</span>
          </label>
          <input
            type="password"
            required
            aria-required={true}
            id="password"
            name="password"
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

          {this.state.passwordsMatch}

          <PendingOperationButton className="save-password">Save</PendingOperationButton>
        </form>
      </Modal>
    )
  }
}

export default ChangePasswordModal
