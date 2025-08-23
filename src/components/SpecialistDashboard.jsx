import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  LogOut,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  MessageSquare,
  FileText,
  Settings,
  Sun,
  Moon,
  BarChart
} from "react-feather";
import { Modal } from "./Modal";
import ForumModule from "./Home/Dashboard/ForumModule";
import SpecialistAppointmentsModule from "./SpecialistAppointmentsModule";

const SpecialistDashboard = () => {
  const [specialistInfo, setSpecialistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [hoveredTab, setHoveredTab] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  // Check if user is specialist and get specialist info
  useEffect(() => {
    const checkSpecialistAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user_type !== "specialist") {
          navigate("/login");
          return;
        }

        // Check if specialist is approved
        if (response.data.approval_status !== "approved") {
          setError("Your account is pending approval. Please wait for admin approval.");
          setLoading(false);
          return;
        }

        setSpecialistInfo(response.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSpecialistAuth();
  }, [navigate, API_URL]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  const tabs = [
    { id: "overview", icon: <BarChart size={20} />, label: "Overview" },
    { id: "appointments", icon: <Calendar size={20} />, label: "Appointments" },
    { id: "my-patients", icon: <User size={20} />, label: "My Patients" },
    { id: "sessions", icon: <MessageSquare size={20} />, label: "Sessions" },
    { id: "forum", icon: <Users size={20} />, label: "Forum" },
  ];

  const renderActiveModule = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewModule darkMode={darkMode} specialistInfo={specialistInfo} />;
      case "appointments":
        return <SpecialistAppointmentsModule darkMode={darkMode} />;
      case "my-patients":
        return <MyPatientsModule darkMode={darkMode} />;
      case "sessions":
        return <SessionsModule darkMode={darkMode} />;
      case "forum":
        return <ForumModule darkMode={darkMode} />;
      default:
        return <OverviewModule darkMode={darkMode} specialistInfo={specialistInfo} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading specialist dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Account Pending Approval</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleLogoutConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* Top Navigation */}
      <header
        className={`sticky top-0 z-50 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md py-4 px-6 flex justify-between items-center`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
            M
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            MindMate
          </h1>
        </motion.div>

        <div className="flex items-center space-x-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="relative"
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-full transition-colors ${
                  activeTab === tab.id
                    ? darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.icon}
              </button>

              {hoveredTab === tab.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 rounded text-xs font-medium ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {tab.label}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 text-yellow-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                {specialistInfo?.first_name?.charAt(0) || "S"}
              </div>
            </button>

            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
                  darkMode ? "bg-gray-700" : "bg-white"
                } ring-1 ring-black ring-opacity-5`}
              >
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                    darkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                    darkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </button>
                <hr className={`my-1 ${darkMode ? "border-gray-600" : "border-gray-200"}`} />
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                    darkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          darkMode={darkMode}
          activeTab={activeTab}
          onHoverChange={(isHovered) => setSidebarWidth(isHovered ? 240 : 72)}
        />

        {/* Main Content */}
        <motion.main
          className="flex-1 overflow-y-auto"
          style={{ width: `calc(100% - ${sidebarWidth}px)` }}
          initial={false}
          animate={{ width: `calc(100% - ${sidebarWidth}px)` }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
        >
          {renderActiveModule()}
        </motion.main>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        darkMode={darkMode}
      >
        <div
          className={`p-6 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } text-center`}
        >
          <h3
            className={`text-lg font-medium mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Are you sure you want to log out?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowLogoutModal(false)}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-700"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ darkMode, activeTab, onHoverChange }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    onHoverChange(false);
  };

  const getSidebarContent = () => {
    switch (activeTab) {
      case "overview":
        return [
          { id: "dashboard", icon: <BarChart size={20} />, label: "Dashboard", active: true },
          { id: "stats", icon: <BarChart size={20} />, label: "Statistics", active: false },
          { id: "recent", icon: <Clock size={20} />, label: "Recent Activity", active: false },
        ];
      case "appointments":
        return [
          { id: "all", icon: <Calendar size={20} />, label: "All Appointments", active: true },
          { id: "scheduled", icon: <Clock size={20} />, label: "Scheduled", active: false },
          { id: "completed", icon: <CheckCircle size={20} />, label: "Completed", active: false },
          { id: "cancelled", icon: <XCircle size={20} />, label: "Cancelled", active: false },
        ];
      case "my-patients":
        return [
          { id: "active", icon: <User size={20} />, label: "Active Patients", active: true },
          { id: "new", icon: <User size={20} />, label: "New Patients", active: false },
          { id: "follow-up", icon: <Clock size={20} />, label: "Follow-up", active: false },
          { id: "discharged", icon: <CheckCircle size={20} />, label: "Discharged", active: false },
        ];
      case "sessions":
        return [
          { id: "today", icon: <Calendar size={20} />, label: "Today's Sessions", active: true },
          { id: "upcoming", icon: <Clock size={20} />, label: "Upcoming", active: false },
          { id: "completed", icon: <CheckCircle size={20} />, label: "Completed", active: false },
          { id: "notes", icon: <FileText size={20} />, label: "Session Notes", active: false },
        ];
      case "forum":
        return [
          { id: "questions", icon: <MessageSquare size={20} />, label: "Questions", active: true },
          { id: "answers", icon: <MessageSquare size={20} />, label: "My Answers", active: false },
          { id: "moderation", icon: <AlertCircle size={20} />, label: "Moderation", active: false },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarContent();

  return (
    <motion.aside
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } border-r transition-all duration-300 ease-in-out ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
      style={{ width: hovered ? 240 : 72 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4">
        {sidebarItems.map((item) => (
          <div
            key={item.id}
            className={`mb-2 flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              item.active
                ? darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900"
                : darkMode
                ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {hovered && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 text-sm font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </div>
        ))}
      </div>
    </motion.aside>
  );
};

// Overview Module
const OverviewModule = ({ darkMode, specialistInfo }) => {
  return (
    <div className={`h-full p-6 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mb-8 p-8 rounded-2xl shadow-xl backdrop-blur-sm ${
          darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600" : "bg-gradient-to-r from-white to-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-6">
          <div className={`p-4 rounded-2xl ${darkMode ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}>
            <Star className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Welcome back, {specialistInfo?.first_name}! 👋
            </h2>
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Here's what's happening with your practice today
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Today's Appointments
              </p>
              <p className="text-2xl font-bold text-emerald-600">8</p>
            </div>
            <Calendar className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Active Patients
              </p>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Pending Reviews
              </p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Forum Answers
              </p>
              <p className="text-2xl font-bold text-purple-600">12</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-xl shadow-lg ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      }`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              New appointment scheduled with Sarah Johnson for tomorrow at 2:00 PM
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Session completed with Michael Chen - progress notes updated
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Answered forum question about anxiety management techniques
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Patients Module
const MyPatientsModule = ({ darkMode }) => {
  return (
    <div className={`h-full p-6 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className={`p-6 rounded-xl shadow-lg ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          My Patients
        </h2>
        <p className={`text-gray-500 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Patient management interface will be implemented here
        </p>
      </div>
    </div>
  );
};

// Sessions Module
const SessionsModule = ({ darkMode }) => {
  return (
    <div className={`h-full p-6 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <div className={`p-6 rounded-xl shadow-lg ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Sessions
        </h2>
        <p className={`text-gray-500 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Session management interface will be implemented here
        </p>
      </div>
    </div>
  );
};

export default SpecialistDashboard;