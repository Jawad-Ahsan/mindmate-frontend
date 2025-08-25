import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  Mail,
  Phone,
  AlertCircle,
  LogOut,
  RefreshCw,
  FileText,
  User,
  Calendar,
  Sun,
  Moon
} from "react-feather";
import { toast } from "react-hot-toast";

const SpecialistPendingApproval = () => {
  const [approvalData, setApprovalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  // Check approval status on component mount and periodically
  useEffect(() => {
    checkApprovalStatus();
    
    // Set up periodic status checking (every 30 seconds)
    const interval = setInterval(checkApprovalStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkApprovalStatus = async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/specialist/approval-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setApprovalData(data);

      // Handle status changes
      if (data.approval_status === "approved") {
        toast.success("🎉 Your application has been approved! Redirecting to dashboard...");
        setTimeout(() => navigate("/specialist-dashboard"), 2000);
      } else if (data.approval_status === "rejected") {
        toast.error("Your application status has changed. Redirecting...");
        setTimeout(() => navigate("/application-rejected"), 2000);
      } else if (data.approval_status === "pending") {
        toast.info("Your application is incomplete. Redirecting to complete profile...");
        setTimeout(() => navigate("/complete-profile"), 2000);
      }

      if (manual) {
        toast.success("Status refreshed successfully");
      }

    } catch (error) {
      console.error("Failed to check approval status:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error("Failed to check approval status");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Not specified";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading && !approvalData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Checking your approval status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-indigo-600">Application Status</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => checkApprovalStatus(true)}
                disabled={refreshing}
                className={`p-2 rounded-full transition-colors ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Status"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${
                  darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 mb-8`}
        >
          {/* Status Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <Clock className="text-yellow-600" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-yellow-600 mb-2">Pending Admin Approval</h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your application is currently under review by our admin team
            </p>
          </div>

          {/* Status Details */}
          {approvalData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="text-indigo-600 mr-2" size={20} />
                  Application Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Profile Completion:</span>
                    <span className="font-medium text-green-600">
                      {approvalData.profile_completion_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Documents Uploaded:</span>
                    <span className="font-medium">
                      {approvalData.documents_uploaded} / {approvalData.documents_required}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Submitted:</span>
                    <span className="font-medium">
                      {getTimeAgo(approvalData.submission_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Calendar className="text-indigo-600 mr-2" size={20} />
                  Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-green-600" size={16} />
                    <span>Application submitted</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-yellow-600 rounded-full animate-pulse"></div>
                    <span className="text-yellow-600 font-medium">Under admin review</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 rounded-full ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Approval decision</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">What's Happening Now?</h3>
                  <p className="text-sm text-blue-700">
                    Our admin team is reviewing your profile, specializations, availability slots, and uploaded documents 
                    to ensure everything meets our quality standards.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                <Clock className="text-green-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-green-800 mb-2">Expected Timeline</h3>
                  <p className="text-sm text-green-700">
                    Most applications are reviewed within 3-5 business days. You'll receive an email notification 
                    once the review is complete.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`mt-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className="font-semibold mb-3 flex items-center">
              <Mail className="text-indigo-600 mr-2" size={20} />
              Need Help?
            </h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              If you have questions about your application or need to update any information, please contact our support team:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:support@mindmate.com"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                <Mail size={16} />
                <span>support@mindmate.com</span>
              </a>
              <a
                href="tel:+92-XXX-XXXXXXX"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                <Phone size={16} />
                <span>+92-XXX-XXXXXXX</span>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => checkApprovalStatus(true)}
              disabled={refreshing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                refreshing 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Checking...' : 'Check Status'}</span>
            </button>
            
            <button
              onClick={() => navigate("/complete-profile")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              View Application
            </button>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <User className="text-indigo-600 mr-2" size={20} />
            While You Wait...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📚 Prepare for Success</h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Familiarize yourself with our platform features and best practices for patient interaction.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔔 Check Your Email</h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                We'll send you an email notification as soon as your application is reviewed.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📞 Stay Available</h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Our team may contact you if we need additional information about your application.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpecialistPendingApproval;
