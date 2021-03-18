import React, { useEffect, useState } from "react";
import { LINKEDIN_CONNECTION_URL, PROJECT_NAME } from "../common/constant";
import {
  sentMessageToBackground,
  getDataFromStorage,
  removeStorageChangeListener,
  addStorageChangeListener,
} from "../common/utils";
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

  const filterUsersProfile = () => {
    console.log("filter started", usersProfile, storageData);
    let input =
      Object.keys(savedUsersProfile).length +
        Object.keys(unsavedUsersProfile).length ===
      Object.keys(usersProfile).length
        ? unsavedUsersProfile
        : usersProfile;

    let [saved, unsaved] = Object.entries(input).reduce(
      ([saved, unsaved], user) => {
        let email = storageData.users_profile[user[0]];
        return email !== undefined
          ? [{ ...saved, [user[0]]: { ...user[1], email } }, unsaved]
          : [saved, { ...unsaved, [user[0]]: { ...user[1] } }];
      },
      [{}, {}]
    );
    console.log("filter done", saved, unsaved);
    if (Object.keys(saved).length > 0) {
      setSavedUsersProfile({ ...savedUsersProfile, ...saved });
      setUnsavedUsersProfile({ ...unsaved });
      setUsersProfile({ ...usersProfile, ...saved });
    }
  };

  const storageChangeListener = (changes, area) => {
    if (area === "local" && PROJECT_NAME in changes) {
      console.log(
        "new storage change",
        changes[PROJECT_NAME].newValue,
        changes[PROJECT_NAME].oldValue
      );
      setStorageData(changes[PROJECT_NAME].newValue);
    }
  };

  const handleOnClickRefresh = () => {
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
    sentMessageToBackground(
      { to: "background", query: "UPDATE_EMAIL", data: unsavedUsersProfile },
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
    addStorageChangeListener(storageChangeListener);

    return () => removeStorageChangeListener(storageChangeListener);
  }, []);

  useEffect(() => {
    if (isLinkedInTab) handleOnClickRefresh();
  }, [isLinkedInTab]);

  useEffect(() => {
    console.log("useEffect: ", usersProfile, storageData);
    if (
      Object.keys(usersProfile).length > 0 &&
      Object.keys(storageData).length > 0
    ) {
      filterUsersProfile();
    }
  }, [usersProfile, storageData]);

  console.log("home: ", savedUsersProfile, unsavedUsersProfile);

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
