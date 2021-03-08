import { CircularProgress, IconButton } from "@material-ui/core";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import RefreshIcon from "@material-ui/icons/Refresh";
import React, { useState } from "react";
import "./App.css";

function App() {
  const [usersProfile, setUsersProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClickLoading = () => {
    setIsLoading(true);
    console.log("popup refresh clicked");
    let port = chrome.runtime.connect({ name: "email-scrapper" });
    port.postMessage("GET_USER_DATA");
    port.onMessage.addListener(function (response) {
      console.log(response);
      setUsersProfile({ ...response, ...usersProfile });
      setIsLoading(false);
    });
  };

  const handleOnClickUpdate = () => {
    /* usersProfile.map"/detail/contact-info/" */
    Object.entries(usersProfile).forEach((user) => {
      setTimeout(() => {
        fetch(
          new Request(user[1].url + "detail/contact-info/", {
            method: "GET",
            headers: new Headers({ "Access-Control-Allow-Origin": "*" }),
          })
        )
          .then((response) => response.text())
          .then((response) => {
            console.log(response);
            const doc = new DOMParser().parseFromString(response, "text/html");
            console.log(doc);
            const email = doc.querySelector("[href^=mailto]");
            console.log("email ", email);
            setUsersProfile({
              ...usersProfile,
              [user[0]]: { ...user[1], email: email.href },
            });
          })
          .catch((err) => console.log(err));
      }, 300);
    });
  };

  return (
    <div className="App">
      <span>
        <h3>Users Link</h3>
      </span>
      <span>
        {!isLoading && (
          <IconButton onClick={() => handleOnClickLoading()}>
            <RefreshIcon />
          </IconButton>
        )}
        {isLoading && (
          <IconButton>
            <CircularProgress size={20} />
          </IconButton>
        )}
      </span>
      <span>
        {
          <IconButton onClick={() => handleOnClickUpdate()}>
            <AlternateEmailIcon />
          </IconButton>
        }
      </span>
      <ul>
        {usersProfile &&
          Object.values(usersProfile).map((user) => <li>{user}</li>)}
      </ul>
    </div>
  );
}

export default App;
