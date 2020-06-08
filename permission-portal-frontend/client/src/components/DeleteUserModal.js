import React, { useState } from 'react'
import Modal from '../components/Modal'
import '../../Styles/screens/delete_user_modal.scss'
import { withStore } from '../store'
import PendingOperationButton from '../components/PendingOperationButton'

const DeleteUserModal = (props) => {
  const [emailInput, setEmailInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleChange = (e) => {
    setEmailInput(e.target.value)
  }

  const onSubmit = async () => {
    if (emailInput != props.email) {
      setHasError(true)
      setErrorMessage('Emails do not match')
    } else {
      try {
        await props.store.data.deleteUser(props.email)
        onClose()
        props.onSuccess()
      } catch (err) {
        onClose()
        props.onFailure()
      }
    }
  }

  const onClose = () => {
    setEmailInput('')
    setErrorMessage('')
    setHasError(false)
    props.onClose()
  }

  return (
    <Modal hidden={props.hidden} onClose={onClose} containerClass="delete-user-modal-container">
      <h2>Delete User</h2>
      <form onChange={handleChange} onSubmit={onSubmit}>
        <div className="confirmation-text">
          Confirm that you wish to delete user {props.email} by entering their email address
        </div>
        <input defaultValue={emailInput} type="text" id="email-or-username" required />
        {hasError && <div className="validationResult">{errorMessage}</div>}
        <PendingOperationButton className="save-button recovery-button" operation={onSubmit}>
          Delete User
        </PendingOperationButton>
      </form>
    </Modal>
  )
}

export default withStore(DeleteUserModal)
