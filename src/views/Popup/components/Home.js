import React, { useEffect, useState } from "react";
import {
  LINKEDIN_ALL_SEARCH_URL,
  LINKEDIN_CONNECTION_URL,
  LINKEDIN_PEOPLE_SEARCH_URL,
  PROJECT_NAME,
} from "../common/constant";
import {
  sentMessageToBackground,
  getDataFromStorage,
  removeStorageChangeListener,
  addStorageChangeListener,
} from "../common/utils";
import BottomNav from "./BottomNav";
import LinkedInTab from "./LinkedInTab";
import NotLinkedInTab from "./NotLinkedInTab";

function Home() {
  const [usersProfile, setUsersProfile] = useState({});
  const [savedUsersProfile, setSavedUsersProfile] = useState({});
  const [unsavedUsersProfile, setUnsavedUsersProfile] = useState({});
  const [storageData, setStorageData] = useState({});
  const [isLinkedInTab, setIsLinkedInTab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [bottomNavigationValue, setBottomNavigationValue] = useState(0);

  const getCurrentTabUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const URL = tabs[0].url;
      if (
        URL.indexOf(LINKEDIN_CONNECTION_URL) !== -1 ||
        URL.indexOf(LINKEDIN_ALL_SEARCH_URL) !== -1 ||
        URL.indexOf(LINKEDIN_PEOPLE_SEARCH_URL) !== -1
      ) {
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
        let profile =
          storageData.users_profile && storageData.users_profile[user[0]];
        return profile !== undefined && profile.email !== undefined
          ? [{ ...saved, [user[0]]: profile }, unsaved]
          : [saved, { ...unsaved, [user[0]]: user[1] }];
      },
      [{}, {}]
    );
    console.log("filter done", saved, unsaved);
    setUnsavedUsersProfile({ ...unsaved });
    if (Object.keys(saved).length > 0) {
      setSavedUsersProfile({ ...savedUsersProfile, ...saved });
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
      setIsUpdating(changes[PROJECT_NAME].newValue.is_emails_updating);
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

  const handleBottomNavigationValue = (event, newValue) => {
    setBottomNavigationValue(newValue);
  };

  useEffect(() => {
    getCurrentTabUrl();
    getDataFromStorage().then((res) => {
      if (res) {
        setStorageData(res);
        setIsUpdating(res.is_emails_updating);
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
    if (Object.keys(usersProfile).length > 0) {
      filterUsersProfile();
    }
  }, [usersProfile, storageData]);

  console.log("home: ", savedUsersProfile, unsavedUsersProfile);

  return (
    <div className="Home">
      <BottomNav
        bottomNavigationValue={bottomNavigationValue}
        handleBottomNavigationValue={handleBottomNavigationValue}
        usersProfile={usersProfile}
        storageData={storageData}
      />

      <LinkedInTab
        isLoading={isLoading}
        isUpdating={isUpdating}
        isLinkedInTab={isLinkedInTab}
        usersProfile={usersProfile}
        savedUsersProfile={savedUsersProfile}
        storageData={storageData}
        bottomNavigationValue={bottomNavigationValue}
        unsavedUsersProfile={unsavedUsersProfile}
        handleOnClickUpdate={handleOnClickUpdate}
        handleOnClickRefresh={handleOnClickRefresh}
      />
    </div>
  );
}

export default Home;
