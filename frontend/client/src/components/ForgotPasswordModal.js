import React from 'react'
import Modal from '../components/Modal'
import ModalInput from '../components/ModalInput'
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
      throw new Error()
    }

    try {
      await this.props.store.sendPasswordRecoveryEmail(this.state.email)
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
        <Modal
          name="Recover Password"
          hidden={this.props.hidden}
          onClose={this.onClose}
          containerClass="recover-password-modal-container"
        >
          <form onSubmit={this.onSubmit} onChange={this.handleChange}>
            <ModalInput
              label="Email or User Name"
              id="email-or-username"
              required={true}
              value={this.email}
              onChange={this.handleChange}
              validation={!this.state.validEmail}
              validationMessage={'Please enter a valid email or user name.'}
            />
            <PendingOperationButton operation={this.onSubmit} className="save-button">
              Email Recovery Link
            </PendingOperationButton>
            {this.state.isError && <div className="validationResult">Error sending reset email. Please try again.</div>}
          </form>
        </Modal>
      )
    } else {
      return (
        <Modal
          name="Recover Password"
          hidden={this.props.hidden}
          onClose={this.onClose}
          containerClass="recover-password-modal-container"
        >
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
