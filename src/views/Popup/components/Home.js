import React, { useEffect, useState } from "react";
import {
  isAuthenticated,
  sentMessageToBackground,
  getDataFromStorage,
} from "../common/utils";
import Body from "./Body";
import Navbar from "./Navbar";

function Home() {
  const [usersProfile, setUsersProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [storageData, setStorageData] = useState({});

  const handleOnClickLoading = () => {
    setIsLoading(true);
    console.log("popup refresh clicked");
    const payload = { to: "content", query: "GET_USER_DATA" };
    sentMessageToBackground(payload, (response) => {
      //console.log(response);
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

  const handleAuthentication = () => {
    sentMessageToBackground(
      { to: "background", query: "GET_ACCESS_TOKEN" },
      (res) => console.log(res)
    );
  };

  useEffect(() => {
    getDataFromStorage().then((res) => {
      if (res) setStorageData(res);
      setIsAuth(isAuthenticated(res));
    });
  }, []);

  console.log(storageData, isAuth);

  return (
    <div className="App">
      <Navbar
        isAuth={isAuth}
        isLoading={isLoading}
        handleOnClickUpdate={handleOnClickUpdate}
        handleOnClickLoading={handleOnClickLoading}
      />
      <Body
        isAuth={isAuth}
        usersProfile={usersProfile}
        handleAuthentication={handleAuthentication}
      />
    </div>
  );
}

export default Home;
