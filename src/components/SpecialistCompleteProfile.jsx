import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Clock,
  Globe,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  Sun,
  Moon,
  Save,
  Send
} from "react-feather";
import { toast } from "react-hot-toast";

const SpecialistCompleteProfile = () => {
  const [profileData, setProfileData] = useState({
    phone: "",
    address: "",
    clinic_name: "",
    bio: "",
    consultation_fee: "",
    languages_spoken: [],
    website_url: "",
    social_media_links: {},
    specializations: []
  });

  const [specializationData, setSpecializationData] = useState({
    specialization: "",
    years_of_experience: "",
    is_primary: false,
    certification_date: ""
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  // Check authentication and get current specialist info
  useEffect(() => {
    const checkAuth = async () => {
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

        // If profile is complete and approved, redirect to dashboard
        if (response.data.profile_complete && response.data.approval_status === "approved") {
          navigate("/specialist-dashboard");
          return;
        }

        // Load existing profile data if available
        if (response.data.phone) setProfileData(prev => ({ ...prev, phone: response.data.phone }));
        if (response.data.address) setProfileData(prev => ({ ...prev, address: response.data.address }));
        if (response.data.clinic_name) setProfileData(prev => ({ ...prev, clinic_name: response.data.clinic_name }));
        if (response.data.bio) setProfileData(prev => ({ ...prev, bio: response.data.bio }));
        if (response.data.consultation_fee) setProfileData(prev => ({ ...prev, consultation_fee: response.data.consultation_fee }));
        if (response.data.languages_spoken) setProfileData(prev => ({ ...prev, languages_spoken: response.data.languages_spoken }));
        if (response.data.website_url) setProfileData(prev => ({ ...prev, website_url: response.data.website_url }));
        if (response.data.social_media_links) setProfileData(prev => ({ ...prev, social_media_links: response.data.social_media_links }));

      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, API_URL]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setProfileData(prev => ({
        ...prev,
        languages_spoken: [...prev.languages_spoken, value]
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        languages_spoken: prev.languages_spoken.filter(lang => lang !== value)
      }));
    }
  };

  const addSpecialization = () => {
    if (!specializationData.specialization || !specializationData.years_of_experience) {
      toast.error("Please fill in specialization and years of experience");
      return;
    }

    // Check if this is the first specialization (make it primary)
    if (profileData.specializations.length === 0) {
      specializationData.is_primary = true;
    }

    setProfileData(prev => ({
      ...prev,
      specializations: [...prev.specializations, { ...specializationData }]
    }));

    setSpecializationData({
      specialization: "",
      years_of_experience: "",
      is_primary: false,
      certification_date: ""
    });
  };

  const removeSpecialization = (index) => {
    setProfileData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const setPrimarySpecialization = (index) => {
    setProfileData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => ({
        ...spec,
        is_primary: i === index
      }))
    }));
  };

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.phone) newErrors.phone = "Phone number is required";
    if (!profileData.address) newErrors.address = "Address is required";
    if (!profileData.bio) newErrors.bio = "Bio is required";
    if (!profileData.consultation_fee) newErrors.consultation_fee = "Consultation fee is required";
    if (profileData.languages_spoken.length === 0) newErrors.languages_spoken = "At least one language is required";
    if (profileData.specializations.length === 0) newErrors.specializations = "At least one specialization is required";
    
    // Check if exactly one specialization is primary
    const primaryCount = profileData.specializations.filter(spec => spec.is_primary).length;
    if (primaryCount !== 1) {
      newErrors.specializations = "Exactly one specialization must be marked as primary";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Prepare the request payload
      const payload = {
        phone: profileData.phone,
        address: profileData.address,
        clinic_name: profileData.clinic_name || null,
        bio: profileData.bio,
        consultation_fee: parseFloat(profileData.consultation_fee),
        languages_spoken: profileData.languages_spoken,
        website_url: profileData.website_url || null,
        social_media_links: profileData.social_media_links || {},
        specializations: profileData.specializations.map(spec => ({
          specialization: spec.specialization,
          years_of_experience_in_specialization: parseInt(spec.years_of_experience),
          is_primary_specialization: spec.is_primary,
          certification_date: spec.certification_date || null
        }))
      };
      
      console.log("DEBUG: Sending profile data:", payload);
      console.log("DEBUG: Profile data state:", profileData);
      
      const response = await axios.post(
        `${API_URL}/api/specialist/complete-profile`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Profile saved successfully!");
      setActiveTab("documents");
    } catch (error) {
      console.error("Profile save error:", error);
      
      // Handle validation errors specifically
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        console.error("Validation errors:", errorData);
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Show each validation error
          errorData.errors.forEach(err => {
            toast.error(err);
          });
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error("Validation error occurred");
        }
      } else {
        toast.error(error.response?.data?.detail || "Failed to save profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported. Please upload PDF, JPG, PNG, DOC, or DOCX");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'license'); // Default to license, can be made configurable
    formData.append('document_name', file.name);

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await axios.post(
        `${API_URL}/api/specialist/submit-documents`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success("Document uploaded successfully!");
      setDocuments(prev => [...prev, {
        id: response.data.document_id,
        name: response.data.document_name,
        type: 'license',
        status: 'pending',
        uploaded_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error(error.response?.data?.detail || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const removeDocument = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const submitForApproval = () => {
    if (documents.length === 0) {
      toast.error("Please upload at least one document before submitting for approval");
      return;
    }
    
    toast.success("Your application has been submitted for admin approval!");
    // In a real app, you might want to make an API call here to notify admins
    // For now, we'll just show a success message
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-indigo-600">Complete Your Profile</h1>
            <div className="flex items-center space-x-3">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "profile"
                ? 'bg-indigo-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "documents"
                ? 'bg-indigo-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
          >
            <h2 className="text-xl font-semibold mb-6">Professional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="+92XXXXXXXXXX"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-300'
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    placeholder="Enter your complete address"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.address
                        ? 'border-red-500 focus:ring-red-300'
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Clinic Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Clinic Name (Optional)</label>
                <input
                  type="text"
                  name="clinic_name"
                  value={profileData.clinic_name}
                  onChange={handleProfileChange}
                  placeholder="Enter clinic or practice name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    darkMode
                      ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium mb-2">Consultation Fee (PKR)</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={profileData.consultation_fee}
                  onChange={handleProfileChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.consultation_fee
                      ? 'border-red-500 focus:ring-red-300'
                      : darkMode
                      ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.consultation_fee && <p className="text-red-500 text-sm mt-1">{errors.consultation_fee}</p>}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium mb-2">Website URL (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="url"
                    name="website_url"
                    value={profileData.website_url}
                    onChange={handleProfileChange}
                    placeholder="https://yourwebsite.com"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Professional Biography</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows={4}
                placeholder="Tell us about your professional background, expertise, and approach to mental health care..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.bio
                    ? 'border-red-500 focus:ring-red-300'
                    : darkMode
                    ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
            </div>

            {/* Languages */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Languages Spoken</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'en', label: 'English' },
                  { value: 'ur', label: 'Urdu' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'ar', label: 'Arabic' },
                  { value: 'ps', label: 'Pashto' },
                  { value: 'sd', label: 'Sindhi' },
                  { value: 'bal', label: 'Balochi' }
                ].map(lang => (
                  <label key={lang.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={lang.value}
                      checked={profileData.languages_spoken.includes(lang.value)}
                      onChange={handleLanguageChange}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{lang.label}</span>
                  </label>
                ))}
              </div>
              {errors.languages_spoken && <p className="text-red-500 text-sm mt-1">{errors.languages_spoken}</p>}
            </div>

            {/* Specializations */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Specializations</label>
              
              {/* Add Specialization Form */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={specializationData.specialization}
                    onChange={(e) => setSpecializationData(prev => ({ ...prev, specialization: e.target.value }))}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'border-gray-600 bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Select Specialization</option>
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

                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={specializationData.years_of_experience}
                    onChange={(e) => setSpecializationData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                    min="0"
                    max="50"
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'border-gray-600 bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />

                  <input
                    type="date"
                    placeholder="Certification Date"
                    value={specializationData.certification_date}
                    onChange={(e) => setSpecializationData(prev => ({ ...prev, certification_date: e.target.value }))}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'border-gray-600 bg-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />

                  <button
                    onClick={addSpecialization}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Specializations List */}
              <div className="space-y-3">
                {profileData.specializations.map((spec, index) => (
                  <div
                    key={index}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setPrimarySpecialization(index)}
                        className={`p-2 rounded-full ${
                          spec.is_primary
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {spec.is_primary ? <CheckCircle size={16} /> : <Award size={16} />}
                      </button>
                      <div>
                        <p className="font-medium capitalize">{spec.specialization.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">{spec.years_of_experience} years experience</p>
                        {spec.certification_date && (
                          <p className="text-sm text-gray-600">Certified: {spec.certification_date}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSpecialization(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.specializations && <p className="text-red-500 text-sm mt-1">{errors.specializations}</p>}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}
          >
            <h2 className="text-xl font-semibold mb-6">Required Documents</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Please upload the following documents for verification:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Professional license or certification</li>
                <li>Degree certificate</li>
                <li>Identity verification document</li>
                <li>Experience letters (if applicable)</li>
              </ul>
            </div>

            {/* Document Upload */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 border-2 border-dashed border-gray-300`}>
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="document-upload"
                    type="file"
                    onChange={handleDocumentUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, JPG, PNG, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 flex items-center justify-between`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="text-indigo-600" size={20} />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">Status: {doc.status}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit for Approval */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={submitForApproval}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Send size={20} />
                <span>Submit for Approval</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SpecialistCompleteProfile;

