import React, { useState } from "react";
import axios from "axios";

function VoiceAssistant() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState("light");

  const typeEffect = (text, callback) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        callback((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    setIsListening(true);

    recognition.onresult = (event) => {
      const userQuery = event.results[0][0].transcript;
      setQuery(userQuery);
      setHistory((prev) => [...prev, { sender: "user", message: userQuery }]);
      handleResponse(userQuery);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleResponse = async (userQuery) => {
    setHistory((prev) => [...prev, { sender: "system", message: "Typing..." }]);
    try {
      let endpoint = "weather";
      if (userQuery.toLowerCase().includes("tomorrow")) {
        endpoint = "forecast";
      }

      const res = await axios.post(`https://weather-ai-agent-backend.onrender.com/${endpoint}`, { city: userQuery });
      const systemResponse = res.data.response;

      setHistory((prev) => prev.slice(0, -1));
      setHistory((prev) => [...prev, { sender: "system", message: "" }]);
      typeEffect(systemResponse, (typedMessage) => {
        setHistory((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1].message = typedMessage;
          return updatedHistory;
        });
      });

      speakResponse(systemResponse);
    } catch (error) {
      setHistory((prev) => prev.slice(0, -1));
      const errorMessage = error.response?.data?.detail || "Sorry, I couldn't process your request.";
      setHistory((prev) => [...prev, { sender: "system", message: errorMessage }]);
      speakResponse(errorMessage);
    }
  };

  const speakResponse = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const suggestions = ["Weather in New York", "Tomorrow's forecast for Tokyo", "Weekly forecast for Paris"];

  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: "500px",
        textAlign: "center",
        backgroundColor: theme === "light" ? "#ffffff" : "#333333",
        color: theme === "light" ? "#000000" : "#ffffff",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h1>Voice AI Weather Assistant</h1>
      <div
        style={{
          border: theme === "light" ? "1px solid #ccc" : "1px solid #555",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "20px",
          height: "300px",
          overflowY: "auto",
          backgroundColor: theme === "light" ? "#f9f9f9" : "#444",
        }}
      >
        {history.map((entry, index) => (
          <div
            key={index}
            style={{
              textAlign: entry.sender === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: entry.sender === "user" ? "#d1e7dd" : "#cfe2ff",
                color: "#000",
                borderRadius: "15px",
                padding: "15px",
                maxWidth: "80%",
                display: "inline-block",
              }}
            >
              <p style={{ margin: 0, color: entry.sender === "user" ? "#007bff" : "#495057" }}>
                {entry.sender === "user" ? "You" : "Assistant"}
              </p>
              <div style={{ marginTop: "5px", fontSize: "16px" }}>
                {typeof entry.message === "string" ? entry.message : JSON.stringify(entry.message)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <p>Suggestions:</p>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleResponse(s)}
            style={{
              margin: "5px",
              padding: "10px",
              backgroundColor: "#e7e7e7",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={handleVoiceInput}
        disabled={isListening}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isListening ? "Listening..." : "🎤 Speak"}
      </button>
      <button
        onClick={clearHistory}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginLeft: "10px",
        }}
      >
        Reset Chat
      </button>
      <button
        onClick={toggleTheme}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginLeft: "10px",
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
}

export default VoiceAssistant;

