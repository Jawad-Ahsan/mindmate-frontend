import { useParams } from "react-router-dom";
import ChatModule from "./ChatModule";
import JournalModule from "./JournalModule";
import ExercisesModule from "./ExercisesModule";
import ForumModule from "./ForumModule";
import { useEffect, useState } from "react";
import axios from "axios";
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

  return (
    <div
      className={`h-full overflow-hidden ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {renderActiveModule()}
    </div>
  );
};

export default Dashboard;
