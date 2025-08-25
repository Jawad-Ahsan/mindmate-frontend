// src/components/Home/Dashboard/UserProfile.jsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  User,
  Edit2,
  Save,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  Shield,
} from "react-feather";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const UserProfile = ({ darkMode }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData(response.data);
      setFormData({
        patient: { ...response.data.patient },
        questionnaire: response.data.questionnaire ? { ...response.data.questionnaire } : {}
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      await axios.put(`${API_URL}/api/users/patient/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh data after successful update
      await fetchProfileData();
      setIsEditing(false);
      setHasChanges(false);
      setError(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setFormData({
        patient: { ...profileData.patient },
        questionnaire: profileData.questionnaire ? { ...profileData.questionnaire } : {}
      });
      setHasChanges(false);
    }
    setIsEditing(!isEditing);
  };

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

  if (loading) {
    return (
      <div
        className={`h-full flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`h-full flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div
        className={`h-full flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50"
        }`}
      >
        <p>No profile data available</p>
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
      {/* Header with Edit/Save buttons */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          Patient Profile
        </h1>
        <div className="flex gap-3">
          {isEditing && hasChanges && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
            >
              <Save size={16} /> Save Info
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Edit2 size={16} /> {isEditing ? "Cancel" : "Edit Profile"}
          </motion.button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Personal Information Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}>
            <User size={20} /> Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patient?.first_name || ""}
                  onChange={(e) => handleInputChange("patient", "first_name", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.patient?.first_name || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patient?.last_name || ""}
                  onChange={(e) => handleInputChange("patient", "last_name", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.patient?.last_name || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Email
              </label>
              <p className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}>
                {profileData.patient?.email || "Not provided"}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patient?.phone || ""}
                  onChange={(e) => handleInputChange("patient", "phone", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.patient?.phone || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Age
              </label>
              <p className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}>
                {profileData.patient?.age || "Not provided"}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Gender
              </label>
              <p className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}>
                {profileData.patient?.gender || "Not provided"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Address Information Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-green-400" : "text-green-600"
          }`}>
            <MapPin size={20} /> Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patient?.city || ""}
                  onChange={(e) => handleInputChange("patient", "city", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.patient?.city || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                District
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patient?.district || ""}
                  onChange={(e) => handleInputChange("patient", "district", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.patient?.district || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Province
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patient?.province || ""}
                  onChange={(e) => handleInputChange("patient", "province", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.patient?.province || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Country
              </label>
              <p className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}>
                {profileData.patient?.country || "Pakistan"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mandatory Questionnaire Section - Always Show */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-purple-400" : "text-purple-600"
          }`}>
            <FileText size={20} /> Health Assessment Questionnaire
          </h3>
          
          <div className="space-y-6">
            {/* Chief Complaint */}
            <div>
              <h4 className={`text-lg font-medium mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Chief Complaint
              </h4>
              {isEditing ? (
                <textarea
                  value={formData.questionnaire?.chief_complaint || ""}
                  onChange={(e) => handleInputChange("questionnaire", "chief_complaint", e.target.value)}
                  rows={3}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Describe your main concern..."
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.questionnaire?.chief_complaint || "Not provided"}
                </p>
              )}
            </div>

            {/* Medical History */}
            <div>
              <h4 className={`text-lg font-medium mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Medical History
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Current Medications
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.questionnaire?.current_medications || ""}
                      onChange={(e) => handleInputChange("questionnaire", "current_medications", e.target.value)}
                      rows={2}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="List current medications..."
                    />
                  ) : (
                    <p className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {profileData.questionnaire?.current_medications || "None"}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Chronic Illnesses
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.questionnaire?.chronic_illnesses || ""}
                      onChange={(e) => handleInputChange("questionnaire", "chronic_illnesses", e.target.value)}
                      rows={2}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="List any chronic conditions..."
                    />
                  ) : (
                    <p className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {profileData.questionnaire?.chronic_illnesses || "None"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Substance Use */}
            <div>
              <h4 className={`text-lg font-medium mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Substance Use
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Tobacco Use
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.questionnaire?.tobacco_use || ""}
                      onChange={(e) => handleInputChange("questionnaire", "tobacco_use", e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="">Select...</option>
                      <option value="never">Never</option>
                      <option value="former">Former</option>
                      <option value="current">Current</option>
                    </select>
                  ) : (
                    <p className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {profileData.questionnaire?.tobacco_use || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Alcohol Use
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.questionnaire?.alcohol_use || ""}
                      onChange={(e) => handleInputChange("questionnaire", "alcohol_use", e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="">Select...</option>
                      <option value="never">Never</option>
                      <option value="occasional">Occasional</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  ) : (
                    <p className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {profileData.questionnaire?.alcohol_use || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Activity Level
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.questionnaire?.lifestyle_activity || ""}
                      onChange={(e) => handleInputChange("questionnaire", "lifestyle_activity", e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="">Select...</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="lightly_active">Lightly Active</option>
                      <option value="moderately_active">Moderately Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  ) : (
                    <p className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {profileData.questionnaire?.lifestyle_activity || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Family History */}
            <div>
              <h4 className={`text-lg font-medium mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Family Mental Health History
              </h4>
              {isEditing ? (
                <textarea
                  value={formData.questionnaire?.family_mental_health_history || ""}
                  onChange={(e) => handleInputChange("questionnaire", "family_mental_health_history", e.target.value)}
                  rows={3}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Describe any family history of mental health conditions..."
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.questionnaire?.family_mental_health_history || "None reported"}
                </p>
              )}
            </div>
                     </div>
         </motion.div>

        {/* Emergency Support Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl border-l-4 ${
          darkMode
            ? "bg-gray-800 border-yellow-500"
            : "bg-white border-yellow-400"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 ${
            darkMode ? "text-yellow-400" : "text-yellow-600"
          }`}>
            <Shield size={20} /> Emergency Support
          </h3>
          <p className={`mt-2 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
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
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
