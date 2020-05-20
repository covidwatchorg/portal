import React from 'react'

// Encapsulates a button driven operation which takes time and may succeed or fail
const Modal = (props) => {
  return (
    <div className={'modal-background' + (props.hidden === true ? ' hidden' : '')}>
      <div className={'add-member-modal-container'}>
        <span className="close-btn" onClick={props.onClose}>
          X
        </span>
        {props.children}
      </div>
    </div>
  )
}

export default Modal
