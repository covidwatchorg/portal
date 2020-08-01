import React from 'react'
import Modal from '../components/Modal'
import { withStore } from '../store'
import CancelConfirmButtons from '../components/CancelConfirmButtons'

const ChangeStatusModal = withStore((props) => {
  const fullName = `${props.userProperties.firstName} ${props.userProperties.lastName}`
  const toStatus = props.userProperties.toStatus

  const onConfirm = async () => {
    props.store.updateUserByEmail(props.userProperties.email, { disabled: toStatus === 'deactivated' })
    props.onClose()
  }

  return (
    <Modal
      title="Confirm Change"
      hidden={props.hidden}
      onClose={props.onClose}
      containerClass="change-status-modal-container"
    >
      <p>
        Please confirm that you would like to change the status of <b>{fullName}</b> to <b>{toStatus}</b>.
      </p>

      <CancelConfirmButtons cancel={props.onClose} confirm={onConfirm} />
    </Modal>
  )
})

export default ChangeStatusModal
