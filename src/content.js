const scrapLinkedInConnection = (port) => {
  const scrapeData = [
    ...document.querySelectorAll("#main ul li[id^='ember']"),
  ].reduce((obj, user) => {
    let userProfileUrl = user.querySelector(
      "[data-control-name=connection_profile]"
    ).href;
    let userIdTmp = userProfileUrl.split("/");
    let userId = userProfileUrl.split("/")[userIdTmp.length - 2];

    let userProfileImage = user.querySelector("img").src;
    let userName = user.querySelector("img").title;
    let userOccupation = user.querySelector(".mn-connection-card__occupation")
      .innerText;
    return {
      ...obj,
      [userId]: {
        url: userProfileUrl,
        img: userProfileImage,
        name: userName,
        occ: userOccupation,
      },
    };
  }, {});
  console.log(scrapeData);
  port.postMessage(scrapeData);
};

chrome.runtime.onConnect.addListener(function (port) {
  console.log("content page");
  console.assert(port.name === "email-scrapper");
  port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.query === "GET_USER_DATA") {
      scrapLinkedInConnection(port);
    }
  });
});
