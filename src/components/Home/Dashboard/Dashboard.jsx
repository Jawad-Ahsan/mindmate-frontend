import { useParams } from "react-router-dom";
import ChatModule from "./ChatModule";
import JournalModule from "./JournalModule";
import ExercisesModule from "./ExercisesModule";
import ForumModule from "./ForumModule";
import SpecialistModule from "./SpecialistModule";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen, Heart, Users, MessageSquare, UserCheck } from "react-feather";

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
      case "specialists":
        return <SpecialistModule darkMode={darkMode} />;
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
      case "specialists":
        return <UserCheck className="h-5 w-5" />;
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
      case "specialists":
        return "Find Specialist";
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
