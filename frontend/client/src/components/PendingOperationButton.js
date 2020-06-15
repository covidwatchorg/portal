import React from 'react'
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
  const [state, setState] = React.useState({
    isOperationStarted: false,
    operationSucceeded: false,
  })

  const className = (props.className || '') + ' button' + (props.disabled ? ' disabled' : '')
  const operation = props.operation || (() => {})
  const disabled = props.disabled || false

  const startOperation = () => {
    setState({
      isOperationStarted: true,
      operationSucceeded: false,
    })
    const onSuccess = () => {
      setState({
        isOperationStarted: false,
        operationSucceeded: true,
      })
    }
    const onFailure = () => {
      setState({
        isOperationStarted: false,
        operationSucceeded: false,
      })
    }
    const operationValue = operation()
    if (operationValue) {
      operationValue.then(onSuccess, onFailure)
    } else {
      setState({
        isOperationStarted: false,
        operationSucceeded: false,
      })
    }
  }

  if (!state.isOperationStarted) {
    return (
      <button className={className} disabled={disabled} onClick={startOperation}>
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
