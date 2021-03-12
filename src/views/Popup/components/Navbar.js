import {
  AppBar,
  CircularProgress,
  IconButton,
  Toolbar,
} from "@material-ui/core";
import { AlternateEmail, Refresh } from "@material-ui/icons";
import React from "react";

const Navbar = (props) => {
  const {
    isAuth,
    isLoading,
    handleOnClickUpdate,
    handleOnClickLoading,
  } = props;

  const refreshButton = (
    <IconButton
      aria-label="Refresh Data"
      onClick={() => handleOnClickLoading()}
      color="inherit"
      size="small"
      style={{ float: "left", padding: ["14px", "16px"] }}
    >
      <Refresh />
    </IconButton>
  );

  const loadingButton = (
    <IconButton
      aria-label="Refreshing Data"
      color="inherit"
      size="small"
      style={{ float: "left", padding: ["14px", "16px"] }}
    >
      <CircularProgress size={20} color="default" />
    </IconButton>
  );

  const updateEmailButton = (
    <IconButton
      color="inherit"
      aria-label="refresh"
      onClick={() => handleOnClickUpdate()}
      size="small"
      style={{ float: "left", padding: ["14px", "16px"] }}
    >
      <AlternateEmail />
    </IconButton>
  );

  return (
    <div className="navbar">
      <AppBar position="fixed" color="secondary">
        <Toolbar>
          <h3 style={{ flex: 1 }}>Email Scrapper</h3>
          {isAuth && (
            <div className="toolbar">
              {!isLoading && refreshButton}

              {isLoading && loadingButton}

              {updateEmailButton}
            </div>
          )}
        </Toolbar>
      </AppBar>
      {/*Fake Toolbar*/}
      <Toolbar />
    </div>
  );
};

export default Navbar;
