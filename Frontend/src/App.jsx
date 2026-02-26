import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ---------- Chat Component ----------
function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about UP policies." }
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");

  const sendMessage = async () => {
    console.log("📨 Send clicked");
    if (!input.trim()) {
      console.log("⚠️ Empty input, not sending");
      return;
    }

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
    } catch (err) {
      console.error("❌ Error talking to backend:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error. Please try again later." }
      ]);
    }
  };

  return (
    <div style={styles.container}>
      {/* Language Switch */}
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

      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#DCF8C6" : "#f1f1f1"
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputBox}>
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

// ---------- App (Router) ----------
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
    justifyContent: "flex-start",
    alignItems: "center",
    background: "#f5f7fa",
    padding: "10px"
  },
  chatBox: {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
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
    fontSize: "14px",
    lineHeight: "1.4"
  },
  inputBox: {
    width: "100%",
    maxWidth: "100%",
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
  langBar: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "8px",
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