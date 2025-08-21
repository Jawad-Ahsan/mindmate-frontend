import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Trash2, Star, Search } from "react-feather";
import axios from "axios";
import { format, isToday, isYesterday, parseISO } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Sidebar = ({
  darkMode,
  onHoverChange,
  activeChatId,
  setActiveChatId,
  refreshSessions,
}) => {
  const [hovered, setHovered] = useState(false);
  const [chatSessions, setChatSessions] = useState({
    pinned_sessions: [],
    other_sessions: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${API_URL}/api/chat/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChatSessions(response.data);

        // Set first session as active if none is selected
        const allSessions = [
          ...response.data.pinned_sessions,
          ...response.data.other_sessions,
        ];

        if (allSessions.length > 0 && !activeChatId && setActiveChatId) {
          setActiveChatId(allSessions[0].id);
        }
      } catch (err) {
        console.error("Error fetching chat sessions:", err);
        setError("Failed to load chat sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
  }, [activeChatId, refreshSessions]);

  const createNewChat = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/chat/sessions`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newSession = response.data;
      setChatSessions((prev) => ({
        ...prev,
        other_sessions: [newSession, ...prev.other_sessions],
      }));
      if (setActiveChatId) {
        setActiveChatId(newSession.id);
      }
    } catch (err) {
      console.error("Error creating new chat session:", err);
      setError("Failed to create new chat");
    }
  };

  const deleteChatSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/api/chat/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatSessions((prev) => ({
        pinned_sessions: prev.pinned_sessions.filter((s) => s.id !== sessionId),
        other_sessions: prev.other_sessions.filter((s) => s.id !== sessionId),
      }));

      // Handle active session if deleted
      if (activeChatId === sessionId) {
        const remainingSessions = [
          ...chatSessions.pinned_sessions,
          ...chatSessions.other_sessions,
        ].filter((s) => s.id !== sessionId);

        if (setActiveChatId) {
          setActiveChatId(remainingSessions[0]?.id || null);
        }
      }
    } catch (err) {
      console.error("Error deleting chat session:", err);
      setError("Failed to delete chat");
    }
  };

  const togglePinSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.patch(
        `${API_URL}/api/chat/sessions/${sessionId}/toggle-pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Manually update the UI to avoid refetching
      setChatSessions((prev) => ({
        pinned_sessions: prev.pinned_sessions.map((s) =>
          s.id === sessionId ? { ...s, is_pinned: !s.is_pinned } : s
        ),
        other_sessions: prev.other_sessions.map((s) =>
          s.id === sessionId ? { ...s, is_pinned: !s.is_pinned } : s
        ),
      }));
    } catch (err) {
      // Silent error - UI won't update if request fails
    }
  };

  const groupSessionsByDate = (sessions) => {
    const groups = {};
    sessions.forEach((session) => {
      const date = parseISO(session.updated_at);
      let groupName;
      if (isToday(date)) groupName = "Today";
      else if (isYesterday(date)) groupName = "Yesterday";
      else groupName = format(date, "MMMM yyyy");
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(session);
    });
    return groups;
  };

  const filterSessions = (sessions) => {
    return sessions.filter((session) =>
      session.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredPinned = filterSessions(chatSessions.pinned_sessions);
  const filteredOther = filterSessions(chatSessions.other_sessions);
  const groupedOtherSessions = groupSessionsByDate(filteredOther);

  if (loading) {
    return (
      <div
        className={`h-full flex items-center justify-center ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`h-full flex items-center justify-center p-4 ${
          darkMode ? "bg-gray-800 text-red-400" : "bg-white text-red-600"
        }`}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.aside
      initial={{ width: "72px" }}
      animate={{ width: hovered ? 240 : 72 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      onMouseEnter={() => {
        setHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverChange?.(false);
      }}
      className={`h-full flex flex-col ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border-r ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={createNewChat}
          className={`flex items-center justify-center w-full p-2 rounded-md ${
            darkMode
              ? "hover:bg-gray-700 text-gray-300"
              : "hover:bg-gray-100 text-gray-700"
          } transition-colors`}
          aria-label="New chat"
        >
          <Plus size={18} className="flex-shrink-0" />
          {hovered && <span className="ml-2 whitespace-nowrap">New Chat</span>}
        </button>
      </div>

      {/* Search Bar */}
      {hovered && (
        <div className="px-3 py-2">
          <div
            className={`relative rounded-md ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Search
              size={14}
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 pl-9 pr-3 bg-transparent focus:outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-gray-800 placeholder-gray-500"
              }`}
              aria-label="Search chats"
            />
          </div>
        </div>
      )}

      {/* Chat History */}
      <nav className="flex-1 overflow-y-auto py-2">
        {filteredPinned.length > 0 && hovered && (
          <div className="px-3 py-1">
            <h3
              className={`text-xs font-medium ${
                darkMode ? "text-gray-400" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              Pinned
            </h3>
          </div>
        )}

        {filteredPinned.length > 0 && (
          <div className="mb-4">
            {filteredPinned.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                hovered={hovered}
                darkMode={darkMode}
                isActive={activeChatId === session.id}
                onClick={() => setActiveChatId && setActiveChatId(session.id)}
                onDelete={(e) => deleteChatSession(session.id, e)}
                onTogglePin={(e) => togglePinSession(session.id, e)}
                isPinned={true}
              />
            ))}
          </div>
        )}

        {Object.entries(groupedOtherSessions).map(([groupName, sessions]) => (
          <div key={groupName}>
            {hovered && (
              <div className="px-3 py-1">
                <h3
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {groupName}
                </h3>
              </div>
            )}
            {sessions.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                hovered={hovered}
                darkMode={darkMode}
                isActive={activeChatId === session.id}
                onClick={() => setActiveChatId && setActiveChatId(session.id)}
                onDelete={(e) => deleteChatSession(session.id, e)}
                onTogglePin={(e) => togglePinSession(session.id, e)}
                isPinned={false}
              />
            ))}
          </div>
        ))}

        {filteredPinned.length === 0 && filteredOther.length === 0 && (
          <div
            className={`p-4 text-center ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {searchQuery ? "No matching chats" : "No chat sessions yet"}
          </div>
        )}
      </nav>
    </motion.aside>
  );
};

const ChatSessionItem = ({
  session,
  hovered,
  darkMode,
  isActive,
  onClick,
  onDelete,
  onTogglePin,
  isPinned,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 mx-2 my-1 rounded-md cursor-pointer ${
        isActive
          ? darkMode
            ? "bg-gray-700"
            : "bg-gray-200"
          : darkMode
          ? "hover:bg-gray-700"
          : "hover:bg-gray-100"
      } transition-colors`}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="flex items-center truncate">
        <MessageSquare size={16} className="flex-shrink-0" />
        {hovered && (
          <span className="ml-2 truncate">{session.title || "New Chat"}</span>
        )}
      </div>
      {hovered && (
        <div className="flex items-center space-x-1">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded-md ${
              isPinned
                ? darkMode
                  ? "text-yellow-400 hover:bg-gray-600"
                  : "text-yellow-500 hover:bg-gray-300"
                : darkMode
                ? "text-gray-500 hover:bg-gray-600 hover:text-gray-300"
                : "text-gray-400 hover:bg-gray-300 hover:text-gray-700"
            }`}
            aria-label={isPinned ? "Unpin chat" : "Pin chat"}
          >
            <Star size={14} fill={isPinned ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onDelete}
            className={`p-1 rounded-md ${
              darkMode
                ? "hover:bg-gray-600 text-gray-400"
                : "hover:bg-gray-300 text-gray-500"
            }`}
            aria-label="Delete chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
