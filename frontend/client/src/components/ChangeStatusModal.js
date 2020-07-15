import React from 'react'
import Modal from '../components/Modal'
import { withStore } from '../store'
import PendingOperationButton from './PendingOperationButton'

const ChangeStatusModal = withStore((props) => {
  const fullName = `${props.userProperties.firstName} ${props.userProperties.lastName}`
  const toStatus = props.userProperties.toStatus

  const onConfirm = async () => {
    props.store.updateUserByEmail(props.userProperties.email, { disabled: toStatus === 'deactivated' })
    props.onClose()
  }

  return (
    <Modal hidden={props.hidden} onClose={props.onClose} containerClass="change-status-modal-container">
      <h2>Confirm Change</h2>

      <p>
        Please confirm that you would like to change the status of <b>{fullName}</b> to <b>{toStatus}</b>.
      </p>

      <button className="button btn-medium btn-secondary" onClick={props.onClose}>
        Cancel
      </button>
      <PendingOperationButton className="confirm" operation={onConfirm}>
        Confirm
      </PendingOperationButton>
    </Modal>
  )
})

export default ChangeStatusModal
