import React, { useState } from 'react';
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from '@material-ui/core/SnackbarContent';

// Encapsulates a button driven operation which takes time and may succeed or fail
const Toast = (props) => {
  const [state, setState] = React.useState({
    vertical: "top",
    horizontal: "center",
  });

  const { vertical, horizontal } = state;

  return <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          key={`${vertical},${horizontal}`}
          open={props.open}
          onClose={props.onClose}
          autoHideDuration={6000}
        >
        <SnackbarContent
          style={{
            backgroundColor: props.isSuccess ? "#43C4D9" : "#F05452",
            fontFamily: "Montserrat",
            width: "100vw",
            fontSize: "24px",
            lineHeigh: "29px",
            fontWeight: "600",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "57px"
          }}
          message={
            <span id="msg">
              <div className="toastMessage">{props.message}</div>
              <img className="toastCheck"
                src="/client/assets/white_check_success_icon.svg"
                alt="check"
              />
            </span>
          }
        />
      </Snackbar>
};

export default Toast;