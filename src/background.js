import {
  getDataFromStorage,
  setDataInStorage,
} from "./views/Popup/common/utils";

const msgToContent = (port, msg) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tabPort = chrome.tabs.connect(tabs[0].id, {
      name: "email-scrapper",
    });
    tabPort.postMessage(msg);
    tabPort.onMessage.addListener(function (response) {
      port.postMessage(response);
    });
  });
};

//TODO: fetch dependency
const msgToBackground = (port, msg) => {
  if (msg.query === "UPDATE_EMAIL") {
    Object.entries(msg.data).forEach((user) => {
      setTimeout(() => {
        fetch(user[1].url + "detail/contact-info/")
          .then((res) => res.text())
          .then((res) => {
            if (!res) return console.log(user[0], " response failed");
            let jsonStr = res.match(
              /(\n)(.*)&quot;emailAddress&quot;:&quot;(.*)(\n)/
            );
            //console.log(jsonStr);
            if (!jsonStr) return console.log(user[0], " regex failed");
            jsonStr = jsonStr[0];
            if (!jsonStr) return console.log(user[0], " regex str failed");
            let tempText = document.createElement("textarea");
            tempText.innerHTML = jsonStr;
            const emailAddress = JSON.parse(tempText.value).data.emailAddress;
            const userId = user[0];

            getDataFromStorage().then((storageResponse) => {
              let storageData = {};
              let usersProfile = {};

              if (storageResponse) storageData = { ...storageResponse };
              if (storageResponse && storageResponse.users_profile) {
                usersProfile = {
                  ...storageResponse.users_profile,
                };
              }

              usersProfile = {
                ...usersProfile,
                [userId]: emailAddress,
              };

              storageData = {
                ...storageData,
                users_profile: usersProfile,
              };

              console.log(storageData);
              setDataInStorage(storageData);
            });
          })
          .catch((err) => console.log(err));
      }, 1500);
    });
    port.postMessage({ message: "message received" });
  }
};

chrome.runtime.onConnect.addListener(function (port) {
  console.log("background");
  console.assert(port.name === "email-scrapper");
  port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.to === "content") {
      msgToContent(port, msg);
    } else if (msg.to === "background") {
      msgToBackground(port, msg);
    }
  });
});
