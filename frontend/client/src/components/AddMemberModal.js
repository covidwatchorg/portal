import React, { useState } from 'react'
import PendingOperationButton from '../components/PendingOperationButton'
import RoleSelector from '../components/RoleSelector'
import Modal from '../components/Modal'
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

  // TODO needs to fail but not close on validation failure and high light invalid fields (can do that before touching the store)
  return (
    <Modal hidden={props.hidden} onClose={props.onClose} containerClass="add-member-modal-container">
      <h2>Add Member</h2>
      <div className="add-member-form">
        <label htmlFor="firstName">
          First Name<span>*</span>
        </label>
        <input
          type="text"
          name="firstName"
          id="firstName"
          required
          aria-required="true"
          value={state.firstName}
          onChange={handleChange}
        />
        {state.firstNameValidationFailed && <div className="validationResult">{state.firstNameValidationMessage}</div>}
        <label htmlFor="lastName" style={{ marginTop: state.firstNameValidationFailed ? '6px' : null }}>
          Last Name<span>*</span>
        </label>
        <input
          type="text"
          name="lastName"
          id="lastName"
          required
          aria-required="true"
          value={state.lastName}
          onChange={handleChange}
        />
        {state.lastNameValidationFailed && <div className="validationResult">{state.lastNameValidationMessage}</div>}
        <label htmlFor="email" style={{ marginTop: state.lastNameValidationFailed ? '6px' : null }}>
          Email<span>*</span>
        </label>
        <input
          type="text"
          name="email"
          id="email"
          required
          aria-required="true"
          value={state.email}
          onChange={handleChange}
        />
        {state.emailValidationFailed && <div className="validationResult">{state.emailValidationMessage}</div>}
        <label htmlFor="role" style={{ marginTop: state.emailValidationFailed ? '6px' : null }}>
          Role<span>*</span>
        </label>
        {/* <div className="custom-select"> */}
        <RoleSelector isAdmin={false} id="role" required={true} onChange={handleChange} />
        {/* </div> */}
        {state.roleValidationFailed && <div className="validationResult">{state.roleValidationMessage}</div>}
        <div className="save-button-container">
          <PendingOperationButton className="save-button" operation={tryCreateUser}>
            Submit
          </PendingOperationButton>
        </div>
      </div>
    </Modal>
  )
})

const AddMemberModal = withStore(AddMemberModalBase)

export default AddMemberModal
