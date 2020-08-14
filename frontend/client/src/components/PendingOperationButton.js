import React, { useState, useEffect } from 'react'
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

  const className = (props.className || '') + ' button btn-medium' + (props.disabled ? ' disabled' : ' btn-primary')
  const style = props.style || {}
  const operation = props.operation || (() => {})
  const disabled = props.disabled || false

  // Flag to keep track of whether component is mounted. We check this flag in runOperation before setting the button's state,
  // in order to prevent cases where we mistakenly try to update the state when the button is no longer mounted, which was
  // happening relatively frequently in i.e. automatic-modal-closes and triggering the following warning:
  // "Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
  // To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
  var componentIsMounted = false
  useEffect(() => {
    componentIsMounted = true
    return function cleanup() {
      componentIsMounted = false
    }
  }, [])

  const runOperation = async () => {
    if (componentIsMounted) {
      setIsOperationPending(true)
    }
    try {
      await operation()
      if (componentIsMounted) {
        setIsOperationPending(false)
      }
    } catch {
      if (componentIsMounted) {
        setIsOperationPending(false)
      }
    }
  }

  if (!isOperationPending) {
    return (
      <div className="progress-container">
        <button className={className} disabled={disabled} style={style} onClick={runOperation}>
          {props.children}
        </button>
      </div>
    )
  } else {
    return (
      <div className="progress-container">
        <CircularProgress />
      </div>
    )
  }
}

export default PendingOperationButton
