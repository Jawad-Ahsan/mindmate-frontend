import { useParams } from "react-router-dom";
import ChatModule from "./ChatModule";
import JournalModule from "./JournalModule";
import ExercisesModule from "./ExercisesModule";
import ForumModule from "./ForumModule";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen, Heart, Users, MessageSquare } from "react-feather";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Dashboard = ({ darkMode, activeChatId, onSessionUpdate }) => {
  const { activeTab } = useParams();
  const [refreshSessions, setRefreshSessions] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        await axios.get(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}` },
          },
        );
      } catch (error) {
        // Silent error handling
      }
    };

    fetchUserData();
  }, []);

  const handleSessionUpdate = () => {
    setRefreshSessions((prev) => !prev);
    onSessionUpdate?.();
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case "chat":
        return (
          <ChatModule
            darkMode={darkMode}
            sessionId={activeChatId}
            onSessionUpdate={handleSessionUpdate}
          />
        );
      case "journal":
        return <JournalModule darkMode={darkMode} />;
      case "exercises":
        return <ExercisesModule darkMode={darkMode} />;
      case "forum":
        return <ForumModule darkMode={darkMode} />;
      default:
        return null;
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "chat":
        return <MessageSquare className="h-5 w-5" />;
      case "journal":
        return <BookOpen className="h-5 w-5" />;
      case "exercises":
        return <Heart className="h-5 w-5" />;
      case "forum":
        return <Users className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case "chat":
        return "AI Therapy Chat";
      case "journal":
        return "Mental Health Journal";
      case "exercises":
        return "Wellness Exercises";
      case "forum":
        return "Community Forum";
      default:
        return "";
    }
  };

  return (
    <div
      className={`h-full overflow-hidden ${
        darkMode 
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Enhanced Header with Tab Navigation */}
      <div className={`px-6 py-4 ${
        darkMode 
          ? "bg-gray-800/80 backdrop-blur-sm border-b border-gray-700" 
          : "bg-white/80 backdrop-blur-sm border-b border-gray-200"
      }`}>
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className={`p-2 rounded-lg ${
              darkMode 
                ? "bg-gradient-to-r from-indigo-500 to-purple-600" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}>
              <BookOpen className={`h-6 w-6 ${
                darkMode ? "text-white" : "text-white"
              }`} />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                MindMate Dashboard
              </h1>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Your mental wellness journey starts here
              </p>
            </div>
          </motion.div>

          {/* Tab Indicators */}
          <div className="flex items-center space-x-1">
            {["chat", "journal", "exercises", "forum"].map((tab) => (
              <motion.div
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab
                    ? darkMode
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : darkMode
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {getTabIcon(tab)}
                <span className="text-sm font-medium hidden sm:inline">
                  {getTabLabel(tab)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        {renderActiveModule()}
      </motion.div>
    </div>
  );
};

export default Dashboard;
