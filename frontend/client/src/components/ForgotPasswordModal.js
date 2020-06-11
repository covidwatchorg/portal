import React from 'react'
import Modal from '../components/Modal'
import { withStore } from '../store'
import PendingOperationButton from '../components/PendingOperationButton'
import validateEmail from '../util/validateEmail'

class ForgotPasswordModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = { emailPrompt: true, email: '', validEmail: true, isSuccess: false }
    this.onSubmit = this.onSubmit.bind(this)
    this.onClose = this.onClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  async onSubmit() {
    if (!validateEmail(this.state.email)) {
      this.setState({ validEmail: false })
      return
    }

    try {
      await this.props.store.sendPasswordResetEmail(this.state.email)
      this.setState({ isSuccess: true, emailPrompt: false, email: '', validEmail: true })
    } catch {
      this.setState({ isSuccess: false, emailPrompt: false, email: '', validEmail: true })
    }
  }

  handleChange(event) {
    this.setState({ email: event.target.value })
  }

  onClose() {
    this.setState({ emailPrompt: true, email: '', validEmail: true, isSuccess: false })
    this.props.onClose()
  }

  render() {
    if (this.state.emailPrompt) {
      return (
        <Modal hidden={this.props.hidden} onClose={this.onClose} containerClass="recover-password-modal-container">
          <h2>Recover Password</h2>
          <form onSubmit={this.onSubmit} onChange={this.handleChange}>
            <label htmlFor="email-or-username">Email or User Name</label>
            <input type="text" id="email-or-username" required />
            <PendingOperationButton operation={this.onSubmit} className="save-button recovery-button">
              Email Recovery Link
            </PendingOperationButton>
            {!this.state.validEmail && <div className="validationResult">Please enter a valid email or user name.</div>}
            {this.state.isError && <div className="validationResult">Error sending reset email. Please try again.</div>}
          </form>
        </Modal>
      )
    } else {
      return (
        <Modal hidden={this.props.hidden} onClose={this.onClose} containerClass="recover-password-modal-container">
          <h2>Recover Password</h2>
          <p>
            {this.state.isSuccess
              ? ' A password recovery link has been sent to the email address associated with your account. Please click the' +
                ' link in the email to reset your password. '
              : ' Failed to send password recovery link. Please verify that the entered email address is associated with your' +
                ' account and try again. '}
          </p>
        </Modal>
      )
    }
  }
}

export default withStore(ForgotPasswordModal)
