import React, { useState } from 'react';
import PendingOperationButton from '../components/PendingOperationButton';
import store from '../store'
import RoleSelector from '../components/RoleSelector';
import Modal from '../components/Modal';

const ValidationResult = (succeeded, failureReason) => {
  return {
    succeeded: succeeded,
    failureReason: failureReason
  };
};

const ValidationRule = (condition) => {
  return {
    validationCondition: condition
  };
};

const ValidationRules = [
  (value) => {
    // TODO valid first name
    return ValidationResult(false, "Validation not implemented");
  },
  (value) => {
    // TODO valid last name
    return ValidationResult(false, "Validation not implemented");
  },
  (value) => {
    // TODO valid email, that doesn't already exist
    return ValidationResult(false, "Validation not implemented");
  },
  (value) => {
    // TODO role is in list of valid roles
    return ValidationResult(false, "Validation not implemented");
  }
];

const AddMemberModal = (props) => {
  const [state, setState] = React.useState({
    firstName: "",
    firstNameValidationFailed: false,
    firstNameValidationMessage: "",
    lastName: "",
    lastNameValidationFailed: false,
    lastNameValidationMessage: "",
    email: "",
    emailValidationFailed: false,
    emailValidationMessage: "",
    role: "",
    roleValidationFailed: false,
    roleValidationMessage: ""
  });

  const submitMemberInvitation = () => {
    let newState = {};
    let validationSucceeded = true;
    const values = [state.firstName, state.lastName, state.email, state.role];
    ValidationRules.forEach((validationRule, index) => {
      const {succeeded, failureReason} = validationRule(values[index]);
      if (succeeded === false) {
        if (index === 0) {
          newState.firstNameValidationFailed = true;
          newState.firstNameValidationMessage = failureReason;
        } else if (index === 1) {
          newState.lastNameValidationFailed = true;
          newState.lastNameValidationMessage = failureReason;
        } else if (index === 2) {
          newState.emailValidationFailed = true;
          newState.emailValidationMessage = failureReason;
        } else if (index === 3) {
          newState.roleValidationFailed = true;
          newState.roleValidationMessage = failureReason;
        }
        validationSucceeded = false;
      }
    });

    if (validationSucceeded === false) {
      setState({...state, ...newState});
      return;
    }

    return store.sendMemberInvitationEmail(state).then(props.onSuccess, props.onFailure);
  }

  // TODO require stars
  // TODO needs to fail but not close on validation failure and high light invalid fields (can do that before touching the store)
  return (
    <Modal hidden={props.hidden} onClose={props.onClose}>
      <h1>Add Member</h1>
      <div className="add-member-form">
        <label for="fname">First Name<span>*</span></label>
        <input type="text" id="fname" name="fname" />
        {
          state.firstNameValidationFailed &&
          <div className="validationResult">
            {state.firstNameValidationMessage}
          </div>
        }
        <label for="lname">Last Name<span>*</span></label>
        <input type="text" id="lname" name="lname" />
        {
          state.lastNameValidationFailed &&
          <div className="validationResult">
            {state.lastNameValidationMessage}
          </div>
        }
        <label for="email">Email<span>*</span></label>
        <input type="text" id="email" name="email" />
        {
          state.emailValidationFailed &&
          <div className="validationResult">
            {state.emailValidationMessage}
          </div>
        }
        <label for="role">Role<span>*</span></label>
        <RoleSelector isAdmin={true} />
        {
          state.roleValidationFailed &&
          <div className="validationResult">
            {state.roleValidationMessage}
          </div>
        }
        <div className="save-button-container">
          <PendingOperationButton className="save-button" operation={submitMemberInvitation}>
            Submit
          </PendingOperationButton>
        </div>
      </div>
    </Modal>
  )
}

export default AddMemberModal;