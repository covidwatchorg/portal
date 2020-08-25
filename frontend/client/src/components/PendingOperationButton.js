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

  // Based on https://dev.to/otamnitram/react-useeffect-cleanup-how-and-when-to-use-it-2hbm
  useEffect(() => {
    let componentIsMounted = true

    // This function gets triggered whenever isOperationPending gets updated
    async function runOp() {
      // If isOperationPending was just flipped to true, try to run the operation()
      if (isOperationPending) {
        try {
          await operation()
          // Set state only if the component is still mounted. This handles cases where `await operation()`
          // triggers a global state change (i.e. in via the store) that unmounts this component directly after it completes.
          // In that case, cleanup() below will have run and set componentIsMounted to false, and so setIsOperationPending(false)
          // won't run and cause a memory leak, which was happening frequently and throwing the following warning:
          // "Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
          // To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
          if (componentIsMounted) {
            setIsOperationPending(false)
          }
        } catch {
          if (componentIsMounted) {
            setIsOperationPending(false)
          }
        }
      }
    }

    runOp()

    // Runs when component is unmounted
    return function cleanup() {
      componentIsMounted = false
    }
  }, [isOperationPending])

  const runOperation = () => {
    // Triggers useEffect
    setIsOperationPending(true)
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
