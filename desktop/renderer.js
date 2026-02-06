const signaling = new WebSocket("ws://localhost:8080");
const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

// Handle incoming audio stream
pc.ontrack = event => {
  const audioEl = document.getElementById("remote-audio");
  audioEl.srcObject = event.streams[0];
  audioEl.play();
  console.log("Receiving audio...");
};

// Handle ICE Candidates from the Extension
signaling.onmessage = async message => {
  const data = JSON.parse(message.data);

  if (data.type === "offer") {
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    signaling.send(JSON.stringify({ type: "answer", answer }));
  }

  if (data.type === "candidate") {
    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
};

// Send our ICE candidates to the Extension
pc.onicecandidate = event => {
  if (event.candidate) {
    signaling.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
  }
};
