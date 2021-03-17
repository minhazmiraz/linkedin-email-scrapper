import {
  AppBar,
  CircularProgress,
  IconButton,
  Toolbar,
} from "@material-ui/core";
import { Refresh } from "@material-ui/icons";
import React from "react";

const Navbar = (props) => {
  const { isLoading, handleOnClickLoading } = props;

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

  return (
    
    <div className="navbar">
      <AppBar position="fixed" color="secondary">
        <Toolbar>
          <h3 style={{ flex: 1 }}>Email Scrapper</h3>
          {
            <div className="toolbar">
              {!isLoading && refreshButton}

              {isLoading && loadingButton}
            </div>
          }
        </Toolbar>
      </AppBar>
      {/*Fake Toolbar*/}
      <Toolbar />
    </div>
  );
};

export default Navbar;
