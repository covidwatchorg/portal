import React from 'react'
import Modal from '../components/Modal'
import { withStore } from '../store'
import * as ROLES from '../constants/roles'
import PendingOperationButton from './PendingOperationButton'

const ChangeRoleModal = withStore((props) => {
  const fullName = `${props.userProperties.firstName} ${props.userProperties.lastName}`
  const fromRole = props.userProperties.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL
  const toRole = props.userProperties.isAdmin ? ROLES.NON_ADMIN_LABEL : ROLES.ADMIN_LABEL

  const onConfirm = async () => {
    props.store.updateUserByEmail(props.userProperties.email, { isAdmin: !props.userProperties.isAdmin })
    props.onClose()
  }

  return (
    <Modal hidden={props.hidden} onClose={props.onClose} containerClass="change-role-modal-container">
      <h3>Confirm Change</h3>

      <p>
        Please confirm that you would like to change the role of <b>{fullName}</b>.
      </p>
      <p className="role-change">
        From: <b>{fromRole}</b>
        <br />
        To: <b>{toRole}</b>
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

export default ChangeRoleModal
