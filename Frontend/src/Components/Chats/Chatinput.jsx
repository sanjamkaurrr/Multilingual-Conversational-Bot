import { useState, useRef, useEffect, useCallback } from "react";

export default function Chatinput({ onSend, onMic, onStop, isListening, lang = "en" }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimer = useRef(null);

  const fetchSuggestions = useCallback(async (text) => {
  if (!text || text.trim().length < 2) {
    setSuggestions([]);
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/suggest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partial_question: text,
        lang: lang
      })
    });

    const data = await res.json();
    setSuggestions(data.suggestions || []);
  } catch (err) {
    console.error("❌ Suggest error:", err);
    setSuggestions([]);
  }
}, [lang]);

  // 🔥 Debounce effect
  useEffect(() => {
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }

  debounceTimer.current = setTimeout(() => {
    fetchSuggestions(input);
  }, 300);

  return () => clearTimeout(debounceTimer.current);
}, [input, fetchSuggestions]); // ✅ now included

  // 🎯 Suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  const handleMicClick = () => {
    if (isListening) onStop();
    else onMic(setInput);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input, () => setInput(""));
    setSuggestions([]); // 🔥 important
  };

  return (
    <div style={{ width: "100%" }}>
      
      {/* 🔥 BUBBLE SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div style={styles.suggestions}>
          {suggestions.map((s, i) => (
            <span
              key={i}
              style={styles.bubble}
              onClick={() => handleSuggestionClick(s)}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* INPUT AREA */}
      <div style={styles.inputContainer}>
        <button
          onClick={handleMicClick}
          style={isListening ? styles.micActive : styles.mic}
        >
          {isListening ? "🔴" : "🎤"}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={styles.input}
        />

        <button onClick={handleSend} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "6px",
    paddingLeft: "5px"
  },
  bubble: {
    background: "#c7d2fe",
    color: "#1e1b4b",
    border: "1px solid #818cf8",
    padding: "6px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "0.2s"
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    padding: "10px"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none"
  },
  sendBtn: {
    padding: "10px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer"
  },
  mic: {
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer"
  },
  micActive: {
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer"
  }
};
