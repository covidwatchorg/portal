import React from 'react'
import PendingOperationButton from './PendingOperationButton'

/**
 * A pair of buttons, cancel and confirm
 * Props:
 *  cancel -- operation for cancel button
 *  confirm -- operation for confirm button
 */
const CancelConfirmButtons = (props) => {
  return (
    <div className="buttons-container">
      <button className="button btn-medium btn-secondary" onClick={props.cancel}>
        Cancel
      </button>
      <PendingOperationButton className="confirm" operation={props.confirm}>
        Confirm
      </PendingOperationButton>
    </div>
  )
}

export default CancelConfirmButtons
