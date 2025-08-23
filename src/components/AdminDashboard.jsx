import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Trash2,
  LogOut,
  User,
  Mail,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Sun,
  Moon,
  FileText,
  Globe
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
  const [activeTab, setActiveTab] = useState("patients");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to permanently delete this patient? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/api/admin/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove patient from list
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

      // Update specialist status in list
      setSpecialists(specialists.map(specialist => 
        specialist.id === specialistId 
          ? { ...specialist, approval_status: "approved" }
          : specialist
      ));
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

      // Remove specialist from list
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

      // Update specialist status in list
      setSpecialists(specialists.map(specialist => 
        specialist.id === specialistId 
          ? { ...specialist, approval_status: "suspended" }
          : specialist
      ));
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

      // Update specialist status in list
      setSpecialists(specialists.map(specialist => 
        specialist.id === specialistId 
          ? { ...specialist, approval_status: "approved" }
          : specialist
      ));
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

      // Remove specialist from list
      setSpecialists(specialists.filter(specialist => specialist.id !== specialistId));
    } catch (error) {
      console.error("Error deleting specialist:", error);
      setError("Failed to delete specialist");
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

      // Refresh reports
      fetchReports();
      setError("");
    } catch (error) {
      console.error(`Error ${actionText}ing report:`, error);
      setError(`Failed to ${actionText} report`);
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
    <div className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900"}`}>
      {/* Enhanced Header */}
      <header className={`border-b backdrop-blur-sm ${darkMode ? "border-gray-700 bg-gray-800/90" : "border-gray-200 bg-white/90"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${darkMode ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`}>
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Manage your MindMate platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {adminInfo && (
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{adminInfo.full_name}</span>
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
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
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
                Patients ({patients.length})
              </button>
              <button
                onClick={() => setActiveTab("specialists")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "specialists"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Specialists ({specialists.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reports"
                    ? darkMode
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-500 text-indigo-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reports ({reports.filter(r => r.status === "pending").length})
              </button>
            </nav>
          </div>
        </div>

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

        {/* Patients Table */}
        {activeTab === "patients" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Registered Patients
            </h2>
          </div>
          
          {patients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No patients registered yet.
              </p>
            </div>
          ) : (
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
                           {patient.date_of_birth && (
                             <div className="flex items-center text-sm">
                               <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                               <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                 {new Date(patient.date_of_birth).toLocaleDateString()}
                               </span>
                             </div>
                           )}
                           {(patient.city || patient.district || patient.province) && (
                             <div className="flex items-center text-sm">
                               <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                               <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                 {[patient.city, patient.district, patient.province, patient.country].filter(Boolean).join(", ")}
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
                          onClick={() => handleDeletePatient(patient.id)}
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
          )}
        </div>
        )}

        {/* Specialists Table */}
        {activeTab === "specialists" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Registered Specialists
              </h2>
            </div>
            
            {specialists.length === 0 ? (
              <div className="p-8 text-center">
                <User className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No specialists registered yet.
                </p>
              </div>
            ) : (
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
                        Professional Info
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                        Specializations & Documents
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
                            {specialist.specialist_type && (
                              <div className="flex items-center text-sm">
                                <Award className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  {specialist.specialist_type.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                            {specialist.years_experience !== undefined && (
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  {specialist.years_experience} years experience
                                </span>
                              </div>
                            )}
                            {specialist.city && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  {specialist.city}
                                </span>
                              </div>
                            )}
                            {specialist.address && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  {specialist.address}
                                </span>
                              </div>
                            )}
                            {specialist.clinic_name && (
                              <div className="flex items-center text-sm">
                                <Award className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  {specialist.clinic_name}
                                </span>
                              </div>
                            )}
                            {specialist.consultation_fee && (
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  PKR {specialist.consultation_fee}
                                </span>
                              </div>
                            )}
                            {specialist.bio && (
                              <div className="flex items-start text-sm mt-2">
                                <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"} title={specialist.bio}>
                                  {specialist.bio.length > 100 ? specialist.bio.substring(0, 100) + '...' : specialist.bio}
                                </span>
                              </div>
                            )}
                            {specialist.languages_spoken && specialist.languages_spoken.length > 0 && (
                              <div className="flex items-center text-sm mt-2">
                                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                                  Languages: {specialist.languages_spoken.join(', ')}
                                </span>
                              </div>
                            )}
                            {specialist.website_url && (
                              <div className="flex items-center text-sm mt-2">
                                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                <a 
                                  href={specialist.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"} underline`}
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {/* Specializations */}
                            {specialist.specializations && specialist.specializations.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">Specializations:</div>
                                {specialist.specializations.map((spec, idx) => (
                                  <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {spec.specialization?.replace('_', ' ') || 'N/A'} 
                                    ({spec.years_of_experience_in_specialization} years)
                                    {spec.is_primary_specialization && ' - Primary'}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Documents */}
                            {specialist.documents && specialist.documents.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">Documents:</div>
                                {specialist.documents.map((doc, idx) => (
                                  <div key={idx} className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                                    {doc.document_name} ({doc.document_type || 'N/A'})
                                    <div className="text-xs text-gray-500">
                                      Status: {doc.verification_status || 'Pending'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {(!specialist.specializations || specialist.specializations.length === 0) && 
                             (!specialist.documents || specialist.documents.length === 0) && (
                              <div className="text-xs text-gray-500 italic">No data available</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {specialist.approval_status === "approved" ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : specialist.approval_status === "rejected" ? (
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                            )}
                            <span className={`text-sm ${
                              specialist.approval_status === "approved" 
                                ? "text-green-600" 
                                : specialist.approval_status === "rejected"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}>
                              {specialist.approval_status?.toUpperCase() || "PENDING"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {specialist.approval_status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveSpecialist(specialist.id)}
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
                                  onClick={() => handleRejectSpecialist(specialist.id)}
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
                              <>
                                <span className={`px-3 py-2 rounded-lg ${
                                  darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                                }`}>
                                  Approved
                                </span>
                                <button
                                  onClick={() => handleSuspendSpecialist(specialist.id)}
                                  className={`flex items-center space-x2 px-3 py-2 rounded-lg ${
                                    darkMode
                                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                      : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                  }`}
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  <span>Suspend</span>
                                </button>
                              </>
                            )}
                            {specialist.approval_status === "suspended" && (
                              <>
                                <span className={`px-3 py-2 rounded-lg ${
                                  darkMode ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  Suspended
                                </span>
                                <button
                                  onClick={() => handleUnsuspendSpecialist(specialist.id)}
                                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                    darkMode
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : "bg-green-500 hover:bg-green-600 text-white"
                                  }`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Unsuspend</span>
                                </button>
                              </>
                            )}
                            {specialist.approval_status === "rejected" && (
                              <>
                                <span className={`px-3 py-2 rounded-lg ${
                                  darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
                                }`}>
                                  Rejected
                                </span>
                                <button
                                  onClick={() => handleDeleteSpecialist(specialist.id)}
                                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                    darkMode
                                      ? "bg-red-600 hover:bg-red-700 text-white"
                                      : "bg-red-500 hover:bg-red-600 text-white"
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reports Table */}
        {activeTab === "reports" && (
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Forum Reports
              </h2>
            </div>
            
            {reports.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No reports submitted yet.
                </p>
              </div>
            ) : (
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
                                onClick={() => handleReportAction(report.id, "keep")}
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
                                onClick={() => handleReportAction(report.id, "remove")}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
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
            )}
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

export default AdminDashboard;
