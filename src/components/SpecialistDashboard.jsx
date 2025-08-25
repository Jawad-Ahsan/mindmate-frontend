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
import SpecialistProfile from "./SpecialistProfile";

const SpecialistDashboard = () => {
  const [specialistInfo, setSpecialistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
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

        // Use detailed approval status check
        await checkApprovalStatusAndRedirect(token);

      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkSpecialistAuth();
  }, [navigate, API_URL]);

  const checkApprovalStatusAndRedirect = async (token) => {
    try {
      // Get detailed approval status
      const statusResponse = await axios.get(`${API_URL}/api/specialist/approval-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const statusData = statusResponse.data;
      console.log("Dashboard approval check:", statusData);

      // Only allow access to dashboard if approved
      if (statusData.approval_status !== "approved") {
        let redirectPath = "/complete-profile";
        let message = "Please complete your profile.";

        switch (statusData.next_action) {
          case "complete_profile":
            redirectPath = "/complete-profile";
            message = "Please complete your profile to continue.";
            break;
          case "upload_documents":
            redirectPath = "/complete-profile?tab=documents";
            message = "Please upload all required documents.";
            break;
          case "submit_for_approval":
            redirectPath = "/complete-profile?tab=documents";
            message = "Please submit your application for approval.";
            break;
          case "pending_approval":
            redirectPath = "/pending-approval";
            message = "Your application is under review.";
            break;
          case "application_rejected":
            redirectPath = "/application-rejected";
            message = "Your application has been rejected.";
            break;
        }

        console.log(`Redirecting non-approved specialist to: ${redirectPath}`);
        
        // Show appropriate message
        if (statusData.approval_status === "under_review") {
          setError("Your application is under review. You'll receive an email when approved.");
        } else {
          setError(message);
        }
        
        setLoading(false);
        
        // Redirect after a short delay to show the message
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
        
        return;
      }

      // If approved, get full specialist info and continue
      const userResponse = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSpecialistInfo(userResponse.data);
      setLoading(false);

    } catch (error) {
      console.error("Failed to check approval status:", error);
      setError("Failed to verify account status. Please try again.");
      setLoading(false);
      
      // Fallback redirect after error
      setTimeout(() => {
        navigate("/complete-profile");
      }, 2000);
    }
  };

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
    { id: "profile", icon: <User size={20} />, label: "Profile" },
  ];

  const renderActiveModule = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewModule darkMode={darkMode} specialistInfo={specialistInfo} activeSidebarItem={activeSidebarItem} />;
      case "appointments":
        return <SpecialistAppointmentsModule darkMode={darkMode} activeSidebarItem={activeSidebarItem} />;
      case "my-patients":
        return <MyPatientsModule darkMode={darkMode} activeSidebarItem={activeSidebarItem} />;
      case "sessions":
        return <SessionsModule darkMode={darkMode} activeSidebarItem={activeSidebarItem} />;
      case "forum":
        return <ForumModule darkMode={darkMode} activeSidebarItem={activeSidebarItem} />;
      case "profile":
        return <SpecialistProfile darkMode={darkMode} />;
      default:
        return <OverviewModule darkMode={darkMode} specialistInfo={specialistInfo} activeSidebarItem={activeSidebarItem} />;
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
          activeSidebarItem={activeSidebarItem}
          onSidebarItemClick={setActiveSidebarItem}
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
const Sidebar = ({ darkMode, activeTab, activeSidebarItem, onSidebarItemClick, onHoverChange }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    onHoverChange(false);
  };

  const handleSidebarItemClick = (itemId) => {
    onSidebarItemClick(itemId);
  };

  const getSidebarContent = () => {
    switch (activeTab) {
      case "overview":
        return [
          { id: "dashboard", icon: <BarChart size={20} />, label: "Dashboard", active: activeSidebarItem === "dashboard" },
          { id: "stats", icon: <BarChart size={20} />, label: "Statistics", active: activeSidebarItem === "stats" },
          { id: "recent", icon: <Clock size={20} />, label: "Recent Activity", active: activeSidebarItem === "recent" },
        ];
      case "appointments":
        return [
          { id: "all", icon: <Calendar size={20} />, label: "All Appointments", active: activeSidebarItem === "all" },
          { id: "scheduled", icon: <Clock size={20} />, label: "Scheduled", active: activeSidebarItem === "scheduled" },
          { id: "completed", icon: <CheckCircle size={20} />, label: "Completed", active: activeSidebarItem === "completed" },
          { id: "cancelled", icon: <XCircle size={20} />, label: "Cancelled", active: activeSidebarItem === "cancelled" },
        ];
      case "my-patients":
        return [
          { id: "active", icon: <User size={20} />, label: "Active Patients", active: activeSidebarItem === "active" },
          { id: "new", icon: <User size={20} />, label: "New Patients", active: activeSidebarItem === "new" },
          { id: "follow-up", icon: <Clock size={20} />, label: "Follow-up", active: activeSidebarItem === "follow-up" },
          { id: "discharged", icon: <CheckCircle size={20} />, label: "Discharged", active: activeSidebarItem === "discharged" },
        ];
      case "sessions":
        return [
          { id: "today", icon: <Calendar size={20} />, label: "Today's Sessions", active: activeSidebarItem === "today" },
          { id: "upcoming", icon: <Clock size={20} />, label: "Upcoming", active: activeSidebarItem === "upcoming" },
          { id: "completed", icon: <CheckCircle size={20} />, label: "Completed", active: activeSidebarItem === "completed" },
          { id: "notes", icon: <FileText size={20} />, label: "Session Notes", active: activeSidebarItem === "notes" },
        ];
      case "forum":
        return [
          { id: "questions", icon: <MessageSquare size={20} />, label: "Questions", active: activeSidebarItem === "questions" },
          { id: "answers", icon: <MessageSquare size={20} />, label: "My Answers", active: activeSidebarItem === "answers" },
          { id: "moderation", icon: <AlertCircle size={20} />, label: "Moderation", active: activeSidebarItem === "moderation" },
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
            onClick={() => handleSidebarItemClick(item.id)}
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
const OverviewModule = ({ darkMode, specialistInfo, activeSidebarItem = "dashboard" }) => {
  // Get content based on activeSidebarItem
  const getContent = () => {
    switch (activeSidebarItem) {
      case "dashboard":
        return {
          title: "Welcome back, " + (specialistInfo?.first_name || "Specialist") + "! 👋",
          subtitle: "Here's what's happening with your practice today",
          icon: <Star className="h-10 w-10 text-white" />
        };
      case "stats":
        return {
          title: "Practice Statistics",
          subtitle: "Detailed analytics and performance metrics",
          icon: <BarChart className="h-10 w-10 text-white" />
        };
      case "recent":
        return {
          title: "Recent Activity",
          subtitle: "Latest updates and recent interactions",
          icon: <Clock className="h-10 w-10 text-white" />
        };
      default:
        return {
          title: "Welcome back, " + (specialistInfo?.first_name || "Specialist") + "! 👋",
          subtitle: "Here's what's happening with your practice today",
          icon: <Star className="h-10 w-10 text-white" />
        };
    }
  };

  const content = getContent();

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
            {content.icon}
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {content.title}
            </h2>
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {content.subtitle}
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
const MyPatientsModule = ({ darkMode, activeSidebarItem = "active" }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    loadPatients();
    
    // Set up HTTP polling for real-time updates
    const pollInterval = setInterval(() => {
      loadPatients();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [activeSidebarItem]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Map sidebar items to status filters
      let statusFilter = "all";
      switch (activeSidebarItem) {
        case "new":
          statusFilter = "new";
          break;
        case "active":
          statusFilter = "active";
          break;
        case "follow-up":
          statusFilter = "follow_up";
          break;
        case "discharged":
          statusFilter = "discharged";
          break;
        default:
          statusFilter = "all";
      }

      const requestData = {
        status: statusFilter,
        search_query: "",
        page: 1,
        size: 20
      };

      const response = await axios.post(
        `${API_URL}/api/specialist/patients/filter`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPatients(response.data.patients);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading patients:", err);
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            My Patients
          </h2>
          {lastUpdated && (
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {activeSidebarItem === "all" ? "All Patients" : 
           activeSidebarItem === "new" ? "New Patients" :
           activeSidebarItem === "active" ? "Active Patients" :
           activeSidebarItem === "follow-up" ? "Follow-up Patients" :
           activeSidebarItem === "discharged" ? "Discharged Patients" : "All Patients"}
        </p>
      </div>

      {error ? (
        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={loadPatients}
              disabled={loading}
              className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 mx-auto`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4"></div>
                  <span>Retry</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : patients.length === 0 ? (
        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="text-center">
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No patients found in this category
            </p>
          </div>
        </div>
      ) : (
        <div className={`rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Patient
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Last Session
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Total Sessions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                {patients.map((patient) => (
                  <tr key={patient.id} className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {patient.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === "new" ? "bg-blue-100 text-blue-800" :
                        patient.status === "active" ? "bg-green-100 text-green-800" :
                        patient.status === "follow_up" ? "bg-purple-100 text-purple-800" :
                        patient.status === "discharged" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {patient.status === "new" ? "New" :
                         patient.status === "active" ? "Active" :
                         patient.status === "follow_up" ? "Follow-up" :
                         patient.status === "discharged" ? "Discharged" : patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {patient.last_session_date ? new Date(patient.last_session_date).toLocaleDateString() : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {patient.total_sessions}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Sessions Module
const SessionsModule = ({ darkMode, activeSidebarItem = "today" }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    loadSessions();
    
    // Set up HTTP polling for real-time updates
    const pollInterval = setInterval(() => {
      loadSessions();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [activeSidebarItem]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Map sidebar items to filter types
      let filterType = "all";
      switch (activeSidebarItem) {
        case "today":
          filterType = "today";
          break;
        case "upcoming":
          filterType = "upcoming";
          break;
        case "completed":
          filterType = "completed";
          break;
        default:
          filterType = "all";
      }

      const requestData = {
        filter_type: filterType,
        date_from: null,
        date_to: null,
        page: 1,
        size: 20
      };

      const response = await axios.post(
        `${API_URL}/api/specialist/sessions/filter`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSessions(response.data.sessions);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Sessions
          </h2>
          {lastUpdated && (
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {activeSidebarItem === "today" ? "Today's Sessions" :
           activeSidebarItem === "upcoming" ? "Upcoming Sessions" :
           activeSidebarItem === "completed" ? "Completed Sessions" :
           activeSidebarItem === "notes" ? "Session Notes" : "All Sessions"}
        </p>
      </div>

      {error ? (
        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={loadSessions}
              disabled={loading}
              className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 mx-auto`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4"></div>
                  <span>Retry</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="text-center">
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No sessions found in this category
            </p>
          </div>
        </div>
      ) : (
        <div className={`rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Patient
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                {sessions.map((session) => (
                  <tr key={session.id} className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {session.patient_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {new Date(session.session_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === "completed" ? "bg-green-100 text-green-800" :
                        session.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                        session.status === "confirmed" ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {session.notes ? session.notes.substring(0, 50) + "..." : "No notes"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistDashboard;