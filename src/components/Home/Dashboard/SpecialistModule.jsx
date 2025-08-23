import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  DollarSign,
  User,
  Calendar,
  ChevronRight,
  Loader
} from "react-feather";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SpecialistModule = ({ darkMode }) => {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    consultation_mode: "online",
    specializations: [],
    city: "",
    budget_max: "",
    sort_by: "best_match"
  });
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [notification, setNotification] = useState(null);

  const consultationModes = [
    { value: "online", label: "Online", icon: "💻" },
    { value: "in_person", label: "In Person", icon: "🏢" },
    { value: "hybrid", label: "Both", icon: "🔄" }
  ];

  const specializations = [
    "Anxiety Disorders", "Depression", "Trauma & PTSD", "Couples Therapy",
    "Family Therapy", "Addiction Recovery", "Eating Disorders", "ADHD",
    "Bipolar Disorder", "OCD", "Grief Counseling"
  ];

  const sortOptions = [
    { value: "best_match", label: "Best Match" },
    { value: "rating_high", label: "Highest Rated" },
    { value: "fee_low", label: "Lowest Fee" },
    { value: "experience_high", label: "Most Experienced" }
  ];

  const searchSpecialists = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Use the SMA search endpoint but with minimal filters
      const params = new URLSearchParams({
        page: 1,
        size: 50  // Get more results
      });

      console.log("Searching specialists with minimal filters");
      const response = await axios.get(`${API_URL}/api/specialists/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("SMA search response:", response.data);
      setSpecialists(response.data.specialists || []);
    } catch (error) {
      console.error("Error searching specialists:", error);
      // Fallback to empty array
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/api/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        setAppointments(response.data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const refreshAppointments = () => {
    fetchAppointments();
  };

  useEffect(() => {
    searchSpecialists();
    fetchAppointments();
  }, [filters]);

  // Check for appointment status updates and show notifications
  useEffect(() => {
    appointments.forEach(appointment => {
      if (appointment.status === 'confirmed' && appointment.previous_status !== 'confirmed') {
        // Show confirmation message
        setNotification({
          type: 'success',
          message: 'Your appointment with specialist has been confirmed!'
        });
        // Update the appointment to mark that we've shown the notification
        appointment.previous_status = 'confirmed';
        // Auto-clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      } else if (appointment.status === 'cancelled' && appointment.previous_status !== 'cancelled') {
        // Show rejection message
        setNotification({
          type: 'error',
          message: 'Your appointment request has been rejected by the specialist.'
        });
        // Update the appointment to mark that we've shown the notification
        appointment.previous_status = 'cancelled';
        // Auto-clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    });
  }, [appointments]);

  const handleSpecializationToggle = (specialization) => {
    setFilters(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const openSpecialistModal = (specialist) => {
    setSelectedSpecialist(specialist);
    setShowSpecialistModal(true);
  };

  const bookAppointment = async (specialistId) => {
    try {
      const confirmed = window.confirm("Send details to specialist and book appointment?");
      if (!confirmed) return;

      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_URL}/api/appointments/request`,
        {
          specialist_id: specialistId,
          consultation_mode: "online",
          notes: "Appointment request from patient dashboard"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        alert("Appointment request sent successfully! Awaiting specialist approval.");
        // Refresh both specialists list and appointments to show updated status
        searchSpecialists();
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error requesting appointment:", error);
      alert("Failed to request appointment. Please try again.");
    }
  };

  const renderSpecialistCard = (specialist) => {
    // Check if there's already a pending appointment with this specialist
    const hasPendingAppointment = appointments.some(
      appointment => {
        // Convert both to strings for comparison to handle UUID vs string mismatches
        const appointmentSpecialistId = String(appointment.specialist_id);
        const specialistId = String(specialist.id);
        const isMatch = appointmentSpecialistId === specialistId;
        const isPending = appointment.status === 'pending_approval';
        
        // Debug logging for this specific comparison
        if (isMatch && isPending) {
          console.log('Found pending appointment:', {
            appointment_id: appointment.id,
            specialist_id: appointmentSpecialistId,
            specialist_name: specialist.full_name,
            status: appointment.status
          });
        }
        
        return isMatch && isPending;
      }
    );

    return (
    <motion.div
      key={specialist.id}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`p-6 rounded-xl shadow-lg border transition-all duration-200 cursor-pointer ${
        darkMode 
          ? "bg-gray-800/80 border-gray-700 hover:border-indigo-500" 
          : "bg-white/80 border-gray-200 hover:border-indigo-300"
      }`}
      onClick={() => openSpecialistModal(specialist)}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
          darkMode ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"
        }`}>
          {specialist.full_name ? specialist.full_name.charAt(0) : "S"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                {specialist.full_name || "Specialist"}
              </h3>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                {specialist.specialist_type || "Mental Health Professional"}
              </p>
            </div>
            
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {specialist.average_rating || "4.5"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {specialist.city || "Online"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {specialist.years_experience || "5"}+ years
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                PKR {specialist.consultation_fee || "3000"}/session
              </span>
            </div>
          </div>

          {specialist.specializations && specialist.specializations.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {specialist.specializations.slice(0, 3).map((spec, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {spec}
                  </span>
                ))}
                {specialist.specializations.length > 3 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                  }`}>
                    +{specialist.specializations.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {hasPendingAppointment ? (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-yellow-600 text-white">
                <Clock className="h-4 w-4" />
                <span>Pending Approval</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  bookAppointment(specialist.id);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment</span>
              </button>
            )}
            
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <span className="text-sm font-medium">View Profile</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          Find Mental Health Specialists
        </h1>
        <p className={`text-lg ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}>
          Connect with qualified mental health professionals
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
            : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-sm font-medium hover:opacity-70"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={`mb-6 p-6 rounded-xl shadow-lg ${
        darkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"
      }`}>
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialization, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
              onKeyPress={(e) => e.key === 'Enter' && searchSpecialists()}
            />
          </div>
          
          <button
            onClick={searchSpecialists}
            className="px-6 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-lg transition-colors ${
              darkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {consultationModes.map(mode => (
            <button
              key={mode.value}
              onClick={() => setFilters(prev => ({ ...prev, consultation_mode: mode.value }))}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.consultation_mode === mode.value
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Max Budget (PKR)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  value={filters.budget_max}
                  onChange={(e) => setFilters(prev => ({ ...prev, budget_max: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Sort By
                </label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {specializations.map(specialization => (
                  <button
                    key={specialization}
                    onClick={() => handleSpecializationToggle(specialization)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.specializations.includes(specialization)
                        ? "bg-indigo-600 text-white"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {specialization}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            {loading ? "Searching..." : `${specialists.length} specialists found`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader className="h-6 w-6 animate-spin text-indigo-600" />
              <span className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Finding the best specialists for you...
              </span>
            </div>
          </div>
        ) : specialists.length > 0 ? (
          <div className="space-y-6">
            {specialists.map(renderSpecialistCard)}
          </div>
        ) : (
          <div className={`text-center py-12 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No specialists found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Appointments Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            My Appointment Requests
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAppointments(!showAppointments)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {showAppointments ? "Hide" : "Show"} Appointments
            </button>
            {showAppointments && (
              <button
                onClick={refreshAppointments}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Refresh
              </button>
            )}
          </div>
        </div>

        {showAppointments && (
          <div className={`p-6 rounded-xl shadow-lg ${
            darkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"
          }`}>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          Appointment #{appointment.id.slice(0, 8)}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                          Status: <span className={`font-medium ${
                            appointment.status === 'pending_approval' ? 'text-yellow-500' :
                            appointment.status === 'confirmed' ? 'text-green-500' :
                            appointment.status === 'cancelled' ? 'text-red-500' :
                            'text-gray-500'
                          }`}>
                            {appointment.status === 'pending_approval' ? 'Awaiting Approval' :
                             appointment.status === 'confirmed' ? 'Confirmed' :
                             appointment.status === 'cancelled' ? 'Cancelled' :
                             appointment.status}
                          </span>
                        </p>
                        {appointment.notes && (
                          <p className={`text-sm mt-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {new Date(appointment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No appointment requests yet</p>
                <p className="text-sm">Book an appointment with a specialist to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Specialist Detail Modal */}
      {showSpecialistModal && selectedSpecialist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  Specialist Profile
                </h2>
                <button
                  onClick={() => setShowSpecialistModal(false)}
                  className={`p-2 rounded-full ${
                    darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start space-x-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                    darkMode ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"
                  }`}>
                    {selectedSpecialist.full_name ? selectedSpecialist.full_name.charAt(0) : "S"}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedSpecialist.full_name || "Specialist"}
                    </h3>
                    <p className={`text-lg mb-4 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {selectedSpecialist.specialist_type || "Mental Health Professional"}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className={`font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedSpecialist.average_rating || "4.5"} Rating
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedSpecialist.years_experience || "5"}+ Years
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {selectedSpecialist.city || "Online"}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <span className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          PKR {selectedSpecialist.consultation_fee || "3000"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {selectedSpecialist.specializations && (
                  <div>
                    <h4 className={`text-lg font-semibold mb-3 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpecialist.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedSpecialist.bio && (
                  <div>
                    <h4 className={`text-lg font-semibold mb-3 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      About
                    </h4>
                    <p className={`${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {selectedSpecialist.bio}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => {
                      bookAppointment(selectedSpecialist.id);
                      setShowSpecialistModal(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SpecialistModule;
