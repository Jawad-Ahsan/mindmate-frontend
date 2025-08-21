import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mic, Send } from "react-feather";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ChatModule = ({ darkMode, sessionId, onSessionUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
        setMessages([]);
      }
    };

    fetchSessionMessages();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center p-8 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <p>Start a new conversation with MindMate</p>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl break-words shadow
                ${
                  m.sender === "user"
                    ? darkMode
                      ? "bg-blue-600 text-white self-end rounded-l-lg rounded-br-lg"
                      : "bg-blue-500 text-white self-end rounded-l-lg rounded-br-lg"
                    : darkMode
                    ? "bg-gray-800 text-gray-200 rounded-r-lg rounded-bl-lg"
                    : "bg-white text-gray-800 rounded-r-lg rounded-bl-lg"
                } p-3`}
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
        className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"} border-t ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-600"
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
            className={`flex-1 px-4 py-2.5 rounded-full ${
              darkMode
                ? "bg-gray-700 text-white placeholder-gray-400"
                : "bg-gray-100 text-gray-800 placeholder-gray-500"
            } focus:outline-none focus:ring-2 ${
              darkMode ? "focus:ring-blue-500" : "focus:ring-blue-400"
            }`}
          />

          <div className="relative w-10 h-10 flex-shrink-0">
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
                  className={`absolute inset-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
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
                  className={`absolute inset-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                  }`}
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
