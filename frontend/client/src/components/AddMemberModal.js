import React, { useState } from 'react'
import PendingOperationButton from '../components/PendingOperationButton'
import RoleSelector from '../components/RoleSelector'
import Modal from '../components/Modal'
import ModalInput from '../components/ModalInput'
import * as ROLES from '../constants/roles'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import validateEmail from '../util/validateEmail'
import '../../styles/screens/add_member_modal.scss' // NOTE: see note in index.scss

const ValidationResult = (succeeded, failureReason) => {
  return {
    succeeded: succeeded,
    failureReason: failureReason,
  }
}

const ValidationRules = [
  (value) => {
    // firstName
    return ValidationResult(value.length > 0, 'First name required')
  },
  (value) => {
    // lastName
    return ValidationResult(value.length > 0, 'Last name required')
  },
  (value) => {
    // email
    return ValidationResult(validateEmail(value), 'Email address must be valid')
  },
  () => {
    // role
    return ValidationResult(true, 'Not possible')
  },
]

const AddMemberModalBase = observer((props) => {
  const [state, setState] = useState({
    firstName: '',
    firstNameValidationFailed: false,
    firstNameValidationMessage: '',
    lastName: '',
    lastNameValidationFailed: false,
    lastNameValidationMessage: '',
    email: '',
    emailValidationFailed: false,
    emailValidationMessage: '',
    role: ROLES.NON_ADMIN_LABEL,
    roleValidationFailed: false,
    roleValidationMessage: '',
  })

  const tryCreateUser = () => {
    let newState = {}
    let validationSucceeded = true
    const values = [state.firstName, state.lastName, state.email, state.role]
    ValidationRules.forEach((validationRule, index) => {
      const { succeeded, failureReason } = validationRule(values[index])
      if (succeeded === false) {
        if (index === 0) {
          newState.firstNameValidationFailed = true
          newState.firstNameValidationMessage = failureReason
        } else if (index === 1) {
          newState.lastNameValidationFailed = true
          newState.lastNameValidationMessage = failureReason
        } else if (index === 2) {
          newState.emailValidationFailed = true
          newState.emailValidationMessage = failureReason
        } else if (index === 3) {
          newState.roleValidationFailed = true
          newState.roleValidationMessage = failureReason
        }
        validationSucceeded = false
      }
    })

    if (validationSucceeded === false) {
      setState({ ...state, ...newState })
      return
    }

    return props.store
      .createUser({
        email: state.email,
        firstName: state.firstName,
        lastName: state.lastName,
        isAdmin: state.role === ROLES.ADMIN_LABEL,
      })
      .then(props.onSuccess, props.onFailure)
  }

  function handleChange(e) {
    if (e.target.name === 'firstName') {
      setState({ ...state, firstName: e.target.value })
    } else if (e.target.name === 'lastName') {
      setState({ ...state, lastName: e.target.value })
    } else if (e.target.name === 'email') {
      setState({ ...state, email: e.target.value })
    } else {
      setState({ ...state, role: e.target.value })
    }
  }

  return (
    <Modal title="Add Member" hidden={props.hidden} onClose={props.onClose} containerClass="add-member-modal-container">
      <form className="modal-form add-member-form">
        <ModalInput
          label="First Name"
          id="firstName"
          required={true}
          value={state.firstName}
          onChange={handleChange}
          validation={state.firstNameValidationFailed}
          validationMessage={state.firstNameValidationMessage}
        />

        <ModalInput
          label="Last Name"
          id="lastName"
          required={true}
          value={state.lastName}
          onChange={handleChange}
          validation={state.lastNameValidationFailed}
          validationMessage={state.lastNameValidationMessage}
        />

        <ModalInput
          label="Email"
          id="email"
          required={true}
          value={state.email}
          onChange={handleChange}
          validation={state.emailValidationFailed}
          validationMessage={state.emailValidationMessage}
        />

        <div className="modal-input">
          <label htmlFor="role" style={{ marginTop: state.emailValidationFailed ? '6px' : null }}>
            Role<span>*</span>
          </label>
          <RoleSelector isAdmin={false} id="role" required={true} onChange={handleChange} />
          {state.roleValidationFailed && <div className="validationResult">{state.roleValidationMessage}</div>}
        </div>
        <PendingOperationButton className="save-button" operation={tryCreateUser}>
          Submit
        </PendingOperationButton>
      </form>
    </Modal>
  )
})

const AddMemberModal = withStore(AddMemberModalBase)

export default AddMemberModal
