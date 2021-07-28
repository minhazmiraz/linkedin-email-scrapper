import firebase from "firebase/app";
import "firebase/firestore";

import { PROJECT_NAME } from "./views/Popup/common/constant";
import { getDataFromStorage, setDataInStorage } from "./views/Popup/common/utils";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
	apiKey: "AIzaSyCkBKSKd0nj0gq6ry9harrlJ39Hx1Ck5Bo",
	authDomain: "linkedin-email-scrapper.firebaseapp.com",
	projectId: "linkedin-email-scrapper",
	storageBucket: "linkedin-email-scrapper.appspot.com",
	messagingSenderId: "693677220719",
	appId: "1:693677220719:web:90f9a6e75b2c4be5c53e9a",
	measurementId: "G-8KR97ZLKM8",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const collectionName = "linkedin-email-scrapper";

let firebaseStore = firebase.firestore();
let rootCollection = firebaseStore.collection(collectionName);

const createNotification = (notificationId, notificationData) => {
	chrome.notifications.create(notificationId, notificationData, (notiId) =>
		console.log("Linkedin Email Scrapper Notification Created")
	);
};

/* chrome.alarms.create("test-alarm", {
	when: Date.now() + 1 * 60000,
	periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener((alarm) => {
	console.log(alarm);
	createNotification("test alarm", {
		title: "test alarm",
		type: "basic",
		message: "test alarm",
		iconUrl: "/logo.png",
	});
}); */

const detectEmailUsingRegex = (res, user) => {
	if (!res) {
		return console.log(user[0], " response failed") || null;
	}

	let jsonStr = res.match(
		/(\n)(.*)com.linkedin.voyager.identity.profile.ProfileContactInfo(.*)(\n)/
	);
	//console.log(jsonStr);

	if (!jsonStr) {
		return console.log(user[0], " regex failed") || null;
	}

	jsonStr = jsonStr[0];

	if (!jsonStr) {
		return console.log(user[0], " regex str failed") || null;
	}

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
				let emailAddress = detectEmailUsingRegex(res, user);
				if (!emailAddress) {
					emailAddress = "";
				}

				const userId = user[0];

				//get from storage
				Promise.all([getDataFromStorage(), rootCollection.doc(userId).get()]).then(
					(values) => {
						let [storageResponse, firebaseDoc] = values;

						if (firebaseDoc.exists && emailAddress === "") {
							emailAddress = firebaseDoc.data().email;
						}

						storageResponse = {
							...storageResponse,
							users_profile: {
								...storageResponse?.users_profile,
								[userId]: { ...user[1], email: emailAddress },
							},
						};

						console.log(storageResponse);

						Promise.all([
							setDataInStorage(storageResponse),
							rootCollection.doc(userId).set({ email: emailAddress }),
						]).then((values) => {
							let [storageResponse, firebaseResponse] = values;

							console.log("calling new fetch", position, usersProfile);
							if (position + 1 < usersProfile.length) {
								//Fetch next email
								fetchEmail(position + 1, usersProfile);
							} else {
								getDataFromStorage().then((storageResponse) => {
									setDataInStorage({
										...storageResponse,
										is_emails_updating: false,
									}).then((res) => {
										createNotification(PROJECT_NAME, {
											title: "Linkedin Email Scrapper",
											type: "basic",
											message:
												"Email fetching is completed. For checking emails, open Mail-Refine chrome extension and goto saved tab.",
											iconUrl: "/logo.png",
										});
									});
								});
							}
						});
					}
				);
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
						}).then((res) => {
							createNotification(PROJECT_NAME, {
								title: "Linkedin Email Scrapper",
								type: "basic",
								message:
									"Email fetching is completed. For checking emails, open Mail-Refine chrome extension and goto saved tab.",
								iconUrl: "/logo.png",
							});
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
