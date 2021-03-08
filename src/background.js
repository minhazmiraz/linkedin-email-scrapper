chrome.runtime.onConnect.addListener(function (port) {
  console.log("background");
  console.assert(port.name == "email-scrapper");
  port.onMessage.addListener(function (msg) {
    console.log(msg);
    if (msg === "GET_USER_DATA") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tabPort = chrome.tabs.connect(tabs[0].id, {
          name: "email-scrapper",
        });
        tabPort.postMessage("GET_USER_DATA");
        tabPort.onMessage.addListener(function (response) {
          port.postMessage(response);
        });
      });
    }
  });
});
