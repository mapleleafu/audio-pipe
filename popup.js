document.getElementById("startBtn").addEventListener("click", async () => {
  console.log("here 3");
  // Get the active tab to stream
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('~ tab:', tab);

  chrome.runtime.sendMessage({
    type: "START_FROM_POPUP",
    tabId: tab.id,
  });
});
