import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CircularProgress from "@material-ui/core/CircularProgress";

import "../../Styles/screens/code_validations.scss";

// snackbars docs can be found here:
// https://material-ui.com/components/snackbars/


const CodeValidations = () => {
  const [state, setState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "center",
  });

   const { vertical, horizontal, open } = state;

   const handleClick = (newState) => () => {
     setState({ open: true, ...newState });
   };

  //  note: handleClose is necessary even if the <Snackbar> has a autoHideDuration prop
   const handleClose = () => {
     setState({ ...state, open: false });
    };


    return (
      <div className="module-container">
        {/* this is a Snackbar template to use for the success/failure notifications */}

        <h1>Positive Test Validations</h1>
        <div id="actions-box" className="gray-background">
          <div className="action-section">
            <div className="section-heading-container">
              <h2 className="section-heading">Validation Code</h2>
              <div className="tooltip">
                <img src="/client/assets/info-icon.svg" alt="info" />
                <div className="tooltip-msg">
                  {/* to replace tooltip text here: */}
                  <div className="tooltip-title">This the tooltip title</div>
                  <div className="tooltip-body">
                    Quisque sagittis, vel hendrerit consectetur tincidunt
                    senectus. Feugiat aenean nunc, tempus tempus, porta nibh.
                    Nunc id donec enim ut potenti risus amet amet.
                  </div>
                </div>
              </div>
            </div>
            <p className="section-description">
              Enter the positive test validation code the user gave to you over
              the phone.
            </p>
            <input type="text" placeholder="281-177-9"></input>
          </div>

          <div className="action-section">
            <h2 className="section-heading">Tracing Start Date</h2>
            <p className="section-description">
              Enter facilisis etiam. Felis sed blandit in lacus urna et, arcu
              notiar, dui, lorem.
            </p>
            <input type="date"></input>
          </div>

          <div id="white-box" className="action-section white-background">
            {/* circle loading graphic demo working:
              To do: trigger this upon click and loading of data.  Will this data processing take sufficiently long to justify having this loading graphic at all?
            */}
            <div id="progress-container">
              <CircularProgress />
            </div>

            <Button
              id="verify-code-btn"
              onClick={handleClick({ vertical: "top", horizontal: "center" })}
            >
              Verify Code
            </Button>
          </div>
        </div>

        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          key={`${vertical},${horizontal}`}
          open={open}
          onClose={handleClose}
          // autoHideDuration (controls how long until Snackbar disappears) we can adjust depending on UX preferences.
          autoHideDuration={3000}
        >
          <SnackbarContent
            anchorOrigin={{ vertical, horizontal }}
            style={{
              backgroundColor: "#43C4D9",
              fontFamily: "Montserrat",
              width: "100vw",
              fontSize: "24px",
              lineHeigh: "29px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            message={
              <span id="success-msg">
                <div>Code verification confirmed</div>
                <img
                  src="/client/assets/white_check_success_icon.svg"
                  alt="check"
                />
              </span>
            }
          />
        </Snackbar>

        {/* below is a template for the failure message.  At some point will need to pass props to render success/failure */}

        {/* <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          key={`${vertical},${horizontal}`}
          open={open}
          onClose={handleClose}
          // autoHideDuration (controls how long until Snackbar disappears) we can adjust depending on UX preferences.
          autoHideDuration={3000}
        >
          <SnackbarContent
            anchorOrigin={{ vertical, horizontal }}
            style={{
              backgroundColor: "#F05452",
              fontFamily: "Montserrat",
              width: "100vw",
              fontSize: "24px",
              lineHeigh: "29px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            message={
              <span id="failure-msg">
                <div>Alert message here</div>
                // might want a ! symbol or something
                // <img
                //   src="/client/assets/white_check_success_icon.svg"
                //   alt="check"
                // />
              </span>
            }
          />
        </Snackbar> */}
      </div>
    );
}

export default CodeValidations;