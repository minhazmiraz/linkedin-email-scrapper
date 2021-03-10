import {
  AppBar,
  Avatar,
  Card,
  CardHeader,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  Toolbar,
} from "@material-ui/core";
import { AlternateEmail, Refresh } from "@material-ui/icons";
import React, { useEffect, useState } from "react";

function Home() {
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

  /* useEffect(() => {
    const abortCtrl = new AbortController();
    getDataFromStorage().then((storageResponse) => {
      if (!storageResponse || !storageResponse[storageKey]) {
        getFetch(getFileTreeEndpoint(repoDetails), abortCtrl).then(
          (fetchResponse) => {
            let storageData = {
              ...fetchResponse.data,
              tree: parseJsonToTree(fetchResponse.data.tree),
            };
            storageResponse = {
              ...storageResponse,
              [storageKey]: storageData,
            };
            if (!fetchResponse.isPending) setDataInStorage(storageResponse);
            setGitRepoContextData(storageResponse[storageKey]);
          }
        );
      } else {
        console.log("Data found in storage");
        setGitRepoContextData(storageResponse[storageKey]);
      }
    });
    return () => abortCtrl.abort();
  }, []); */

  return (
    <div className="App">
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
      <Container>
        {Object.entries(usersProfile).length === 0 && (
          <div>
            <img
              src="logo192.png"
              style={{
                position: "absolute",
                opacity: 0.05,
                margin: "auto",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
              width="50%"
              height="50%"
              alt=""
            />
            <p
              style={{
                padding: "",
                fontFamily: "Georgia",
                fontSize: "18px",
                color: "#bdb9b9",
                textAlign: "center",
                display: "flex",
                "justify-content": "center",
                "flex-direction": "column",
                height: "450px",
              }}
            >
              <i>
                Goto linkedin connection or search page and click the refresh
                button
              </i>
            </p>
          </div>
        )}
        {Object.entries(usersProfile).length > 0 && (
          <List component="ul">
            {usersProfile &&
              Object.values(usersProfile).map((user) => (
                <ListItem>
                  <Card raised="true" style={{ width: "100%" }}>
                    <CardHeader
                      avatar={<Avatar src={user.img} />}
                      title={<b> {user.name} </b>}
                      subheader={user.occ}
                    />
                  </Card>
                </ListItem>
              ))}
          </List>
        )}
      </Container>
    </div>
  );
}

export default Home;
