import React from 'react'

/**
 * A label/input pair in a Modal
 * Props:
 *   label      text of the label
 *   id         id and name for the input tag
 *   required   is this a required field for the form?
 *   value      state variable to assign the inputted text to
 *   onChange   function to call on change of input
 *   validation function to validate if the input is valid
 *   validationMessage  message to display if field is invalid
 */
const ModalInput = (props) => {
  return (
    <div className="modal-input">
      <label htmlFor={props.id}>
        {props.label} {props.required ? <span>*</span> : ''}
      </label>
      <input
        type={props.password ? 'password' : 'text'}
        name={props.id}
        id={props.id}
        required={props.required}
        aria-required={props.required}
        value={props.value}
        onChange={props.onChange}
      />
      <div
        className="validationResult"
        style={{color: props.validationColor}}
      >
        {props.validation && props.validationMessage}
      </div>
    </div>
  )
}

export default ModalInput
