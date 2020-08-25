import React from 'react'
import zxcvbn from 'zxcvbn'
import ModalInput from '../components/ModalInput'

/**
 * A component combining a ModalInput with a password strength meter.
 * @param {*} props.label      the label for the component
 * @param {*} props.id         the component ID
 * @param {*} props.required
 * @param {*} props.value      the current value of the form field
 * @param {*} props.onChange   event handler
 * @param {*} props.validation whether to display a validation message
 */
const PasswordStrengthModalInput = (props) => {
  const estimatePasswordStrength = (password) => {
    let result = zxcvbn(password)
    return result.score
  }

  const validation = (password) => {
    if (password.length < 6) {
      return { valid: false, message: 'Password is too short', color: '#f05452' }
    } else {
      let score = estimatePasswordStrength(password)
      switch (score) {
        case 0:
        case 1:
          return { valid: false, message: 'Password strength: weak', color: '#f05452' }
        case 2:
          return { valid: true, message: 'Password strength: okay', color: '#43c4d9' }
        case 3:
          return { valid: true, message: 'Password strength: good', color: '#388ec5' }
        case 4:
          return { valid: true, message: 'Password strength: great', color: '#2c58b1' }
      }
    }
  }

  let validationResult = validation(props.value)

  return (
    <ModalInput
      label={props.label}
      id={props.id}
      required={props.required}
      password={true}
      value={props.value}
      onChange={props.onChange}
      validation={props.validation}
      validationMessage={validationResult.message}
      validationColor={validationResult.color}
    />
  )
}

export default PasswordStrengthModalInput
