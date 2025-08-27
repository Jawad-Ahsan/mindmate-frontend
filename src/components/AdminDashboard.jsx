import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users, Trash2, LogOut, User, Mail, Calendar, Phone, MapPin,
  AlertCircle, CheckCircle, XCircle, Clock, Award, Sun, Moon,
  FileText, Globe, Settings, Shield, MessageSquare, Eye, Download,
  Star, Activity, BarChart, BookOpen, Heart, UserCheck, Home, TrendingUp
} from "react-feather";
import { Modal } from "./Modal";

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSpecialistDetailsModal, setShowSpecialistDetailsModal] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
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

  // Check if user is admin and get admin info
  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user_type !== "admin") {
          navigate("/login");
          return;
        }

        setAdminInfo(response.data);
        fetchPatients();
        fetchSpecialists();
        fetchReports();
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAdminAuth();
  }, [navigate, API_URL]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/api/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/api/admin/specialists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpecialists(response.data);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      setError("Failed to fetch specialists");
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to fetch reports");
    }
  };

  // Sidebar content based on active tab
  const getSidebarContent = () => {
    switch (activeTab) {
      case "overview":
        return [
          { id: "dashboard", icon: <BarChart size={18} />, label: "Dashboard", active: activeSidebarItem === "dashboard" },
          { id: "recent-activity", icon: <Activity size={18} />, label: "Recent Activity", active: activeSidebarItem === "recent-activity" },
          { id: "system-stats", icon: <TrendingUp size={18} />, label: "System Stats", active: activeSidebarItem === "system-stats" },
        ];
      case "patients":
        return [
          { id: "all-patients", icon: <Users size={18} />, label: "All Patients", active: activeSidebarItem === "all-patients" },
          { id: "active-patients", icon: <CheckCircle size={18} />, label: "Active Patients", active: activeSidebarItem === "active-patients" },
          { id: "inactive-patients", icon: <XCircle size={18} />, label: "Inactive Patients", active: activeSidebarItem === "inactive-patients" },
        ];
      case "specialists":
        return [
          { id: "pending-approvals", icon: <Clock size={18} />, label: "Pending Approvals", active: activeSidebarItem === "pending-approvals" },
          { id: "approved-specialists", icon: <CheckCircle size={18} />, label: "Approved Specialists", active: activeSidebarItem === "approved-specialists" },
          { id: "suspended-specialists", icon: <AlertCircle size={18} />, label: "Suspended Specialists", active: activeSidebarItem === "suspended-specialists" },
          { id: "rejected-specialists", icon: <XCircle size={18} />, label: "Rejected Specialists", active: activeSidebarItem === "rejected-specialists" },
        ];
      case "reports":
        return [
          { id: "pending-reports", icon: <Clock size={18} />, label: "Pending Reports", active: activeSidebarItem === "pending-reports" },
          { id: "resolved-reports", icon: <CheckCircle size={18} />, label: "Resolved Reports", active: activeSidebarItem === "resolved-reports" },
          { id: "removed-content", icon: <Trash2 size={18} />, label: "Removed Content", active: activeSidebarItem === "removed-content" },
        ];
      default:
        return [];
    }
  };

  // Handler functions
  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to permanently delete this patient? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/api/admin/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPatients(patients.filter(patient => patient.id !== patientId));
    } catch (error) {
      console.error("Error deleting patient:", error);
      setError("Failed to delete patient");
    }
  };

  const handleApproveSpecialist = async (specialistId) => {
    if (!window.confirm("Are you sure you want to approve this specialist?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_URL}/api/admin/specialists/${specialistId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpecialists(specialists.map(specialist => 
        specialist.id === specialistId 
          ? { ...specialist, approval_status: "approved" }
          : specialist
      ));
      
      fetchSpecialists();
    } catch (error) {
      console.error("Error approving specialist:", error);
      setError("Failed to approve specialist");
    }
  };

  const handleRejectSpecialist = async (specialistId) => {
    if (!window.confirm("Are you sure you want to reject this specialist? This will permanently delete their account.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_URL}/api/admin/specialists/${specialistId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpecialists(specialists.filter(specialist => specialist.id !== specialistId));
    } catch (error) {
      console.error("Error rejecting specialist:", error);
      setError("Failed to reject specialist");
    }
  };

  const handleSuspendSpecialist = async (specialistId) => {
    if (!window.confirm("Are you sure you want to suspend this specialist?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_URL}/api/admin/specialists/${specialistId}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpecialists(specialists.map(specialist => 
        specialist.id === specialistId 
          ? { ...specialist, approval_status: "suspended" }
          : specialist
      ));
      
      fetchSpecialists();
    } catch (error) {
      console.error("Error suspending specialist:", error);
      setError("Failed to suspend specialist");
    }
  };

  const handleUnsuspendSpecialist = async (specialistId) => {
    if (!window.confirm("Are you sure you want to unsuspend this specialist?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_URL}/api/admin/specialists/${specialistId}/unsuspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpecialists(specialists.map(specialist => 
        specialist.id === specialistId 
          ? { ...specialist, approval_status: "approved" }
          : specialist
      ));
      
      fetchSpecialists();
    } catch (error) {
      console.error("Error unsuspending specialist:", error);
      setError("Failed to unsuspend specialist");
    }
  };

  const handleDeleteSpecialist = async (specialistId) => {
    if (!window.confirm("Are you sure you want to permanently delete this specialist? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/api/admin/specialists/${specialistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSpecialists(specialists.filter(specialist => specialist.id !== specialistId));
    } catch (error) {
      console.error("Error deleting specialist:", error);
      setError("Failed to delete specialist");
    }
  };

  const handleViewSpecialistDetails = async (specialistId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/api/admin/specialists/${specialistId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedSpecialist(response.data);
      setShowSpecialistDetailsModal(true);
    } catch (error) {
      console.error("Error fetching specialist details:", error);
      setError("Failed to fetch specialist details");
    }
  };

  const handleReportAction = async (reportId, action) => {
    const actionText = action === "keep" ? "resolve" : "remove";
    if (!window.confirm(`Are you sure you want to ${actionText} this report?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_URL}/api/admin/reports/${reportId}/action`, {
        action: action,
        notes: `Report ${actionText}d by admin`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchReports();
      setError("");
    } catch (error) {
      console.error(`Error ${actionText}ing report:`, error);
      setError(`Failed to ${actionText} report`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-md py-4 px-6 flex justify-between items-center`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            M
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            MindMate Admin
          </h1>
        </motion.div>

        <div className="flex items-center space-x-4">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-4">
            <div
              className="relative"
              onMouseEnter={() => setHoveredTab("overview")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setActiveSidebarItem("dashboard");
                }}
                className={`p-2 rounded-full transition-colors ${
                  activeTab === "overview"
                    ? darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Home size={20} />
              </button>

              {hoveredTab === "overview" && (
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
                  Overview
                </motion.div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoveredTab("patients")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => {
                  setActiveTab("patients");
                  setActiveSidebarItem("all-patients");
                }}
                className={`p-2 rounded-full transition-colors ${
                  activeTab === "patients"
                    ? darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Users size={20} />
              </button>

              {hoveredTab === "patients" && (
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
                  Patients
                </motion.div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoveredTab("specialists")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => {
                  setActiveTab("specialists");
                  setActiveSidebarItem("pending-approvals");
                }}
                className={`p-2 rounded-full transition-colors ${
                  activeTab === "specialists"
                    ? darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <UserCheck size={20} />
              </button>

              {hoveredTab === "specialists" && (
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
                  Specialists
                </motion.div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoveredTab("reports")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => {
                  setActiveTab("reports");
                  setActiveSidebarItem("pending-reports");
                }}
                className={`p-2 rounded-full transition-colors ${
                  activeTab === "reports"
                    ? darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-900"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <AlertCircle size={20} />
              </button>

              {hoveredTab === "reports" && (
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
                  Reports
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Profile menu"
            >
              <div
                className={`w-8 h-8 rounded-full ${
                  darkMode ? "bg-gray-600" : "bg-gray-200"
                } flex items-center justify-center border ${
                  darkMode ? "border-gray-500" : "border-gray-300"
                }`}
              >
                <User
                  size={18}
                  className={darkMode ? "text-gray-200" : "text-gray-700"}
                  strokeWidth={2}
                />
              </div>
            </button>

            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg z-50 ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white ring-1 ring-black ring-opacity-5"
                }`}
              >
                <div className="py-1">
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setShowProfileDropdown(false)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <div
                    className={`border-t my-1 ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  ></div>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                      darkMode
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-gray-100"
                    }`}
                  >
                    <LogOut size={16} className="mr-2" />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } border-r ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } transition-all duration-300`}
          style={{ width: `${sidebarWidth}px` }}
          onMouseEnter={() => setSidebarWidth(240)}
          onMouseLeave={() => setSidebarWidth(72)}
        >
          <div className="p-4">
            <nav className="space-y-2">
              {getSidebarContent().map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSidebarItem(item.id);
                    // Logic to navigate to specific tab content
                  }}
                                     className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                     item.active
                       ? darkMode
                         ? "bg-indigo-600 text-white"
                         : "bg-indigo-100 text-indigo-700"
                       : darkMode
                       ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                       : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                   }`}
                 >
                   <div className={`flex-shrink-0 ${
                     item.active
                       ? darkMode
                         ? "text-white"
                         : "text-indigo-700"
                       : darkMode
                       ? "text-gray-300"
                       : "text-gray-600"
                   }`}>
                     {item.icon}
                   </div>
                   <span className={`transition-opacity duration-300 ${
                     sidebarWidth > 72 ? "opacity-100" : "opacity-0"
                   }`}>
                     {item.label}
                   </span>
                 </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <motion.div
              className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Content based on activeTab and activeSidebarItem */}
          {activeTab === "overview" && (
            <OverviewContent 
              darkMode={darkMode} 
              patients={patients} 
              specialists={specialists} 
              reports={reports}
              activeSidebarItem={activeSidebarItem}
            />
          )}

          {activeTab === "patients" && (
            <PatientsContent 
              darkMode={darkMode} 
              patients={patients} 
              activeSidebarItem={activeSidebarItem}
              onDeletePatient={handleDeletePatient}
            />
          )}

          {activeTab === "specialists" && (
            <SpecialistsContent 
              darkMode={darkMode} 
              specialists={specialists} 
              activeSidebarItem={activeSidebarItem}
              onApproveSpecialist={handleApproveSpecialist}
              onRejectSpecialist={handleRejectSpecialist}
              onSuspendSpecialist={handleSuspendSpecialist}
              onUnsuspendSpecialist={handleUnsuspendSpecialist}
              onDeleteSpecialist={handleDeleteSpecialist}
              onViewSpecialistDetails={handleViewSpecialistDetails}
            />
          )}

          {activeTab === "reports" && (
            <ReportsContent 
              darkMode={darkMode} 
              reports={reports} 
              activeSidebarItem={activeSidebarItem}
              onReportAction={handleReportAction}
            />
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
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
              className={`px-4 py-2 rounded-md ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_id");
                navigate("/login");
              }}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Specialist Details Modal */}
      <Modal isOpen={showSpecialistDetailsModal} onClose={() => setShowSpecialistDetailsModal(false)}>
        <div
          className={`p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {selectedSpecialist && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Specialist Details
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ID: {selectedSpecialist.id}
                  </p>
                </div>
                <button
                  onClick={() => setShowSpecialistDetailsModal(false)}
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Basic Information */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Full Name</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedSpecialist.full_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Email</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedSpecialist.email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Phone</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedSpecialist.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Specialist Type</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedSpecialist.specialist_type || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Years of Experience</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedSpecialist.years_experience || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Consultation Fee</p>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedSpecialist.consultation_fee ? `$${selectedSpecialist.consultation_fee}` : "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address & Contact */}
              {(selectedSpecialist.address || selectedSpecialist.city || selectedSpecialist.clinic_name) && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Address & Contact
                  </h4>
                  <div className="space-y-2">
                    {selectedSpecialist.clinic_name && (
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Clinic Name</p>
                        <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedSpecialist.clinic_name}
                        </p>
                      </div>
                    )}
                    {selectedSpecialist.address && (
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Address</p>
                        <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedSpecialist.address}
                        </p>
                      </div>
                    )}
                    {selectedSpecialist.city && (
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>City</p>
                        <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedSpecialist.city}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {selectedSpecialist.specializations && selectedSpecialist.specializations.length > 0 && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Specializations
                  </h4>
                  <div className="space-y-3">
                    {selectedSpecialist.specializations.map((spec, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-600" : "bg-white"
                      } border ${
                        darkMode ? "border-gray-500" : "border-gray-200"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {spec.specialization}
                            </p>
                            <p className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {spec.years_of_experience_in_specialization} years experience
                            </p>
                          </div>
                          {spec.is_primary_specialization && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                            }`}>
                              Primary
                            </span>
                          )}
                        </div>
                        {spec.certification_date && (
                          <p className={`text-xs mt-1 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Certified: {new Date(spec.certification_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedSpecialist.documents && selectedSpecialist.documents.length > 0 && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Documents
                  </h4>
                  <div className="space-y-3">
                    {selectedSpecialist.documents.map((doc, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-600" : "bg-white"
                      } border ${
                        darkMode ? "border-gray-500" : "border-gray-200"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {doc.document_name}
                            </p>
                            <p className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Type: {doc.document_type}
                            </p>
                            <p className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.verification_status === "verified" 
                              ? darkMode ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                              : doc.verification_status === "pending"
                              ? darkMode ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-800"
                              : darkMode ? "bg-red-600 text-white" : "bg-red-100 text-red-800"
                          }`}>
                            {doc.verification_status || "Pending"}
                          </span>
                        </div>
                        {doc.verification_notes && (
                          <p className={`text-xs mt-2 p-2 rounded ${
                            darkMode ? "bg-gray-500 text-gray-300" : "bg-gray-100 text-gray-700"
                          }`}>
                            Notes: {doc.verification_notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedSpecialist.availability_slots && selectedSpecialist.availability_slots.length > 0 && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Availability Slots
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedSpecialist.availability_slots.map((slot, index) => (
                      <div key={index} className={`p-2 rounded-lg text-center ${
                        darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                      } border ${
                        darkMode ? "border-gray-500" : "border-gray-200"
                      }`}>
                        <p className="text-sm font-medium">{slot.display}</p>
                        <p className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {slot.time_slot}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Completion & Status */}
              <div className={`p-4 rounded-lg border ${
                darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
              }`}>
                <h4 className={`text-lg font-semibold mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  Profile Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Profile Completion</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedSpecialist.profile_completion_percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {selectedSpecialist.profile_completion_percentage || 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>Approval Status</p>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      selectedSpecialist.approval_status === "approved"
                        ? darkMode ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                        : selectedSpecialist.approval_status === "pending"
                        ? darkMode ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-800"
                        : selectedSpecialist.approval_status === "rejected"
                        ? darkMode ? "bg-red-600 text-white" : "bg-red-100 text-red-800"
                        : selectedSpecialist.approval_status === "suspended"
                        ? darkMode ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-800"
                        : darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedSpecialist.approval_status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedSpecialist.bio || selectedSpecialist.languages_spoken || selectedSpecialist.website_url) && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Additional Information
                  </h4>
                  <div className="space-y-3">
                    {selectedSpecialist.bio && (
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Bio</p>
                        <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedSpecialist.bio}
                        </p>
                      </div>
                    )}
                    {selectedSpecialist.languages_spoken && (
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Languages Spoken</p>
                        <p className={`${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedSpecialist.languages_spoken}
                        </p>
                      </div>
                    )}
                    {selectedSpecialist.website_url && (
                      <div>
                        <p className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>Website</p>
                        <a 
                          href={selectedSpecialist.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-blue-600 hover:text-blue-800 underline ${
                            darkMode ? "text-blue-400 hover:text-blue-300" : ""
                          }`}
                        >
                          {selectedSpecialist.website_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowSpecialistDetailsModal(false)}
                  className={`px-6 py-2 rounded-lg ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// Content Components
const OverviewContent = ({ darkMode, patients, specialists, reports, activeSidebarItem }) => {
  const renderContent = () => {
    switch (activeSidebarItem) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Dashboard Overview
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                className={`p-6 rounded-xl shadow-lg backdrop-blur-sm ${
                  darkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"
                }`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <Users className={`h-8 w-8 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Total Patients
                    </p>
                    <p className="text-2xl font-bold">{patients.length}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className={`p-6 rounded-xl shadow-lg backdrop-blur-sm ${
                  darkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"
                }`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-green-400 to-emerald-500"}`}>
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Total Specialists
                    </p>
                    <p className="text-2xl font-bold">{specialists.length}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className={`p-6 rounded-xl shadow-lg backdrop-blur-sm ${
                  darkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"
                }`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? "bg-gradient-to-r from-yellow-500 to-orange-600" : "bg-gradient-to-r from-yellow-400 to-orange-500"}`}>
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold">
                      {specialists.filter(s => s.approval_status === "pending").length}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className={`p-6 rounded-xl shadow-lg backdrop-blur-sm ${
                  darkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"
                }`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${darkMode ? "bg-gradient-to-r from-red-500 to-pink-600" : "bg-gradient-to-r from-red-400 to-pink-500"}`}>
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Pending Reports
                    </p>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.status === "pending").length}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      
      case "recent-activity":
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Recent Activity
            </h2>
            <div className={`p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Recent activity will be displayed here
              </p>
            </div>
          </div>
        );
      
      case "system-stats":
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              System Statistics
            </h2>
            <div className={`p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                System statistics will be displayed here
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderContent();
};

const PatientsContent = ({ darkMode, patients, activeSidebarItem, onDeletePatient }) => {
  const renderContent = () => {
    switch (activeSidebarItem) {
      case "all-patients":
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              All Patients ({patients.length})
            </h2>
            <PatientsTable darkMode={darkMode} patients={patients} onDeletePatient={onDeletePatient} />
          </div>
        );
      
      case "active-patients":
        const activePatients = patients.filter(p => p.is_active);
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Active Patients ({activePatients.length})
            </h2>
            <PatientsTable darkMode={darkMode} patients={activePatients} onDeletePatient={onDeletePatient} />
          </div>
        );
      
      case "inactive-patients":
        const inactivePatients = patients.filter(p => !p.is_active);
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Inactive Patients ({inactivePatients.length})
            </h2>
            <PatientsTable darkMode={darkMode} patients={inactivePatients} onDeletePatient={onDeletePatient} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderContent();
};

// Table Components
const PatientsTable = ({ darkMode, patients, onDeletePatient }) => {
  if (patients.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <Users className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
        <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No patients found.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                Contact Info
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            {patients.map((patient) => (
              <motion.tr
                key={patient.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-indigo-600" : "bg-indigo-100"
                      }`}>
                        <User className={`h-6 w-6 ${darkMode ? "text-white" : "text-indigo-600"}`} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {patient.full_name}
                      </div>
                      <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        ID: {patient.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                        {patient.email}
                      </span>
                    </div>
                    {patient.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {patient.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {patient.is_active ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm ${patient.is_active ? "text-green-600" : "text-red-600"}`}>
                      {patient.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onDeletePatient(patient.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      darkMode
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SpecialistsContent = ({ 
  darkMode, 
  specialists, 
  activeSidebarItem, 
  onApproveSpecialist, 
  onRejectSpecialist, 
  onSuspendSpecialist, 
  onUnsuspendSpecialist, 
  onDeleteSpecialist, 
  onViewSpecialistDetails 
}) => {
  const renderContent = () => {
    switch (activeSidebarItem) {
      case "pending-approvals":
        const pendingSpecialists = specialists.filter(s => s.approval_status === "pending");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Pending Approvals ({pendingSpecialists.length})
            </h2>
            <SpecialistsTable 
              darkMode={darkMode} 
              specialists={pendingSpecialists} 
              onApproveSpecialist={onApproveSpecialist}
              onRejectSpecialist={onRejectSpecialist}
              onViewSpecialistDetails={onViewSpecialistDetails}
            />
          </div>
        );
      
      case "approved-specialists":
        const approvedSpecialists = specialists.filter(s => s.approval_status === "approved");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Approved Specialists ({approvedSpecialists.length})
            </h2>
            <SpecialistsTable 
              darkMode={darkMode} 
              specialists={approvedSpecialists} 
              onSuspendSpecialist={onSuspendSpecialist}
              onViewSpecialistDetails={onViewSpecialistDetails}
            />
          </div>
        );
      
      case "suspended-specialists":
        const suspendedSpecialists = specialists.filter(s => s.approval_status === "suspended");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Suspended Specialists ({suspendedSpecialists.length})
            </h2>
            <SpecialistsTable 
              darkMode={darkMode} 
              specialists={suspendedSpecialists} 
              onUnsuspendSpecialist={onUnsuspendSpecialist}
              onViewSpecialistDetails={onViewSpecialistDetails}
            />
          </div>
        );
      
      case "rejected-specialists":
        const rejectedSpecialists = specialists.filter(s => s.approval_status === "rejected");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Rejected Specialists ({rejectedSpecialists.length})
            </h2>
            <SpecialistsTable 
              darkMode={darkMode} 
              specialists={rejectedSpecialists} 
              onDeleteSpecialist={onDeleteSpecialist}
              onViewSpecialistDetails={onViewSpecialistDetails}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderContent();
};

const SpecialistsTable = ({ 
  darkMode, 
  specialists, 
  onApproveSpecialist, 
  onRejectSpecialist, 
  onSuspendSpecialist, 
  onUnsuspendSpecialist, 
  onDeleteSpecialist, 
  onViewSpecialistDetails 
}) => {
  if (specialists.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <User className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
        <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No specialists found.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Specialist
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Contact Info
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            {specialists.map((specialist) => (
              <motion.tr
                key={specialist.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-indigo-600" : "bg-indigo-100"
                      }`}>
                        <User className={`h-6 w-6 ${darkMode ? "text-white" : "text-indigo-600"}`} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {specialist.full_name}
                      </div>
                      <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        ID: {specialist.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                        {specialist.email}
                      </span>
                    </div>
                    {specialist.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {specialist.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {specialist.approval_status === "approved" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : specialist.approval_status === "rejected" ? (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    ) : specialist.approval_status === "suspended" ? (
                      <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <span className={`text-sm ${
                      specialist.approval_status === "approved" 
                        ? "text-green-600" 
                        : specialist.approval_status === "rejected"
                        ? "text-red-600"
                        : specialist.approval_status === "suspended"
                        ? "text-orange-600"
                        : "text-yellow-600"
                    }`}>
                      {specialist.approval_status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewSpecialistDetails(specialist.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                        darkMode
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-indigo-500 hover:bg-indigo-600 text-white"
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    {specialist.approval_status === "pending" && (
                      <>
                        <button
                          onClick={() => onApproveSpecialist(specialist.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                            darkMode
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onRejectSpecialist(specialist.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                            darkMode
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    
                    {specialist.approval_status === "approved" && (
                      <button
                        onClick={() => onSuspendSpecialist(specialist.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                          darkMode
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>Suspend</span>
                      </button>
                    )}
                    
                    {specialist.approval_status === "suspended" && (
                      <button
                        onClick={() => onUnsuspendSpecialist(specialist.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                          darkMode
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Unsuspend</span>
                      </button>
                    )}
                    
                    {specialist.approval_status === "rejected" && (
                      <button
                        onClick={() => onDeleteSpecialist(specialist.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportsContent = ({ darkMode, reports, activeSidebarItem, onReportAction }) => {
  const renderContent = () => {
    switch (activeSidebarItem) {
      case "pending-reports":
        const pendingReports = reports.filter(r => r.status === "pending");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Pending Reports ({pendingReports.length})
            </h2>
            <ReportsTable darkMode={darkMode} reports={pendingReports} onReportAction={onReportAction} />
          </div>
        );
      
      case "resolved-reports":
        const resolvedReports = reports.filter(r => r.status === "resolved");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Resolved Reports ({resolvedReports.length})
            </h2>
            <ReportsTable darkMode={darkMode} reports={resolvedReports} onReportAction={onReportAction} />
          </div>
        );
      
      case "removed-content":
        const removedReports = reports.filter(r => r.status === "removed");
        return (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Removed Content ({removedReports.length})
            </h2>
            <ReportsTable darkMode={darkMode} reports={removedReports} onReportAction={onReportAction} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderContent();
};

const ReportsTable = ({ darkMode, reports, onReportAction }) => {
  if (reports.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
        <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          No reports found.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Report Details
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Reported Content
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            {reports.map((report) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
              >
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.post_type === "question" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}>
                        {report.post_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : report.status === "resolved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Reporter: {report.reporter_name}</p>
                      <p className="text-gray-500 dark:text-gray-400">Type: {report.reporter_type}</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {report.reason && (
                      <div className="text-sm">
                        <p className="font-medium">Reason:</p>
                        <p className="text-gray-600 dark:text-gray-300">{report.reason}</p>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium">Author: {report.post_author_name}</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {report.post_content}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {report.status === "pending" ? (
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    ) : report.status === "resolved" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${
                      report.status === "pending" 
                        ? "text-yellow-600" 
                        : report.status === "resolved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {report.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onReportAction(report.id, "keep")}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                          darkMode
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Keep</span>
                      </button>
                      <button
                        onClick={() => onReportAction(report.id, "remove")}
                        className={`flex items-center space-x-3 py-2 rounded-lg ${
                          darkMode
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                  {report.status !== "pending" && (
                    <span className={`px-3 py-2 rounded-lg ${
                      report.status === "resolved"
                        ? darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                        : darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
                    }`}>
                      {report.status === "resolved" ? "Resolved" : "Removed"}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
