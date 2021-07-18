import { PROJECT_NAME } from "./views/Popup/common/constant";
import { getDataFromStorage, setDataInStorage } from "./views/Popup/common/utils";

const detectEmailUsingRegex = (res, user) => {
	if (!res) return console.log(user[0], " response failed") || null;
	let jsonStr = res.match(
		/(\n)(.*)com.linkedin.voyager.identity.profile.ProfileContactInfo(.*)(\n)/
	);
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
				let emailAddress = detectEmailUsingRegex(res, user);
				if (!emailAddress) emailAddress = "";

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
								}).then((res) => {
									chrome.notifications.create(
										PROJECT_NAME,
										{
											title: "Linkedin Email Scrapper",
											type: "basic",
											message:
												"Email fetching is completed. For checking emails, open Mail-Refine chrome extension and goto saved tab.",
											iconUrl: "/logo.png",
										},
										(notiId) =>
											console.log(
												"Linkedin Email Scrapper Notification Created"
											)
									);
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

const verifyEmail = (position, usersProfile, apiToken) => {
	let user = usersProfile[position];
	console.log(user);
	setTimeout(() => {
		fetch(`https://app.mailrefine.com/api/v1/single-email-verify`, {
			method: "POST",
			headers: new Headers({
				Accept: "application/json",
				"Content-Type": "application/json",
			}),
			body: JSON.stringify({
				api_token: apiToken,
				email: user[1].email,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				console.log("response: ", res);

				getDataFromStorage().then((storageResponse) => {
					if (res.code === 200 && res.status === "valid") {
						setDataInStorage({
							...storageResponse,
							users_profile: {
								...storageResponse.users_profile,
								[user[0]]: {
									...user[1],
									email_verified: true,
									is_email_verifying: false,
								},
							},
							is_emails_verifying: false,
						});
					} else {
						setDataInStorage({
							...storageResponse,
							users_profile: {
								...storageResponse.users_profile,
								[user[0]]: {
									...user[1],
									email_verified: false,
									is_email_verifying: false,
								},
							},
							is_emails_verifying: false,
						});
					}
				});
			})
			.catch((err) => {
				console.log(err);
				if (position + 1 < usersProfile.length) {
					verifyEmail(position + 1, usersProfile, apiToken);
				} else {
					getDataFromStorage().then((storageResponse) => {
						setDataInStorage({
							...storageResponse,
							users_profile: {
								...storageResponse.users_profile,
								[user[0]]: {
									...user[1],
									is_email_verifying: false,
								},
							},
							is_emails_verifying: false,
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
	} else if (msg.query === "UPDATE_SINGLE_EMAIL") {
	} else if (msg.query === "VERIFY_SINGLE_EMAIL") {
		port.postMessage({ message: "message received" });
		getDataFromStorage().then((storageResponse) => {
			if (!storageResponse || storageResponse.api_token) {
				console.log(storageResponse);
				setDataInStorage({
					...storageResponse,
					users_profile: {
						...storageResponse.users_profile,
						[msg.data.id]: {
							...msg.data,
							is_email_verifying: true,
						},
					},
					is_emails_verifying: true,
				}).then((res) => {
					verifyEmail(0, [[msg.data.id, msg.data]], storageResponse.api_token);
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
