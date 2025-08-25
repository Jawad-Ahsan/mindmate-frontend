// src/components/SpecialistProfile.jsx

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
  Briefcase,
  Award,
  Clock,
  Globe,
  Star,
  DollarSign,
  Home,
} from "react-feather";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SpecialistProfile = ({ darkMode }) => {
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

      const response = await axios.get(`${API_URL}/api/users/specialist/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData(response.data);
      setFormData({
        specialist: { ...response.data.specialist },
        approval_data: response.data.approval_data ? { ...response.data.approval_data } : {},
        specializations: response.data.specializations ? [...response.data.specializations] : [],
        availability_slots: response.data.availability_slots ? [...response.data.availability_slots] : []
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

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    setHasChanges(true);
  };

  const addArrayItem = (section, template) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
    setHasChanges(true);
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      await axios.put(`${API_URL}/api/users/specialist/profile`, formData, {
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
        specialist: { ...profileData.specialist },
        approval_data: profileData.approval_data ? { ...profileData.approval_data } : {},
        specializations: profileData.specializations ? [...profileData.specializations] : [],
        availability_slots: profileData.availability_slots ? [...profileData.availability_slots] : []
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
          Specialist Profile
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
                  value={formData.specialist?.first_name || ""}
                  onChange={(e) => handleInputChange("specialist", "first_name", e.target.value)}
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
                  {profileData.specialist?.first_name || "Not provided"}
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
                  value={formData.specialist?.last_name || ""}
                  onChange={(e) => handleInputChange("specialist", "last_name", e.target.value)}
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
                  {profileData.specialist?.last_name || "Not provided"}
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
                {profileData.specialist?.email || "Not provided"}
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
                  value={formData.specialist?.phone || ""}
                  onChange={(e) => handleInputChange("specialist", "phone", e.target.value)}
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
                  {profileData.specialist?.phone || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Gender
              </label>
              {isEditing ? (
                <select
                  value={formData.specialist?.gender || ""}
                  onChange={(e) => handleInputChange("specialist", "gender", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.specialist?.gender || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialist?.city || ""}
                  onChange={(e) => handleInputChange("specialist", "city", e.target.value)}
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
                  {profileData.specialist?.city || "Not provided"}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Professional Information Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-green-400" : "text-green-600"
          }`}>
            <Briefcase size={20} /> Professional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Specialist Type
              </label>
              {isEditing ? (
                <select
                  value={formData.specialist?.specialist_type || ""}
                  onChange={(e) => handleInputChange("specialist", "specialist_type", e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="psychiatrist">Psychiatrist</option>
                  <option value="psychologist">Psychologist</option>
                  <option value="counselor">Counselor</option>
                  <option value="therapist">Therapist</option>
                  <option value="social_worker">Social Worker</option>
                </select>
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.specialist?.specialist_type || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Years of Experience
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.specialist?.years_experience || ""}
                  onChange={(e) => handleInputChange("specialist", "years_experience", parseInt(e.target.value) || 0)}
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
                  {profileData.specialist?.years_experience || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Consultation Fee
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.specialist?.consultation_fee || ""}
                  onChange={(e) => handleInputChange("specialist", "consultation_fee", parseFloat(e.target.value) || 0)}
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
                  {profileData.specialist?.consultation_fee ? `$${profileData.specialist.consultation_fee}` : "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Clinic Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.specialist?.clinic_name || ""}
                  onChange={(e) => handleInputChange("specialist", "clinic_name", e.target.value)}
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
                  {profileData.specialist?.clinic_name || "Not provided"}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.specialist?.bio || ""}
                  onChange={(e) => handleInputChange("specialist", "bio", e.target.value)}
                  rows={4}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Tell us about your professional background and approach..."
                />
              ) : (
                <p className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                }`}>
                  {profileData.specialist?.bio || "Not provided"}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Specializations Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-purple-400" : "text-purple-600"
          }`}>
            <Award size={20} /> Specializations
          </h3>
          
          <div className="space-y-4">
            {formData.specializations?.map((spec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Specialization
                    </label>
                    {isEditing ? (
                      <select
                        value={spec.specialization || ""}
                        onChange={(e) => handleArrayChange("specializations", index, "specialization", e.target.value)}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="">Select...</option>
                        <option value="anxiety_disorders">Anxiety Disorders</option>
                        <option value="depression">Depression</option>
                        <option value="trauma_ptsd">Trauma & PTSD</option>
                        <option value="couples_therapy">Couples Therapy</option>
                        <option value="family_therapy">Family Therapy</option>
                        <option value="addiction">Addiction</option>
                        <option value="eating_disorders">Eating Disorders</option>
                        <option value="adhd">ADHD</option>
                        <option value="bipolar_disorder">Bipolar Disorder</option>
                        <option value="ocd">OCD</option>
                        <option value="personality_disorders">Personality Disorders</option>
                        <option value="grief_counseling">Grief Counseling</option>
                      </select>
                    ) : (
                      <p className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-700"
                      }`}>
                        {spec.specialization || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Years of Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={spec.years_of_experience || 0}
                        onChange={(e) => handleArrayChange("specializations", index, "years_of_experience", parseInt(e.target.value) || 0)}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    ) : (
                      <p className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-700"
                      }`}>
                        {spec.years_of_experience || "0"} years
                      </p>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Primary
                      </label>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={spec.is_primary || false}
                          onChange={(e) => handleArrayChange("specializations", index, "is_primary", e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      ) : (
                        <p className={`p-3 rounded-lg ${
                          darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-700"
                        }`}>
                          {spec.is_primary ? "Yes" : "No"}
                        </p>
                      )}
                    </div>
                    
                    {isEditing && (
                      <button
                        onClick={() => removeArrayItem("specializations", index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isEditing && (
              <button
                onClick={() => addArrayItem("specializations", {
                  specialization: "",
                  years_of_experience: 0,
                  is_primary: false
                })}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
              >
                + Add Specialization
              </button>
            )}
          </div>
        </motion.div>

        {/* Availability Slots Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-orange-400" : "text-orange-600"
          }`}>
            <Clock size={20} /> Availability Time Slots
          </h3>
          
          <div className="space-y-4">
            {formData.availability_slots?.map((slot, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Time Slot
                    </label>
                    {isEditing ? (
                      <select
                        value={slot.time_slot || ""}
                        onChange={(e) => handleArrayChange("availability_slots", index, "time_slot", e.target.value)}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="">Select...</option>
                        <option value="09:00-10:00">9:00 AM - 10:00 AM</option>
                        <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                        <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                        <option value="12:00-13:00">12:00 PM - 1:00 PM</option>
                        <option value="13:00-14:00">1:00 PM - 2:00 PM</option>
                        <option value="14:00-15:00">2:00 PM - 3:00 PM</option>
                        <option value="15:00-16:00">3:00 PM - 4:00 PM</option>
                        <option value="16:00-17:00">4:00 PM - 5:00 PM</option>
                      </select>
                    ) : (
                      <p className={`p-3 rounded-lg ${
                        darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-700"
                      }`}>
                        {slot.display_time || slot.time_slot || "Not specified"}
                      </p>
                    )}
                  </div>
                  
                  {isEditing && (
                    <button
                      onClick={() => removeArrayItem("availability_slots", index)}
                      className="p-2 text-red-500 hover:text-red-700 ml-4"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isEditing && (
              <button
                onClick={() => addArrayItem("availability_slots", {
                  time_slot: "",
                  is_active: true
                })}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
              >
                + Add Time Slot
              </button>
            )}
          </div>
        </motion.div>

        {/* Professional Credentials Section */}
        {profileData.approval_data && (
          <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
              darkMode ? "text-indigo-400" : "text-indigo-600"
            }`}>
              <FileText size={20} /> Professional Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  License Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.approval_data?.license_number || ""}
                    onChange={(e) => handleInputChange("approval_data", "license_number", e.target.value)}
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
                    {profileData.approval_data?.license_number || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Highest Degree
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.approval_data?.highest_degree || ""}
                    onChange={(e) => handleInputChange("approval_data", "highest_degree", e.target.value)}
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
                    {profileData.approval_data?.highest_degree || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  University
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.approval_data?.university_name || ""}
                    onChange={(e) => handleInputChange("approval_data", "university_name", e.target.value)}
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
                    {profileData.approval_data?.university_name || "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Graduation Year
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.approval_data?.graduation_year || ""}
                    onChange={(e) => handleInputChange("approval_data", "graduation_year", parseInt(e.target.value) || None)}
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
                    {profileData.approval_data?.graduation_year || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div variants={itemVariants} className={`p-6 rounded-xl shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className={`text-xl font-semibold flex items-center gap-2 mb-4 ${
            darkMode ? "text-yellow-400" : "text-yellow-600"
          }`}>
            <Star size={20} /> Professional Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}>
                {profileData.specialist?.average_rating || "0.0"}
              </div>
              <div className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Average Rating
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}>
                {profileData.specialist?.total_reviews || "0"}
              </div>
              <div className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Total Reviews
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                darkMode ? "text-purple-400" : "text-purple-600"
              }`}>
                {profileData.specialist?.total_appointments || "0"}
              </div>
              <div className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Total Appointments
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                darkMode ? "text-orange-400" : "text-orange-600"
              }`}>
                {profileData.availability_slots?.length || "0"}
              </div>
              <div className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Available Time Slots
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SpecialistProfile;
