import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mic, Send, MessageSquare, Clipboard } from "react-feather";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ChatModule = ({ darkMode, sessionId, onSessionUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const showSendButton = newMessage.trim() !== "";

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

      const fetchSessionMessages = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_URL}/api/chat/sessions/${sessionId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      if (error.response?.status === 404) {
        // Session not found, clear messages and show empty state
        setMessages([]);
        console.log("Chat session not found, starting fresh");
      } else {
        console.error("Error fetching session messages:", error);
        setMessages([]);
      }
    }
  };

    fetchSessionMessages();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startAssessment = async () => {
    if (!sessionId) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.post(
        `${API_URL}/api/chat/start-assessment`,
        {
          session_id: sessionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (data?.response) {
        // Add AI message about starting assessment
        const aiMsg = {
          id: Date.now(),
          text: data.response,
          sender: "ai",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setAssessmentStarted(true);
      }
    } catch (error) {
      console.error("Failed to start assessment:", error);
      // Add error message
      const errorMsg = {
        id: Date.now(),
        text: "Sorry, I couldn't start the assessment right now. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleSendMessage = async () => {
    if (!showSendButton || !sessionId) return;

    const userMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: userMsg.text,
          session_id: sessionId,
          is_first_message: messages.length === 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Only add AI message if we got a valid response
      if (data?.response) {
        const aiMsg = {
          id: Date.now() + 1,
          text: data.response,
          sender: "ai",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }

      if (messages.length === 0) {
        const title =
          userMsg.text.length > 30
            ? `${userMsg.text.substring(0, 30)}...`
            : userMsg.text;
        await axios.patch(
          `${API_URL}/api/chat/sessions/${sessionId}`,
          { title },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onSessionUpdate?.();
      }
    } catch (err) {
      // Only show error if it's a server error (500)
      if (err.response?.status === 500) {
        const aiMsg = {
          id: Date.now() + 1,
          text: "⚠️ Sorry, I ran into an error. Please try again.",
          sender: "ai",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col ${
        darkMode ? "bg-transparent" : "bg-transparent"
      }`}
    >
      <div
        className={`flex-1 overflow-y-auto p-6 space-y-4 ${
          darkMode ? "bg-transparent" : "bg-transparent"
        }`}
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center p-12 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}>
                <MessageSquare className={`h-10 w-10 ${
                  darkMode ? "text-indigo-400" : "text-indigo-500"
                }`} />
              </div>
              <p className="text-lg font-medium mb-2">Start a new conversation</p>
              <p className="text-sm opacity-75 mb-6">Share your thoughts with MindMate AI</p>
              
              {/* Assessment Start Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startAssessment}
                disabled={assessmentStarted}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  assessmentStarted
                    ? "bg-gray-400 cursor-not-allowed"
                    : darkMode
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                }`}
              >
                <Clipboard className="w-5 h-5" />
                <span>{assessmentStarted ? "Assessment Started" : "Start Mental Health Assessment"}</span>
              </motion.button>
              
              {assessmentStarted && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm mt-3 text-green-500"
                >
                  Assessment started! The AI will now guide you through a comprehensive evaluation.
                </motion.p>
              )}
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl break-words shadow-lg backdrop-blur-sm
                ${
                  m.sender === "user"
                    ? darkMode
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white self-end rounded-2xl rounded-br-md"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white self-end rounded-2xl rounded-br-md"
                    : darkMode
                    ? "bg-gray-800/80 border border-gray-700 text-gray-200 rounded-2xl rounded-bl-md"
                    : "bg-white/80 border border-gray-200 text-gray-800 rounded-2xl rounded-bl-md"
                } p-4`}
            >
              {m.text}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`p-3 text-sm italic ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              MindMate is typing…
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div
        className={`p-6 ${darkMode ? "bg-gray-800/80 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"} border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center ${
              darkMode
                ? "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-300"
                : "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-600"
            }`}
          >
            <Plus size={20} />
          </motion.button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message…"
            className={`flex-1 px-6 py-3 rounded-2xl border-2 transition-all duration-200 ${
              darkMode
                ? "bg-gray-700/80 text-white placeholder-gray-400 border-gray-600 focus:border-blue-400"
                : "bg-gray-100/80 text-gray-800 placeholder-gray-500 border-gray-300 focus:border-blue-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-400/20`}
          />

          <div className="relative w-12 h-12 flex-shrink-0">
            <AnimatePresence>
              {showSendButton ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  className={`absolute inset-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    darkMode
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  } text-white shadow-lg`}
                >
                  <Send size={18} />
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute inset-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    darkMode
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
                  } text-gray-600`}
                >
                  <Mic size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModule;
