import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
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
  Moon
} from "react-feather";
import { Modal } from "./Modal";
import ForumModule from "./Home/Dashboard/ForumModule";

const SpecialistDashboard = () => {
  const [specialistInfo, setSpecialistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`border-b ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Award className={`h-8 w-8 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Specialist Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {specialistInfo && (
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{specialistInfo.full_name}</span>
                </div>
              )}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className={`mb-8 p-6 rounded-lg shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              darkMode ? "bg-indigo-600" : "bg-indigo-100"
            }`}>
              <Award className={`h-8 w-8 ${darkMode ? "text-white" : "text-indigo-600"}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Welcome back, {specialistInfo?.first_name}!
              </h2>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                You are logged in as a {specialistInfo?.specialist_type?.replace('_', ' ')} specialist.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className={`p-6 rounded-lg shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <Users className={`h-8 w-8 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Total Patients
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`p-6 rounded-lg shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <MessageSquare className={`h-8 w-8 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Active Sessions
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`p-6 rounded-lg shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <FileText className={`h-8 w-8 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              <div className="ml-4">
                <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Completed Sessions
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("patients")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "patients"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Patients
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sessions"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveTab("forum")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "forum"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Forum
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Dashboard Overview
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Recent Activity
                  </h3>
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      No recent activity to display.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className={`w-full p-3 text-left rounded-lg border ${
                      darkMode 
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-white" 
                        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
                    }`}>
                      <Plus className="h-5 w-5 inline mr-2" />
                      Start New Session
                    </button>
                    <button className={`w-full p-3 text-left rounded-lg border ${
                      darkMode 
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-white" 
                        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
                    }`}>
                      <FileText className="h-5 w-5 inline mr-2" />
                      View Reports
                    </button>
                    <button className={`w-full p-3 text-left rounded-lg border ${
                      darkMode 
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-white" 
                        : "border-gray-300 bg-white hover:bg-gray-50 text-gray-900"
                    }`}>
                      <Settings className="h-5 w-5 inline mr-2" />
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                My Patients
              </h2>
            </div>
            <div className="p-8 text-center">
              <Users className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No patients assigned yet. Patients will appear here once they start sessions with you.
              </p>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Sessions
              </h2>
            </div>
            <div className="p-8 text-center">
              <MessageSquare className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No active or completed sessions yet.
              </p>
            </div>
          </div>
        )}

        {activeTab === "forum" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Forum - Answer Questions
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Help patients by answering their questions in the forum. You can view all questions and provide professional guidance.
                </p>
              </div>
              
              {/* Import and use ForumModule for specialists */}
              <ForumModule darkMode={darkMode} />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Profile Information
              </h2>
            </div>
            <div className="p-6">
              {specialistInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {specialistInfo.first_name} {specialistInfo.last_name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {specialistInfo.email}
                        </span>
                      </div>
                      {specialistInfo.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-3 text-gray-400" />
                          <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                            {specialistInfo.phone}
                          </span>
                        </div>
                      )}
                      {specialistInfo.city && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                          <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                            {specialistInfo.city}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Professional Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-3 text-gray-400" />
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {specialistInfo.specialist_type?.replace('_', ' ')}
                        </span>
                      </div>
                      {specialistInfo.years_experience !== undefined && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-3 text-gray-400" />
                          <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                            {specialistInfo.years_experience} years of experience
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                        <span className="text-green-600">Account Approved</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

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
              onClick={handleLogoutConfirm}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SpecialistDashboard;
