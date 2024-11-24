const isTestingInstall = true;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || isTestingInstall) {
    chrome.tabs.create({ url: chrome.runtime.getURL("signup.html") });
    chrome.storage.local.set({
      enabled: true,
      language: "es",
      frequency: 1,
      difficulty: 1,
      onDevice : true
  });
  }
});
