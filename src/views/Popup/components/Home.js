import React, { useEffect, useState } from "react";
import { LINKEDIN_CONNECTION_URL } from "../common/constant";
import { sentMessageToBackground, getDataFromStorage } from "../common/utils";
import LinkedInTab from "./LinkedInTab";
import NotLinkedInTab from "./NotLinkedInTab";

function Home() {
  const [usersProfile, setUsersProfile] = useState({});
  const [savedUsersProfile, setSavedUsersProfile] = useState({});
  const [unsavedUsersProfile, setUnsavedUsersProfile] = useState({});
  const [storageData, setStorageData] = useState({});
  const [isLinkedInTab, setIsLinkedInTab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentTabUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.indexOf(LINKEDIN_CONNECTION_URL) !== -1) {
        setIsLinkedInTab(true);
      }
    });
  };

  //TODO: filter saved and unsaved data
  const filterUsersProfile = () => {
    let [saved, unsaved] = Object.entries(usersProfile).reduce(
      ([saved, unsaved], user) => {
        let email = storageData.users_profile[user[0]];
        return email
          ? [{ ...saved, [user[0]]: { ...user[1], email } }, unsaved]
          : [saved, { ...unsaved, [user[0]]: { ...user[1] } }];
      },
      [{}, {}]
    );
    console.log(saved, unsaved);
    setSavedUsersProfile(saved);
    setUnsavedUsersProfile(unsaved);
    setUsersProfile({ ...usersProfile, ...saved });
  };

  const handleOnClickRefresh = () => {
    setIsLoading(true);
    console.log("popup refresh clicked");
    const payload = { to: "content", query: "GET_USER_DATA" };
    sentMessageToBackground(payload, (response) => {
      //console.log(response);
      setUsersProfile({ ...response, ...usersProfile });
      //filterUsersProfile();
      setIsLoading(false);
    });
  };

  const handleOnClickUpdate = () => {
    sentMessageToBackground(
      { to: "background", query: "UPDATE_EMAIL", data: usersProfile },
      (res) => console.log(res)
    );
  };

  useEffect(() => {
    getCurrentTabUrl();
    getDataFromStorage().then((res) => {
      if (res) {
        setStorageData(res);
      }
    });
  }, []);

  useEffect(() => {
    if (isLinkedInTab) handleOnClickRefresh();
  }, [isLinkedInTab]);

  console.log(storageData);

  return (
    <div className="App">
      {isLinkedInTab && Object.entries(usersProfile).length > 0 ? (
        <LinkedInTab
          isLoading={isLoading}
          usersProfile={usersProfile}
          savedUsersProfile={savedUsersProfile}
          unsavedUsersProfile={unsavedUsersProfile}
          handleOnClickUpdate={handleOnClickUpdate}
          handleOnClickRefresh={handleOnClickRefresh}
        />
      ) : (
        <NotLinkedInTab />
      )}
    </div>
  );
}

export default Home;
