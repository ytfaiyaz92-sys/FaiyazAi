const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const imageInput = document.getElementById("imageInput");
let voiceEnabled = false;

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  alert(`Voice ${voiceEnabled ? "Enabled" : "Disabled"}`);
}

function appendMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === "bot" && voiceEnabled) {
    const msg = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(msg);
  }
}

async function sendMessage() {
  const message = userInput.value;
  const file = imageInput.files[0];
  userInput.value = "";
  imageInput.value = "";

  appendMessage(message, "user");

  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const imageBase64 = reader.result;
      const analyzeRes = await fetch("https://faiyaz-ai.repl.co/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await analyzeRes.json();
      appendMessage("Image text: " + data.text, "bot");
    };
    reader.readAsDataURL(file);
    return;
  }

  const res = await fetch("https://faiyaz-ai.repl.co/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  appendMessage(data.reply || data.image, "bot");
}