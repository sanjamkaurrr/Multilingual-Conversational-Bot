import { useState } from "react";
import { sendMessage } from "src/Components/services/Chatservice";

export default function useChat() {
  const [messages, setMessages] = useState([]);

  const handleSend = async (text) => {
    const userMessage = { sender: "user", text };
    setMessages(prev => [...prev, userMessage]);

    const data = await sendMessage(text);

    const botMessage = { sender: "bot", text: data.reply };
    setMessages(prev => [...prev, botMessage]);
  };

  return { messages, handleSend };
}