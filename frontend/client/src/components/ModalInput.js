import React from 'react'

/**
 * A label/input pair in a Modal
 * Props:
 *   label -- title of the label
 *   id -- id of input label corresponds to
 *   required -- is this a required field for the form?
 *   value -- the state variable the input to the label is assigned to
 *   onChange -- the function to call on change of input
 *   validation --
 *   validationMessage --
 */
const ModalInput = (props) => {
  return (
    <div className="modal-input">
      <label htmlFor={props.id}>
        {props.label} {props.required ? <span>*</span> : ''}
      </label>
      <input
        type="text"
        name={props.id}
        id={props.id}
        required={props.required}
        aria-required={props.required ? 'true' : 'false'}
        value={props.value}
        onChange={props.onChange}
      />
      {props.validation && <div className="validationResult">{props.validationMessage}</div>}
    </div>
  )
}

export default ModalInput
