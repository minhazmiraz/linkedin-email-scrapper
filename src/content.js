import {
  LINKEDIN_ALL_SEARCH_URL,
  LINKEDIN_CONNECTION_URL,
  LINKEDIN_PEOPLE_SEARCH_URL,
} from "./views/Popup/common/constant";

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

const scrapBasicProfileDataFromSearch = (profiles) => {
  return profiles.reduce((obj, user) => {
    let userProfileUrl = user.querySelector(
      "li .entity-result__content .entity-result__title a"
    ).href;
    if (userProfileUrl.slice(-1) !== "/") userProfileUrl += "/";
    let userIdTmp = userProfileUrl.split("/");
    let userId = userProfileUrl.split("/")[userIdTmp.length - 2];

    let userProfileImage = user.querySelector("li .entity-result__image img")
      .src;
    let userName = user.querySelector("li .entity-result__image img").alt;
    let userOccupation = user.querySelector(
      "li .entity-result__content .entity-result__primary-subtitle"
    ).innerText;
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
};

const scrapLinkedInAllSearch = (port) => {
  const ulElements = [
    ...document.querySelectorAll(
      "#main section.search-results__cluster-title-bar"
    ),
  ]
    .filter(
      (section) =>
        section.innerText === "People" || section.innerText === "More people"
    )
    .reduce(
      (liElem, section) => [
        ...liElem,
        ...section.nextElementSibling.querySelectorAll("li"),
      ],
      []
    );

  console.log("Ul: ", ulElements);

  const scrapeData = scrapBasicProfileDataFromSearch(ulElements);
  console.log(scrapeData);
  port.postMessage(scrapeData);
};

const scrapLinkedInPeopleSearch = (port) => {
  const ulElements = [...document.querySelectorAll("#main ul li")];

  console.log("Ul: ", ulElements);

  const scrapeData = scrapBasicProfileDataFromSearch(ulElements);
  console.log(scrapeData);
  port.postMessage(scrapeData);
};

chrome.runtime.onConnect.addListener(function (port) {
  console.log("content page");
  console.assert(port.name === "email-scrapper");
  port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg.query === "GET_USER_DATA") {
      const URL = document.location.href;
      if (URL.indexOf(LINKEDIN_CONNECTION_URL) !== -1) {
        scrapLinkedInConnection(port);
      } else if (URL.indexOf(LINKEDIN_ALL_SEARCH_URL) !== -1) {
        scrapLinkedInAllSearch(port);
      } else if (URL.indexOf(LINKEDIN_PEOPLE_SEARCH_URL) !== -1) {
        scrapLinkedInPeopleSearch(port);
      }
    }
  });
});
