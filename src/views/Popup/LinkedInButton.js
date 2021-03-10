import React, { Component } from "react";

import { LinkedIn } from "react-linkedin-login-oauth2";
import linkedin from "react-linkedin-login-oauth2/assets/linkedin.png";

class LinkedInButton extends Component {
  state = {
    code: "",
    errorMessage: "",
  };

  handleSuccess = (data) => {
    this.setState({
      code: data.code,
      errorMessage: "",
    });
  };

  handleFailure = (error) => {
    this.setState({
      code: "",
      errorMessage: error.errorMessage,
    });
  };

  render() {
    const { code, errorMessage } = this.state;
    return (
      <div>
        <LinkedIn
          clientId="86bdm842ht73vz"
          redirectUri={`${window.location.origin}/linkedin`}
          scope="r_liteprofile r_emailaddress"
          state="email_scrapper_state"
          onFailure={this.handleFailure}
          onSuccess={this.handleSuccess}
          redirectPath="/linkedin"
        >
          <img
            src={linkedin}
            alt="Log in with Linked In"
            style={{ maxWidth: "180px" }}
          />
        </LinkedIn>
        {!code && <div>No code</div>}
        {code && <div>Code: {code}</div>}
        {errorMessage && <div>{errorMessage}</div>}
      </div>
    );
  }
}

export default LinkedInButton;
