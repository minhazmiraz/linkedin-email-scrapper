import {
  getDataFromStorage,
  setDataInStorage,
} from "./views/Popup/common/utils";

const detectEmailUsingRegex = (res, user) => {
  if (!res) return console.log(user[0], " response failed") || null;
  let jsonStr = res.match(/(\n)(.*)&quot;emailAddress&quot;:&quot;(.*)(\n)/);
  //console.log(jsonStr);
  if (!jsonStr) return console.log(user[0], " regex failed") || null;
  jsonStr = jsonStr[0];
  if (!jsonStr) return console.log(user[0], " regex str failed") || null;
  let tempText = document.createElement("textarea");
  tempText.innerHTML = jsonStr;
  return JSON.parse(tempText.value).data.emailAddress;
};

const fetchEmail = (position, usersProfile) => {
  let user = usersProfile[position];
  setTimeout(() => {
    fetch(user[1].url + "detail/contact-info/")
      .then((res) => res.text())
      .then((res) => {
        const emailAddress = detectEmailUsingRegex(res, user);
        const userId = user[0];

        //Save to storage
        getDataFromStorage().then((storageResponse) => {
          let storageData = {};
          let users_profile = {};

          if (storageResponse) storageData = { ...storageResponse };
          if (storageResponse && storageResponse.users_profile) {
            users_profile = {
              ...storageResponse.users_profile,
            };
          }

          storageData = {
            ...storageData,
            users_profile: {
              ...users_profile,
              [userId]: { ...user[1], email: emailAddress },
            },
          };

          console.log(storageData);
          setDataInStorage(storageData).then((res) => {
            console.log("calling new fetch", position, usersProfile);
            if (position + 1 < usersProfile.length) {
              //Fetch next email
              fetchEmail(position + 1, usersProfile);
            } else {
              //toggle update flag
              getDataFromStorage().then((storageResponse) => {
                setDataInStorage({
                  ...storageResponse,
                  is_emails_updating: false,
                });
              });
            }
          });
        });
      })
      .catch((err) => {
        console.log(err);
        if (position + 1 < usersProfile.length) {
          fetchEmail(position + 1, usersProfile);
        } else {
          getDataFromStorage().then((storageResponse) => {
            setDataInStorage({
              ...storageResponse,
              is_emails_updating: false,
            });
          });
        }
      });
  }, 500);
};

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

const msgToBackground = (port, msg) => {
  if (msg.query === "UPDATE_EMAIL") {
    port.postMessage({ message: "message received" });
    getDataFromStorage().then((storageResponse) => {
      if (!storageResponse || !storageResponse.is_emails_updating) {
        setDataInStorage({
          ...storageResponse,
          is_emails_updating: true,
        }).then((res) => {
          fetchEmail(0, Object.entries(msg.data));
        });
      }
    });
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
