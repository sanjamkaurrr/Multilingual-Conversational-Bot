import { useState, useRef, useEffect } from "react";
import Messagebubble from "./Messagebubble";
import Chatinput from "./Chatinput";
import useSpeechToText from "../speech/Speechtotext";
import useTextToSpeech from "../speech/Texttospeech";

import "../Styles/light.css";
import "../Styles/Dark.css";
import TextSizeControl from "../Accessibility/Textsizecontrol.jsx";

export default function Chatwindow() {
  console.log("🗣️ Chatwindow component rendered");

  // ---------------- STATE ----------------
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about UP policies." }
  ]);

  const [lang, setLang] = useState("en");

  const bottomRef = useRef(null);

  useEffect(() => {
    console.log("📜 Scrolling to bottom");
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SPEECH HOOKS ----------------
  const { startListening, stopListening, isListening } =
    useSpeechToText(lang);

  const { speak } =
    useTextToSpeech(lang);

  console.log("🎤 Speech hooks loaded:", {
    startListening,
    stopListening,
    isListening,
    speak
  });

  // ---------- MIC HANDLER ----------
  const handleMic = (setInput) => {
    console.log("🎤 Mic button clicked");

    if (isListening) {
      console.warn("⚠️ Mic already listening, ignoring start.");
      return;
    }

    startListening((transcript) => {
      console.log("📝 Speech captured:", transcript);
      setInput(transcript);
      console.log("⌨️ Input field updated with speech");
    });
  };

  // ---------- STOP MIC ----------
  const handleStopMic = () => {
    console.log("🛑 Stop mic requested");
    stopListening();
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async (input, clearInput) => {
    console.log("📤 Sending message:", input);

    if (!input.trim()) {
      console.warn("⚠️ Empty message ignored");
      return;
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input }
    ]);

    clearInput();

    try {
      console.log("🌐 Sending request to backend");

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, lang })
      });

      const data = await res.json();

      const reply =
        data.answer || "Sorry, I couldn't find an answer.";

      // Add bot message
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: reply }
      ]);

      // 🔊 Text to speech
      speak(reply);

    } catch (error) {
      console.error("❌ Error in sendMessage:", error);

      const errorMsg =
        "Server error. Please try again later.";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMsg }
      ]);

      speak(errorMsg);
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={containerStyle}>
      
      {/* Top Controls */}
      <div style={topBarStyle}>
        <div>
          <button
            onClick={() => setLang("en")}
            style={lang === "en" ? activeLangButtonStyle : langButtonStyle}
          >
            EN
          </button>

          <button
            onClick={() => setLang("hi")}
            style={lang === "hi" ? activeLangButtonStyle : langButtonStyle}
          >
            HI
          </button>
        </div>

        <TextSizeControl />
      </div>

      {/* Messages */}
      <div style={chatAreaStyle}>
        {messages.map((msg, index) => (
          <Messagebubble key={index} message={msg} />
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* 🔥 UPDATED INPUT */}
      <Chatinput
        onSend={sendMessage}
        onMic={handleMic}
        onStop={handleStopMic}
        isListening={isListening}
        lang={lang}   // ✅ IMPORTANT FIX
      />

    </div>
  );
}

// ---------------- STYLES ----------------

const containerStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "#0f172a",
  color: "#fff"
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px",
  borderBottom: "1px solid #334155"
};

const langButtonStyle = {
  padding: "8px 14px",
  marginRight: "8px",
  borderRadius: "999px",
  border: "1px solid #475569",
  background: "#e2e8f0",
  color: "#0f172a",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const activeLangButtonStyle = {
  ...langButtonStyle,
  background: "#0f172a",
  color: "#f8fafc",
  border: "1px solid #94a3b8",
  boxShadow: "0 0 0 2px rgba(148, 163, 184, 0.25)"
};

const chatAreaStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column"
};
