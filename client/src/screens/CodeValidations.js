import React, { useState } from "react";

import "../../Styles/screens/code_validations.scss";


const CodeValidations = () => {
    return (
      <div className="module-container">
        <h1>Positive Test Validations</h1>

        <div id="actions-box" className="gray-background">
          <div className="action-section">
            <h2 className="section-heading">Validation Code</h2>
            <p className="section-description">
              Enter the positive test validation code the user gave to you over
              the phone.
            </p>
            <input type="text"></input>
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