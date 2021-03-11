import {
  LINKEDIN_APP_CLIENT_ID,
  LINKEDIN_APP_CLIENT_SECRET,
  PROJECT_NAME,
  REDIRECT_URI,
} from "./views/Popup/common/constant";
import {
  getDataFromStorage,
  setDataInStorage,
} from "./views/Popup/common/utils";

chrome.runtime.onConnect.addListener(function (port) {
  console.log("background");
  console.assert(port.name == "email-scrapper");
  port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.to === "content") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tabPort = chrome.tabs.connect(tabs[0].id, {
          name: "email-scrapper",
        });
        tabPort.postMessage(msg);
        tabPort.onMessage.addListener(function (response) {
          port.postMessage(response);
        });
      });
    } else if (msg.to === "background") {
      if (msg.query === "GET_ACCESS_TOKEN") {
        chrome.identity.launchWebAuthFlow(
          {
            url:
              "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=" +
              LINKEDIN_APP_CLIENT_ID +
              "&redirect_uri=" +
              REDIRECT_URI +
              "&state=" +
              PROJECT_NAME +
              "&scope=r_liteprofile%20r_emailaddress",
            interactive: true,
          },
          function (redirect_url) {
            let parser = document.createElement("a");
            parser.href = redirect_url;
            const urlParams = new URLSearchParams(parser.search);
            const code = urlParams.get("code");
            const state = urlParams.get("state");

            console.log("code: ", code);

            if (state === PROJECT_NAME && code) {
              fetch("https://www.linkedin.com/oauth/v2/accessToken", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body:
                  "grant_type=authorization_code&code=" +
                  code +
                  "&redirect_uri=" +
                  REDIRECT_URI +
                  "&client_id=" +
                  LINKEDIN_APP_CLIENT_ID +
                  "&client_secret=" +
                  LINKEDIN_APP_CLIENT_SECRET,
              })
                .then((res) => res.json())
                .then((res) => {
                  console.log(res);
                  if (res.access_token) {
                    getDataFromStorage().then((storageResponse) => {
                      let storageData = {};
                      if (storageResponse) {
                        storageData = {
                          ...storageResponse,
                          linkedin_access_token: res,
                        };
                      } else {
                        storageData = {
                          linkedin_access_token: res,
                        };
                      }
                      setDataInStorage(storageData);
                    });
                  }
                });
            } else if (state === PROJECT_NAME) {
              const error = urlParams.get("error");
              console.log(error);
              //if (error) port.postMessage({ error: "Authentication Error" });
            }
          }
        );
      }
    }
  });
});
