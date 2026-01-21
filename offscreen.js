function debugLog(...args) {
  console.log(...args);
  const serializedArgs = args.map(arg => {
    if (arg instanceof MediaStream) return `[MediaStream: ${arg.id}, active: ${arg.active}]`;
    if (arg instanceof AudioContext) return `[AudioContext: ${arg.state}]`;
    if (arg instanceof MediaStreamAudioSourceNode) return `[MediaStreamAudioSourceNode]`;
    return arg;
  });
  chrome.runtime.sendMessage({ type: "LOG", data: serializedArgs });
}

debugLog("Offscreen script loaded");
chrome.runtime.sendMessage({ type: "OFFSCREEN_LOADED" });

let mediaStream;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  debugLog("here 2");
  
  if (message.type === "STOP_CAPTURE") {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    sendResponse("CAPTURE_STOPPED");
    return;
  }

  if (message.type !== "START_CAPTURE") return;

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: message.streamId,
      },
    },
    video: false,
  });

  debugLog('~ stream:', mediaStream);

  // Audio Context to keep the stream alive (Chrome kills silent streams)
  const audioContext = new AudioContext();
  debugLog('~ audioContext:', audioContext);
  const source = audioContext.createMediaStreamSource(mediaStream);
  debugLog('~ source:', source);
  
  source.connect(audioContext.destination);

  debugLog("Audio captured:", mediaStream);

  // initWebRTC(stream);
});
