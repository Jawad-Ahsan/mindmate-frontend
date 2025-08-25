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
    specializations: [],
    availability_slots: []
  });

  const [specializationData, setSpecializationData] = useState({
    specialization: "",
    years_of_experience: "",
    is_primary: false,
    certification_date: ""
  });

  const [documents, setDocuments] = useState({
    identity_card: null,
    degree: null,
    license: null,
    experience_letter: null
  });
  const [mandatoryDocuments, setMandatoryDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Available time slots
  const timeSlots = [
    { value: "09:00-10:00", label: "9:00 AM - 10:00 AM" },
    { value: "10:00-11:00", label: "10:00 AM - 11:00 AM" },
    { value: "11:00-12:00", label: "11:00 AM - 12:00 PM" },
    { value: "12:00-13:00", label: "12:00 PM - 1:00 PM" },
    { value: "13:00-14:00", label: "1:00 PM - 2:00 PM" },
    { value: "14:00-15:00", label: "2:00 PM - 3:00 PM" },
    { value: "15:00-16:00", label: "3:00 PM - 4:00 PM" },
    { value: "16:00-17:00", label: "4:00 PM - 5:00 PM" }
  ];

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  // Fetch mandatory documents list
  useEffect(() => {
    const fetchMandatoryDocuments = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await axios.get(`${API_URL}/api/specialist/mandatory-documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMandatoryDocuments(response.data.documents);
      } catch (error) {
        console.error("Failed to fetch mandatory documents:", error);
      }
    };

    fetchMandatoryDocuments();
  }, [API_URL]);

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

  const handleAvailabilitySlotChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      if (profileData.availability_slots.length >= 8) {
        toast.error("Maximum 8 time slots allowed (8 hours per day)");
        e.target.checked = false;
        return;
      }
      setProfileData(prev => ({
        ...prev,
        availability_slots: [...prev.availability_slots, value]
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        availability_slots: prev.availability_slots.filter(slot => slot !== value)
      }));
    }
    
    // Clear availability error when user selects slots
    if (errors.availability_slots) {
      setErrors(prev => ({ ...prev, availability_slots: "" }));
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
    
    // Required field validation
    if (!profileData.phone || !profileData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!profileData.address || !profileData.address.trim()) newErrors.address = "Address is required";
    
    // Bio validation with word count
    if (!profileData.bio || !profileData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else {
      const words = profileData.bio.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length < 20) {
        newErrors.bio = `Bio must contain at least 20 words. Currently has ${words.length} words.`;
      }
    }
    
    if (!profileData.consultation_fee || parseFloat(profileData.consultation_fee) <= 0) {
      newErrors.consultation_fee = "Consultation fee must be greater than 0";
    }
    
    // Optional field validation - if provided, should not be empty
    if (profileData.clinic_name && !profileData.clinic_name.trim()) {
      newErrors.clinic_name = "Clinic name cannot be empty if provided";
    }
    if (profileData.website_url && !profileData.website_url.trim()) {
      newErrors.website_url = "Website URL cannot be empty if provided";
    }
    
    if (profileData.languages_spoken.length === 0) newErrors.languages_spoken = "At least one language is required";
    if (profileData.specializations.length === 0) newErrors.specializations = "At least one specialization is required";
    
    // Availability slots validation
    if (profileData.availability_slots.length === 0) {
      newErrors.availability_slots = "At least one availability slot is required";
    } else if (profileData.availability_slots.length > 8) {
      newErrors.availability_slots = "Maximum 8 availability slots allowed";
    }
    
    // Check if exactly one specialization is primary
    const primaryCount = profileData.specializations.filter(spec => spec.is_primary).length;
    if (primaryCount !== 1) {
      newErrors.specializations = "Exactly one specialization must be marked as primary";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isProfileCompleteForSubmission = () => {
    // Check if all required fields are filled
    const hasRequiredFields = 
      profileData.phone?.trim() && 
      profileData.address?.trim() && 
      profileData.bio?.trim() && 
      profileData.consultation_fee && 
      profileData.languages_spoken.length > 0 &&
      profileData.specializations.length > 0 &&
      profileData.availability_slots.length > 0;
    
    // Check if exactly one specialization is primary
    const hasPrimarySpecialization = profileData.specializations.filter(spec => spec.is_primary).length === 1;
    
    // Check if bio has at least 20 words
    const hasValidBio = profileData.bio?.trim().split(/\s+/).filter(word => word.length > 0).length >= 20;
    
    return hasRequiredFields && hasPrimarySpecialization && hasValidBio;
  };

  const getProfileCompletionStatus = () => {
    const requiredFields = [
      'phone', 'address', 'bio', 'consultation_fee', 
      'languages_spoken', 'specializations', 'availability_slots'
    ];
    
    let completedFields = 0;
    
    // Check each required field
    if (profileData.phone?.trim()) completedFields++;
    if (profileData.address?.trim()) completedFields++;
    if (profileData.bio?.trim() && profileData.bio.trim().split(/\s+/).filter(word => word.length > 0).length >= 20) completedFields++;
    if (profileData.consultation_fee) completedFields++;
    if (profileData.languages_spoken.length > 0) completedFields++;
    if (profileData.specializations.length > 0 && profileData.specializations.filter(spec => spec.is_primary).length === 1) completedFields++;
    if (profileData.availability_slots.length > 0) completedFields++;
    
    const percentage = Math.round((completedFields / requiredFields.length) * 100);
    
    return {
      percentage,
      completedFields,
      totalFields: requiredFields.length,
      isComplete: percentage === 100
    };
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
        })),
        availability_slots: profileData.availability_slots
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

  const handleDocumentUpload = async (file, documentType) => {
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
    formData.append('document_type', documentType);
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
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          id: response.data.document_id,
          name: response.data.document_name,
          type: documentType,
          status: 'pending',
          uploaded_at: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error(error.response?.data?.detail || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const removeDocument = async (documentType) => {
    const document = documents[documentType];
    if (!document) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/api/specialist/documents/${document.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDocuments(prev => ({
        ...prev,
        [documentType]: null
      }));
      toast.success("Document removed successfully");
    } catch (error) {
      console.error("Document deletion error:", error);
      toast.error(error.response?.data?.detail || "Failed to remove document");
    }
  };

  const validateDocuments = () => {
    const mandatoryTypes = ['identity_card', 'degree', 'license', 'experience_letter'];
    const missingDocs = mandatoryTypes.filter(type => !documents[type]);
    
    if (missingDocs.length > 0) {
      const missingLabels = missingDocs.map(type => {
        switch(type) {
          case 'identity_card': return 'Identity Card';
          case 'degree': return 'Degree Certificate';
          case 'license': return 'Professional License';
          case 'experience_letter': return 'Experience Letter';
          default: return type;
        }
      });
      toast.error(`Please upload all required documents. Missing: ${missingLabels.join(', ')}`);
      return false;
    }
    return true;
  };

  const submitForApproval = async () => {
    if (!validateDocuments()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await axios.post(
        `${API_URL}/api/specialist/submit-for-approval`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success("Application submitted successfully for admin approval!");
        
        // Show detailed next steps
        const nextSteps = response.data.next_steps;
        if (nextSteps && nextSteps.length > 0) {
          setTimeout(() => {
            toast.success(
              `Next Steps:\n${nextSteps.slice(0, 2).join('\n')}`,
              { duration: 6000 }
            );
          }, 1000);
        }
        
        // Redirect to pending approval page or refresh status
        setTimeout(() => {
          navigate("/pending-approval");
        }, 2000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.detail || "Failed to submit application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  // Document upload box component
  const DocumentUploadBox = ({ documentType, label, description, uploadedDoc }) => {
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleDocumentUpload(file, documentType);
      }
    };

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleDocumentUpload(file, documentType);
      }
    };

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{label}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        
        {uploadedDoc ? (
          // Show uploaded document
          <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="font-medium text-green-800">{uploadedDoc.name}</p>
                  <p className="text-sm text-green-600">Uploaded successfully</p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(documentType)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          // Show upload area
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver
                ? darkMode
                  ? 'border-indigo-400 bg-indigo-900/20'
                  : 'border-indigo-400 bg-indigo-50'
                : darkMode
                ? 'border-gray-600 bg-gray-700'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className={`mx-auto h-12 w-12 ${dragOver ? 'text-indigo-500' : 'text-gray-400'}`} />
            <div className="mt-4">
              <label htmlFor={`document-upload-${documentType}`} className="cursor-pointer">
                <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id={`document-upload-${documentType}`}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PDF, JPG, PNG, DOC, DOCX up to 10MB
            </p>
          </div>
        )}
      </div>
    );
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
                    errors.clinic_name
                      ? 'border-red-500 focus:ring-red-300'
                      : darkMode
                      ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.clinic_name && <p className="text-red-500 text-sm mt-1">{errors.clinic_name}</p>}
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
                    placeholder="www.yourwebsite.com or https://yourwebsite.com"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.website_url
                        ? 'border-red-500 focus:ring-red-300'
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.website_url && <p className="text-red-500 text-sm mt-1">{errors.website_url}</p>}
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

            {/* Availability Slots */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Available Time Slots</label>
              <p className="text-sm text-gray-600 mb-4">
                Select your available consultation hours (minimum 1 hour, maximum 8 hours per day)
              </p>
              
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map(slot => (
                    <label key={slot.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={slot.value}
                        checked={profileData.availability_slots.includes(slot.value)}
                        onChange={handleAvailabilitySlotChange}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{slot.label}</span>
                    </label>
                  ))}
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <p>Selected slots: {profileData.availability_slots.length} / 8</p>
                  {profileData.availability_slots.length > 0 && (
                    <p className="mt-1">
                      <span className="font-medium">Your schedule:</span> {
                        profileData.availability_slots
                          .sort()
                          .map(slot => timeSlots.find(t => t.value === slot)?.label)
                          .join(', ')
                      }
                    </p>
                  )}
                </div>
              </div>
              
              {errors.availability_slots && <p className="text-red-500 text-sm mt-1">{errors.availability_slots}</p>}
            </div>

            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
              <div className={`mt-6 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
                <div className="flex items-start space-x-3">
                  <XCircle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Completion Status */}
            <div className="mt-6">
              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Profile Completion</h3>
                  <span className={`text-sm font-medium ${
                    getProfileCompletionStatus().isComplete ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {getProfileCompletionStatus().percentage}% Complete
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getProfileCompletionStatus().isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${getProfileCompletionStatus().percentage}%`
                    }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Required fields: {getProfileCompletionStatus().completedFields} / {getProfileCompletionStatus().totalFields}</p>
                  {getProfileCompletionStatus().isComplete && (
                    <p className="mt-1 text-green-600">
                      ✅ Profile is complete! You can now upload documents and submit for approval.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving || Object.keys(errors).length > 0}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  saving || Object.keys(errors).length > 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                <span>
                  {saving ? 'Saving...' : Object.keys(errors).length > 0 ? 'Fix errors to save' : 'Save Profile'}
                </span>
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
            
            <div className="mb-8">
              <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-2">Document Upload Instructions</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      All four documents below are mandatory for account verification. Please ensure:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Files are clear and readable</li>
                      <li>• Maximum file size is 10MB</li>
                      <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                      <li>• All information is clearly visible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DocumentUploadBox
                documentType="identity_card"
                label="Identity Card (CNIC)"
                description="Clear photo of both sides of your CNIC or valid government ID"
                uploadedDoc={documents.identity_card}
              />
              
              <DocumentUploadBox
                documentType="degree"
                label="Degree Certificate"
                description="Your highest degree certificate in mental health or related field"
                uploadedDoc={documents.degree}
              />
              
              <DocumentUploadBox
                documentType="license"
                label="Professional License"
                description="Valid professional license, registration certificate, or practice permit"
                uploadedDoc={documents.license}
              />
              
              <DocumentUploadBox
                documentType="experience_letter"
                label="Experience Certificate"
                description="Experience letters or certificates from previous practice or employment"
                uploadedDoc={documents.experience_letter}
              />
            </div>

            {/* Upload Progress Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-gray-600">
                  {Object.values(documents).filter(doc => doc !== null).length} / 4 documents uploaded
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(documents).filter(doc => doc !== null).length / 4) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Profile Completion Status */}
            <div className="mt-8 mb-6">
              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Profile Completion Status</h3>
                  <span className={`text-sm font-medium ${
                    getProfileCompletionStatus().isComplete ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {getProfileCompletionStatus().percentage}% Complete
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getProfileCompletionStatus().isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${getProfileCompletionStatus().percentage}%`
                    }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Required fields: {getProfileCompletionStatus().completedFields} / {getProfileCompletionStatus().totalFields}</p>
                  {!getProfileCompletionStatus().isComplete && (
                    <p className="mt-1 text-yellow-600">
                      ⚠️ Complete your profile before submitting for approval
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit for Approval */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={submitForApproval}
                disabled={
                  Object.values(documents).filter(doc => doc !== null).length < 4 || 
                  !isProfileCompleteForSubmission()
                }
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  Object.values(documents).filter(doc => doc !== null).length < 4 || 
                  !isProfileCompleteForSubmission()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Send size={20} />
                <span>
                  {Object.values(documents).filter(doc => doc !== null).length < 4 
                    ? 'Upload all documents' 
                    : !isProfileCompleteForSubmission()
                    ? 'Complete profile first'
                    : 'Submit for Approval'
                  }
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SpecialistCompleteProfile;

