import React, { useState } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

/**
 * Encapsulates a button driven operation which takes time and may succeed or fail.
 *
 * Props:
 *  - operation: Should return a Promise or be an async function.
 *  - className: Any additional styles to apply to this component instance. button and disabled
 *    are applied by default.
 *  - disabled: false by default.
 */
const PendingOperationButton = (props) => {
  const [isOperationPending, setIsOperationPending] = useState(false)

  const className = (props.className || '') + ' button' + (props.disabled ? ' disabled' : '')
  const style = props.style || {}
  const operation = props.operation || (() => {})
  const disabled = props.disabled || false

  const startOperation = async () => {
    setIsOperationPending(true)
    try {
      await operation()
      setIsOperationPending(false)
    } catch {
      setIsOperationPending(false)
    }
  }

  if (!isOperationPending) {
    return (
      <button className={className} disabled={disabled} style={style} onClick={startOperation}>
        {props.children}
      </button>
    )
  } else {
    return (
      <div id="progress-container">
        <CircularProgress />
      </div>
    )
  }
}

export default PendingOperationButton
