chrome.runtime.onConnect.addListener(function (port) {
  console.log("content page");
  console.assert(port.name == "email-scrapper");
  port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg === "GET_USER_DATA") {
      let scrapData = [
        ...document.querySelectorAll("#main ul li[id^='ember']"),
      ].reduce((obj, user) => {
        let userProfileUrl = user.querySelector(
          "[data-control-name=connection_profile]"
        ).href;
        let userIdTmp = userProfileUrl.split("/");
        let userId = userProfileUrl.split("/")[userIdTmp.length - 2];

        let userProfileImage = user.querySelector("img").src;
        let userName = user.querySelector("img").title;
        return {
          ...obj,
          [userId]: {
            url: userProfileUrl,
            img: userProfileImage,
            name: userName,
          },
        };
      }, {});
      //console.log(scrapData);
      port.postMessage(scrapData);
    }
  });
});
