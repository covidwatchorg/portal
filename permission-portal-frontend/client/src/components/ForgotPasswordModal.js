import React from 'react'
import Modal from '../components/Modal'
import { withStore } from '../store'

class ForgotPasswordModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = { emailPrompt: true, email: '', validEmail: true, isSuccess: false }
    this.onSubmit = this.onSubmit.bind(this)
    this.onClose = this.onClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  async onSubmit(event) {
    event.preventDefault()

    if (!this.state.email) {
      this.setState({ validEmail: false })
      return
    }

    const isSuccess = await this.props.store.sendPasswordResetEmail(this.state.email)
    this.setState({ isSuccess: isSuccess, emailPrompt: false, email: '', validEmail: true })
  }

  handleChange(event) {
    this.setState({ email: event.target.value })
  }

  onClose() {
    this.setState({ emailPrompt: true })
    this.props.onClose()
  }

  render() {
    if (this.state.emailPrompt) {
      return (
        <div className="recover-password-form">
          <Modal hidden={this.props.hidden} onClose={this.onClose} containerClass="recover-password-modal-container">
            <h2>Recover Password</h2>
            <form onSubmit={this.onSubmit} onChange={this.handleChange}>
              <label htmlFor="email-or-username">Email or User Name</label>
              <input type="text" id="email-or-username" required />
              <button type="submit" className="save-button recovery-button">
                {' '}
                Email Recovery Link{' '}
              </button>
              {!this.state.validEmail && <div className="validationResult">Please enter an email or user name.</div>}
            </form>
          </Modal>
        </div>
      )
    } else {
      return (
        <div className="recover-password-form">
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
        </div>
      )
    }
  }
}

export default withStore(ForgotPasswordModal)
