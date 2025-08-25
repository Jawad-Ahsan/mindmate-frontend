"""
Enhanced Specialist Patients Module
==================================
Enhanced patients module with filtering capabilities for the specialist dashboard.
"""

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  RefreshCw,
  AlertCircle,
  Users,
  Activity,
  TrendingUp
} from "react-feather";
import { toast } from "react-hot-toast";

const EnhancedSpecialistPatientsModule = ({ darkMode, activeSidebarItem = "active" }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    searchQuery: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Status options for filtering
  const statusOptions = [
    { value: "all", label: "All Patients", color: "gray" },
    { value: "new", label: "New Patients", color: "blue" },
    { value: "active", label: "Active Patients", color: "green" },
    { value: "follow_up", label: "Follow-up", color: "purple" },
    { value: "discharged", label: "Discharged", color: "red" }
  ];

  // Load patients based on current sidebar selection and filters
  useEffect(() => {
    loadPatients();
  }, [activeSidebarItem, currentPage]);

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
          statusFilter = filters.status;
      }

      const requestData = {
        status: statusFilter,
        search_query: filters.searchQuery,
        page: currentPage,
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
      setTotalPages(Math.ceil(response.data.total_count / 20));
      setError("");
    } catch (err) {
      console.error("Error loading patients:", err);
      setError("Failed to load patients");
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadPatients();
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      searchQuery: ""
    });
    setCurrentPage(1);
    loadPatients();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPatients();
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : "gray";
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  if (loading && patients.length === 0) {
    return (
      <div className={`h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p>Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          My Patients
        </h1>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Manage your patient relationships and track their progress
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Search & Filters
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Filter size={16} />
            <span>{showFilters ? "Hide" : "Show"} Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Patient Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={applyFilters}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className={`px-4 py-2 ${
                  darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"
                } text-gray-900 rounded-lg transition-colors`}
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Patients List */}
      <div className={`rounded-lg ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={loadPatients}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No patients found with the current filters
            </p>
          </div>
        ) : (
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
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Actions
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
                        {patient.phone && (
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(patient.status)}-100 text-${getStatusColor(patient.status)}-800`}>
                        {getStatusLabel(patient.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {formatDate(patient.last_session_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {patient.total_sessions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewPatientDetails(patient)}
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {/* Edit patient */}}
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-100 hover:bg-blue-200"
                          }`}
                          title="Edit Patient"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className={`flex space-x-2 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg p-2 border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            
            <span className={`px-3 py-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-2xl w-full mx-4 rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Patient Details
                </h3>
                <button
                  onClick={() => setShowPatientDetails(false)}
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Name
                    </label>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Status
                    </label>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-${getStatusColor(selectedPatient.status)}-100 text-${getStatusColor(selectedPatient.status)}-800`}>
                      {getStatusLabel(selectedPatient.status)}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Email
                    </label>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedPatient.email}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Phone
                    </label>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedPatient.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Last Session
                    </label>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {formatDate(selectedPatient.last_session_date)}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Total Sessions
                    </label>
                    <p className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedPatient.total_sessions}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowPatientDetails(false)}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"
                    } text-gray-900`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSpecialistPatientsModule;
