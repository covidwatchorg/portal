import React from 'react'
import Modal from '../components/Modal'
import { withStore } from '../store'
import * as ROLES from '../constants/roles'
import PendingOperationButton from './PendingOperationButton'

const ChangeRoleModalBase = (props) => {
  const fullName = `${props.userProperties.firstName} ${props.userProperties.lastName}`
  const fromRole = props.userProperties.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL
  const toRole = props.userProperties.isAdmin ? ROLES.NON_ADMIN_LABEL : ROLES.ADMIN_LABEL

  const onConfirm = async () => {
    props.store.updateUserByEmail(props.userProperties.email, { isAdmin: !props.userProperties.isAdmin })
    props.onClose()
  }

  return (
    <Modal hidden={props.hidden} onClose={props.onClose} containerClass="change-role-modal-container">
      <h2>Confirm Change</h2>

      <p>
        Please confirm that you would like to change the role of {fullName} from <b>{fromRole}</b> to <b>{toRole}</b>.{' '}
        {fullName} will recieve an email notification once this change is confirmed.
      </p>

      <button className="button cancel" onClick={props.onClose}>
        Cancel
      </button>
      <PendingOperationButton className="confirm" operation={onConfirm}>
        Confirm
      </PendingOperationButton>
    </Modal>
  )
}

const ChangeRoleModal = withStore(ChangeRoleModalBase)

export default ChangeRoleModal
