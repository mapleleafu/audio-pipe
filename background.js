let offscreenReadyResolve;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("here 1");
  
  if (message.type === "LOG") {
    console.log("OFFSCREEN LOG:", ...message.data);
  }
  
  if (message.type === "OFFSCREEN_LOADED") {
    if (offscreenReadyResolve) {
      offscreenReadyResolve();
      offscreenReadyResolve = null;
    }
  }

  if (message.type === "START_FROM_POPUP") {
    if (await chrome.offscreen.hasDocument()) {
      console.log("Offscreen exists, stopping existing capture...");
      await chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    }

    try {
      const streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: message.tabId,
      });

      await createOffscreen();

      chrome.runtime.sendMessage({
        type: "START_CAPTURE",
        streamId: streamId,
      });
    } catch (e) {
      console.error("Error getting stream ID:", e);
    }
  }
});

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;

  const offscreenReadyPromise = new Promise(resolve => offscreenReadyResolve = resolve);

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Capture tab audio for WebRTC streaming",
  });

  await offscreenReadyPromise;
}
