import React, { useState } from 'react'
import PendingOperationButton from '../components/PendingOperationButton'
import store from '../store'
import RoleSelector from '../components/RoleSelector'
import Modal from '../components/Modal'
import * as ROLES from '../constants/roles'

const ValidationResult = (succeeded, failureReason) => {
  return {
    succeeded: succeeded,
    failureReason: failureReason,
  }
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
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
  (value) => {
    // role
    return ValidationResult(true, 'Not possible')
  },
]

const AddMemberModal = (props) => {
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

  const submitMemberInvitation = () => {
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

    return store
      .sendMemberInvitationEmail({
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
    <Modal hidden={props.hidden} onClose={props.onClose}>
      <h1>Add Member</h1>
      <div className="add-member-form">
        <label for="fname">
          First Name<span>*</span>
        </label>
        <input type="text" name="firstName" value={state.firstName} onChange={handleChange} />
        {state.firstNameValidationFailed && <div className="validationResult">{state.firstNameValidationMessage}</div>}
        <label for="lname">
          Last Name<span>*</span>
        </label>
        <input type="text" name="lastName" value={state.lastName} onChange={handleChange} />
        {state.lastNameValidationFailed && <div className="validationResult">{state.lastNameValidationMessage}</div>}
        <label for="email">
          Email<span>*</span>
        </label>
        <input type="text" name="email" value={state.email} onChange={handleChange} />
        {state.emailValidationFailed && <div className="validationResult">{state.emailValidationMessage}</div>}
        <label for="role">
          Role<span>*</span>
        </label>
        <RoleSelector isAdmin={false} onChange={handleChange} />
        {state.roleValidationFailed && <div className="validationResult">{state.roleValidationMessage}</div>}
        <div className="save-button-container">
          <PendingOperationButton className="save-button" operation={submitMemberInvitation}>
            Submit
          </PendingOperationButton>
        </div>
      </div>
    </Modal>
  )
}

export default AddMemberModal
