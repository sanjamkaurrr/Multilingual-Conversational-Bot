import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chatwindow from "./Components/Chats/Chatwindow";

// ---------- App ----------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chatwindow />} />
      </Routes>
    </BrowserRouter>
  );
}
