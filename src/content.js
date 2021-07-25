import {
	LINKEDIN_ALL_SEARCH_URL,
	LINKEDIN_CONNECTION_URL,
	LINKEDIN_PEOPLE_SEARCH_URL,
} from "./views/Popup/common/constant";

const scrapLinkedInConnection = (port) => {
	const scrapeData = [...document.querySelectorAll("#main ul li")].reduce((obj, user) => {
		let userProfileUrl = user.querySelector("a").href;
		let userIdTmp = userProfileUrl.split("/");
		let userId = userProfileUrl.split("/")[userIdTmp.length - 2];

		let userProfileImage = user.querySelector("img").src;
		let userName = user.querySelector("img").alt;
		let userOccupation = user.querySelector(".mn-connection-card__occupation").innerText;
		return {
			...obj,
			[userId]: {
				id: userId,
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
		let userProfileUrl = user.querySelector(".entity-result__content a")?.href;
		if (userProfileUrl && userProfileUrl.indexOf("https://www.linkedin.com/in" !== -1)) {
			if (userProfileUrl.slice(-1) !== "/") userProfileUrl += "/";
		} else {
			return obj;
		}
		let userIdTmp = userProfileUrl.split("/");
		let userId = userProfileUrl.split("/")[userIdTmp.length - 2];

		let userProfileImage = user.querySelector("img")?.src;
		let userName = user.querySelector(
			".entity-result__title-text [aria-hidden=true]"
		)?.innerText;
		let userOccupation = user.querySelector(
			".entity-result__content .entity-result__primary-subtitle"
		)?.innerText;

		if (userProfileUrl && userName && userOccupation)
			return {
				...obj,
				[userId]: {
					id: userId,
					url: userProfileUrl,
					img: userProfileImage,
					name: userName,
					occ: userOccupation,
				},
			};
		else return obj;
	}, {});
};

const scrapLinkedInAllSearch = (port) => {
	const ulElements = [...document.querySelectorAll("#main ul li")];

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
