import {
  AppBar,
  CircularProgress,
  IconButton,
  Toolbar,
} from "@material-ui/core";
import { AlternateEmail, Refresh } from "@material-ui/icons";
import React from "react";

const Navbar = (props) => {
  const { isLoading, handleOnClickUpdate, handleOnClickLoading } = props;
  return (
    <div className="navbar">
      <AppBar position="fixed" color="secondary">
        <Toolbar>
          <h3 style={{ flex: 1 }}>Email Scrapper</h3>

          {!isLoading && (
            <IconButton
              aria-label="Refresh Data"
              onClick={() => handleOnClickLoading()}
              color="inherit"
              size="small"
              style={{ float: "left", padding: ["14px", "16px"] }}
            >
              <Refresh />
            </IconButton>
          )}

          {isLoading && (
            <IconButton
              aria-label="Refreshing Data"
              color="inherit"
              size="small"
              style={{ float: "left", padding: ["14px", "16px"] }}
            >
              <CircularProgress size={20} color="default" />
            </IconButton>
          )}

          {
            <IconButton
              color="inherit"
              aria-label="refresh"
              onClick={() => handleOnClickUpdate()}
              size="small"
              style={{ float: "left", padding: ["14px", "16px"] }}
            >
              <AlternateEmail />
            </IconButton>
          }
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default Navbar;
