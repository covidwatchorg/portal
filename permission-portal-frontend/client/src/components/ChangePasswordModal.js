import React from 'react'
import Modal from '../components/Modal'
import PendingOperationButton from '../components/PendingOperationButton'

class ChangePasswordModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
      passwordsMatch: false,
    }
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
          <input type="password" required aria-required={true} id="password" name="password" />
          <label htmlFor="confirm-password">
            Confirm new password<span>*</span>
          </label>
          <input type="password" required aria-required={true} id="confirm-password" name="confirm-password" />

          <PendingOperationButton className="save-password">Save</PendingOperationButton>
        </form>
      </Modal>
    )
  }
}

export default ChangePasswordModal
