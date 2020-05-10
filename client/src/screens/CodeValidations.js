import React, { useState } from "react";

import "../../Styles/screens/code_validations.scss";


const CodeValidations = () => {
    return (
      <div className="module-container">
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
            <div id="verify-code-btn">Verify Code</div>
          </div>
        </div>
      </div>
    );
}

export default CodeValidations;