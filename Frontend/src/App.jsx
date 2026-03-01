import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ---------- Chat Component ----------
function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about UP policies." }
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [volume, setVolume] = useState(1);
  const [theme, setTheme] = useState("light");

  const recognitionRef = useRef(null);

  // Setup Speech Recognition
  if (!recognitionRef.current) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
    }
  }

  // 🎤 Start Listening
  const startListening = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-US";
    recognitionRef.current.start();

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
  };

  // 🔊 Speak Text
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, lang })
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.answer || "Sorry, I couldn't find an answer."
      };

      setMessages((prev) => [...prev, botMsg]);

      // 🔊 Auto speak reply
      speak(botMsg.text);

    } catch (err) {
      console.error("❌ Error talking to backend:", err);
      const errorMsg = {
        sender: "bot",
        text: "Server error. Please try again later."
      };
      setMessages((prev) => [...prev, errorMsg]);
      speak(errorMsg.text);
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        background: theme === "light" ? "#f5f7fa" : "#121212",
        color: theme === "light" ? "#000" : "#fff"
      }}
    >
      {/* Top Controls */}
      <div style={styles.topBar}>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          style={styles.toggleBtn}
        >
          {theme === "light" ? "🌙 Dark" : "☀ Light"}
        </button>

        <div style={styles.langBar}>
          <button
            onClick={() => setLang("en")}
            style={{
              ...styles.langBtn,
              background: lang === "en" ? "#4f46e5" : "#e5e7eb",
              color: lang === "en" ? "#fff" : "#000"
            }}
          >
            English
          </button>
          <button
            onClick={() => setLang("hi")}
            style={{
              ...styles.langBtn,
              background: lang === "hi" ? "#4f46e5" : "#e5e7eb",
              color: lang === "hi" ? "#fff" : "#000"
            }}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user"
                ? "#DCF8C6"
                : theme === "light"
                ? "#f1f1f1"
                : "#333"
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div style={styles.inputBox}>
        <button onClick={startListening} style={styles.micButton}>
          🎤
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === "hi"
              ? "हिंदी में अपना सवाल लिखें..."
              : "Type your question..."
          }
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>

      {/* Volume Control */}
      <div style={{ marginTop: "10px" }}>
        🔊 Volume
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ marginLeft: "10px" }}
        />
      </div>
    </div>
  );
}

// ---------- Full Page Wrapper ----------
function FullPageChat() {
  return (
    <div style={{ height: "100vh" }}>
      <Chat />
    </div>
  );
}

// ---------- App ----------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FullPageChat />} />
      </Routes>
    </BrowserRouter>
  );
}

// ---------- Styles ----------
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "10px"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  chatBox: {
    flex: 1,
    background: "#fff",
    borderRadius: "10px",
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  message: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "18px",
    marginBottom: "10px",
    fontSize: "14px"
  },
  inputBox: {
    display: "flex",
    marginTop: "10px"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none"
  },
  button: {
    marginLeft: "8px",
    padding: "10px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer"
  },
  micButton: {
    marginRight: "8px",
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer"
  },
  toggleBtn: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer"
  },
  langBar: {
    display: "flex",
    gap: "8px"
  },
  langBtn: {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px"
  }
};