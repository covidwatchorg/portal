import React, { useRef } from 'react'
import close from '../../assets/close.svg'

/**
 * Modal component
 * Props:
 *  containerClass - a class used by a component that uses this one that wraps the whole modal
 *  title - The title of the modal
 */
const Modal = (props) => {
  const innerNode = useRef()

  const onOutsideClick = (event) => {
    if (props.isDismissible && !innerNode.current.contains(event.target)) {
      props.onClose()
    }
  }

  return (
    <div className={'modal-background' + (props.hidden === true ? ' hidden' : '')} onClick={onOutsideClick}>
      <div ref={innerNode} className={`modal-container ${props.containerClass ? props.containerClass : ''}`}>
        {props.isDismissible && (
          <span className="close-btn" onClick={props.onClose}>
            <img src={close} alt="Close" />
          </span>
        )}
        <h3>{props.title}</h3>
        {props.children}
      </div>
    </div>
  )
}

Modal.defaultProps = {
  isDismissible: true,
}

export default Modal
