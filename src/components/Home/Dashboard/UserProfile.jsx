// src/components/Home/Dashboard/UserProfile.jsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Target,
  Activity,
  Shield,
  LogOut,
} from "react-feather";

// Mock user data - in a real app, this would come from an API
const mockUser = {
  name: "Alex Doe",
  email: "alex.doe@example.com",
  joinDate: "2023-01-15T10:30:00Z",
  profilePicUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  goals: ["Manage Anxiety", "Improve Sleep", "Practice Mindfulness"],
  recentActivity: [
    {
      id: 1,
      type: "Session",
      description: "Completed a 10-min guided meditation",
      date: "2023-10-26",
    },
    {
      id: 2,
      type: "Journal",
      description: "Wrote a new journal entry",
      date: "2023-10-25",
    },
    {
      id: 3,
      type: "Check-in",
      description: "Completed daily mood check-in",
      date: "2023-10-25",
    },
  ],
};

const UserProfile = ({ darkMode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => setUser(mockUser), 500);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (!user) {
    return (
      <div
        className={`h-full flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50"
        }`}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`h-full overflow-y-auto p-4 sm:p-6 md:p-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Sidebar */}
        <motion.aside variants={itemVariants} className="lg:col-span-1">
          <div
            className={`p-6 rounded-xl shadow-md text-center ${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white"
            }`}
          >
            <img
              src={user.profilePicUrl}
              alt="User profile"
              className="w-28 h-28 rounded-full mx-auto border-4 border-blue-500"
            />
            <h2
              className={`mt-4 text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {user.name}
            </h2>
            <div
              className={`mt-2 text-sm flex items-center justify-center gap-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
            <div
              className={`mt-1 text-sm flex items-center justify-center gap-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Calendar size={14} />
              <span>
                Member since {new Date(user.joinDate).toLocaleDateString()}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              <Edit2 size={16} /> Edit Profile
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="lg:col-span-2 space-y-6">
          <motion.div
            variants={itemVariants}
            className={`p-6 rounded-xl shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-semibold flex items-center gap-2 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              <Target size={20} /> My Wellness Goals
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.goals.map((goal, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode
                      ? "bg-gray-700 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {goal}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`p-6 rounded-xl shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-semibold flex items-center gap-2 ${
                darkMode ? "text-teal-400" : "text-teal-600"
              }`}
            >
              <Activity size={20} /> Recent Activity
            </h3>
            <ul className="mt-4 space-y-4">
              {user.recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">
                      {activity.type === "Session" ? "🧘" : "📝"}
                    </span>
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {activity.description}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`p-6 rounded-xl border-l-4 ${
              darkMode
                ? "bg-gray-800 border-yellow-500"
                : "bg-white border-yellow-400"
            }`}
          >
            <h3
              className={`text-xl font-semibold flex items-center gap-2 ${
                darkMode ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              <Shield size={20} /> Emergency Support
            </h3>
            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              If you are in a crisis or any other person may be in danger,
              please don't use this site. These resources can provide you with
              immediate help.
            </p>
            <a
              href="/emergency-resources"
              className="mt-4 inline-block text-sm font-bold text-blue-500 hover:underline"
            >
              Find Help Now
            </a>
          </motion.div>
        </main>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
