import { PROJECT_NAME } from "./constant";

export const isAuthenticated = (storageData) => {
  console.log(storageData, storageData["linkedin_access_token"]);
  return storageData && storageData["linkedin_access_token"];
};

export const sentMessageToBackground = (payload, responseCB) => {
  let port = chrome.runtime.connect({ name: "email-scrapper" });
  port.postMessage(payload);
  port.onMessage.addListener(responseCB);
};

export const getDataFromStorage = () => {
  const key = PROJECT_NAME;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (res) => {
      if (!res[key]) resolve(null);
      else {
        resolve(res[key]);
      }
    });
  });
};

export const setDataInStorage = (value) => {
  const key = PROJECT_NAME;
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, (res) => {
      console.log("Value set ", value);
      resolve(null);
    });
  });
};

export const addStorageChangeListener = (listener) => {
  chrome.storage.onChanged.addListener(listener);
};

export const removeStorageChangeListener = (listener) => {
  chrome.storage.onChanged.removeListener(listener);
};

export const exportAsCSV = (csvContent) => {
  let encodedUri =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", PROJECT_NAME + "_profile_data.csv");
  document.body.appendChild(link);

  link.click();
};
