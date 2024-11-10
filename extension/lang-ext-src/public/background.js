const isTestingInstall = true;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || isTestingInstall) {
    chrome.tabs.create({ url: chrome.runtime.getURL("signup.html") });
  }
});
