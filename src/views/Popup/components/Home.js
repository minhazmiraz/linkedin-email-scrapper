import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React, { createRef, useEffect, useState } from "react";
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
  setDataInStorage,
} from "../common/utils";
import BottomNav from "./BottomNav";
import LinkedInTab from "./LinkedInTab";
import SavedProfilesTab from "./SavedProfilesTab";
import SettingTab from "./SettingTab";

function Home() {
  const [usersProfile, setUsersProfile] = useState({});
  const [savedUsersProfile, setSavedUsersProfile] = useState({});
  const [unsavedUsersProfile, setUnsavedUsersProfile] = useState({});
  const [storageData, setStorageData] = useState({});
  const [isLinkedInTab, setIsLinkedInTab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [apiTokenPopupOpen, setApiTokenPopupOpen] = useState(false);
  const [bottomNavigationValue, setBottomNavigationValue] = useState(0);
  const domRef = React.createRef();
  let tempTextAreaValue = "";

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
        let profile = storageData?.users_profile?.[user[0]];

        if (profile?.email?.length >= 0)
          return [{ ...saved, [user[0]]: profile }, unsaved];
        else return [saved, { ...unsaved, [user[0]]: user[1] }];
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

  const handleOnClickUpdate = (data) => {
    sentMessageToBackground(
      { to: "background", query: "UPDATE_EMAIL", data },
      (res) => console.log(res)
    );
  };

  const handleOnClickVerify = (data) => {
    const payload = { to: "background", query: "VERIFY_SINGLE_EMAIL", data };
    sentMessageToBackground(payload, (res) => console.log(res));
  };

  const handleApiTokenPopupOpen = () => {
    setApiTokenPopupOpen(true);
  };

  const handleApiTokenPopupSaveButton = (value) => {
    console.log(value);
    setApiTokenPopupOpen(false);
    setApiToken(value);
    getDataFromStorage().then((storageResponse) => {
      setDataInStorage({
        ...storageResponse,
        api_token: value,
      });
    });
  };

  const handleApiTokenPopupCancelButton = () => {
    tempTextAreaValue = apiToken;
    setApiTokenPopupOpen(false);
  };

  const handleBottomNavigationValue = (event, newValue) => {
    setBottomNavigationValue(newValue);
  };

  const apiTokenPopup = () => (
    <Dialog
      open={apiTokenPopupOpen}
      onClose={handleApiTokenPopupCancelButton}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Api Token</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Set api token to verify email address.{" "}
          <a href="https://app.mailrefine.com/login" target="_blank">
            Get Api key
          </a>
        </DialogContentText>
        <TextField
          id="outlined-multiline-static"
          multiline
          rows={4}
          defaultValue={apiToken}
          ref={domRef}
          onChange={(e) => (tempTextAreaValue = e.target.value)}
          variant="outlined"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => handleApiTokenPopupSaveButton(tempTextAreaValue)}
          color="primary"
        >
          Save
        </Button>
        <Button onClick={handleApiTokenPopupCancelButton} color="Secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  useEffect(() => {
    getCurrentTabUrl();
    getDataFromStorage().then((res) => {
      if (res) {
        setStorageData(res);
        setIsUpdating(res.is_emails_updating);
        if (res.api_token) setApiToken(res.api_token);
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
      {bottomNavigationValue === 1 && (
        <SavedProfilesTab
          handleOnClickVerify={handleOnClickVerify}
          handleApiTokenPopupOpen={handleApiTokenPopupOpen}
          apiToken={apiToken}
          apiTokenPopup={apiTokenPopup}
          storageData={
            storageData &&
            storageData.users_profile &&
            Object.entries(storageData.users_profile).reduce(
              (obj, profile) =>
                profile[1].email.length
                  ? { ...obj, [profile[0]]: profile[1] }
                  : obj,
              {}
            )
          }
        />
      )}
      {bottomNavigationValue === 0 && (
        <LinkedInTab
          isLoading={isLoading}
          isUpdating={isUpdating}
          isLinkedInTab={isLinkedInTab}
          usersProfile={usersProfile}
          unsavedUsersProfile={unsavedUsersProfile}
          handleOnClickUpdate={handleOnClickUpdate}
          handleOnClickRefresh={handleOnClickRefresh}
        />
      )}
      {bottomNavigationValue === 2 && (
        <SettingTab
          handleApiTokenPopupOpen={handleApiTokenPopupOpen}
          apiTokenPopup={apiTokenPopup}
        />
      )}
    </div>
  );
}

export default Home;

/* fetch(`https://app.mailrefine.com/api/v1/single-email-verify`, {
  method: "POST",
  headers: new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
  body: JSON.stringify({
    api_token:
      "0fo9P19dyhVpxVs9f3juecwa0Pclyd07ezlfKTVwg1uFeTy3ol6AGapGswmAZ57iVw11e6txShE8ojtIda8rDDoWsvyKeWwolWd3",
    email: "nadim.ice.nstu@gmail.com",
  }),
})
  .then((res) => res.json())
  .then((res) => console.log(res)); */

/* query params:
api_token=
email=

heeaders:
Accept: application/json
Content-Type: application/json */
