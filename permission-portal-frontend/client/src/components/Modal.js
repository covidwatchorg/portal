import React, { useState, useRef } from 'react';
import close from '../../assets/close.svg'
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from '@material-ui/core/SnackbarContent';

// Encapsulates a button driven operation which takes time and may succeed or fail
const Modal = (props) => {
  const innerNode = useRef();

  const onOutsideClick = (event) => {
    if (!innerNode.current.contains(event.target)) {
      props.onClose();
    }
  };

  return (
    <div className={"modal-background" + (props.hidden === true ? ' hidden' : '')} onClick={onOutsideClick}>
      <div ref={innerNode} className={"add-member-modal-container"}>
        <span className="close-btn" onClick={props.onClose}><img src={close} alt="Close" /></span>
          {props.children}
      </div>
    </div>
  );
};

export default Modal;