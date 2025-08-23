import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Check,
  AlertCircle,
  Calendar,
} from "react-feather";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast"; // <-- IMPORT TOAST
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Signup = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptsTermsAndConditions: false, // Added terms acceptance
    // Specialist-specific fields - REMOVED
  });

  // User type toggle (patient | specialist)
  const [userType, setUserType] = useState("patient");

  // Error state
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptsTermsAndConditions: "", // Added terms error
    form: "",
    // Specialist-specific errors - REMOVED
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Initialize dark mode and reset form when user type changes
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.body.className = savedMode ? "dark" : "light";
    
    // Reset form data when user type changes
    if (userType === "specialist") {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: "",
        gender: ""
      }));
    }
  }, [userType]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.body.className = newMode ? "dark" : "light";
  };

  // Handle user type change and clear relevant fields
  const handleUserTypeChange = (newUserType) => {
    console.log("DEBUG: Switching user type from", userType, "to", newUserType);
    console.log("DEBUG: Current formData before switch:", formData);
    
    setUserType(newUserType);
    
            // Clear specialist-specific fields when switching to specialist
        if (newUserType === "specialist") {
          const newFormData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            acceptsTermsAndConditions: formData.acceptsTermsAndConditions, // Keep terms acceptance
            // Clear patient-specific fields
            dateOfBirth: "",
            gender: ""
          };
          console.log("DEBUG: New formData for specialist:", newFormData);
          
          setFormData(newFormData);
          setErrors(prev => ({
            ...prev,
            dateOfBirth: "",
            gender: ""
          }));
        } else if (newUserType === "patient") {
          // Clear specialist-specific fields when switching to patient
          const newFormData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            acceptsTermsAndConditions: formData.acceptsTermsAndConditions, // Keep terms acceptance
            // Keep patient fields as they are
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender
          };
          console.log("DEBUG: New formData for patient:", newFormData);
          
          setFormData(newFormData);
        }
    
    // Clear any existing form errors
    setErrors(prev => ({
      ...prev,
      form: ""
    }));
  };

  // Animation variants
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
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  // Validation functions
  const validateName = (name) => /^[a-zA-Z\s-']+$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
      form: "",
      // Specialist-specific errors - REMOVED
    };
    let isValid = true;

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = "Only letters and hyphens allowed";
      isValid = false;
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = "Only letters and hyphens allowed";
      isValid = false;
    }

    // Date of birth validation - ONLY for patients
    if (userType === "patient") {
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
      isValid = false;
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
        isValid = false;
      }
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 100) {
        newErrors.dateOfBirth = "Age must be between 13 and 100 years";
        isValid = false;
      }
    }

      // Gender validation - ONLY for patients
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    // Terms and conditions validation
    if (!formData.acceptsTermsAndConditions) {
      newErrors.acceptsTermsAndConditions = "You must accept the terms and conditions";
      isValid = false;
    }

    // Specialist-specific validation - REMOVED

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: "" }));
    setSuccess(false);

    try {
      let backendFormData;
      let endpoint;

      if (userType === "patient") {
        backendFormData = {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          email: formData.email.trim(),
          password: formData.password,
          accepts_terms_and_conditions: formData.acceptsTermsAndConditions,
        };
        endpoint = `${API_URL}/api/auth/register-patient`;
      } else if (userType === "specialist") {
        backendFormData = {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          accepts_terms_and_conditions: formData.acceptsTermsAndConditions,
        };
        endpoint = `${API_URL}/api/auth/register-specialist`;
        
        console.log("DEBUG: Specialist backendFormData:", backendFormData);
        console.log("DEBUG: Original formData:", formData);
      }

      // Debug: Log what we're sending
      console.log("DEBUG: Sending registration data:", backendFormData);
      console.log("DEBUG: Endpoint:", endpoint);
      console.log("DEBUG: User type:", userType);
      console.log("DEBUG: Original formData:", formData);
      
      // Make the registration request
      const response = await axios.post(endpoint, backendFormData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });
      
      console.log("DEBUG: Registration response:", response.data);

      // On successful signup, navigate to the OTP verification page
      setErrors((prev) => ({ ...prev, form: "" })); // Clear any previous form errors
      setSuccess(true);
      toast.success("Account created! Please check your email for an OTP.");

      setTimeout(() => {
        navigate("/otp", { state: { email: formData.email.trim(), userType: userType } });
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      setSuccess(false); // Ensure success state is false on error

      if (error.response) {
        // Backend validation errors
        const backendError = error.response.data.detail || error.response.data.message;
        if (
          backendError === "An account with this email already exists" ||
          backendError === "Email already registered"
        ) {
          setErrors((prev) => ({ ...prev, email: "Email already registered" }));
        } else if (backendError === "Passwords don't match") {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords don't match",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            form: "Registration failed. Please try again.",
          }));
        }
      } else if (error.request) {
        // Network errors
        setErrors((prev) => ({
          ...prev,
          form: "Network error. Please check your connection.",
        }));
      } else {
        // Other errors
        setErrors((prev) => ({
          ...prev,
          form: "An unexpected error occurred.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 p-4 ${
        darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`w-full max-w-md rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-8 relative">
          {/* Dark Mode Toggle */}
          <motion.button
            onClick={toggleDarkMode}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
              darkMode
                ? "bg-gray-700 text-yellow-300"
                : "bg-gray-100 text-gray-700"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Toggle: Patient | Specialist */}
          <motion.div className="flex justify-center mb-4" variants={itemVariants}>
            <div className={`inline-flex rounded-lg overflow-hidden border ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  userType === "patient"
                    ? darkMode
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-600 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => handleUserTypeChange("patient")}
              >
                Patient
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  userType === "specialist"
                    ? darkMode
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-600 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => handleUserTypeChange("specialist")}
              >
                Specialist
              </button>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <motion.h1
              className={`text-3xl font-bold mb-2 ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              MindMate
            </motion.h1>
            <motion.p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Begin your wellness journey
            </motion.p>
          </motion.div>

          {/* Form Messages */}
          <AnimatePresence mode="wait">
            {errors.form && (
              <motion.div
                key="form-error" // <-- ADD UNIQUE KEY
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-red-900/30 text-red-300"
                    : "bg-red-100 text-red-700"
                }`}
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{errors.form}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="form-success" // <-- ADD UNIQUE KEY
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-green-900/30 text-green-300"
                    : "bg-green-100 text-green-700"
                }`}
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Check size={18} className="flex-shrink-0" />
                <span>Account created successfully! Redirecting...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signup Form */}
          <motion.form onSubmit={handleSubmit} variants={containerVariants}>
            {/* First Name Field */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.firstName
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <AnimatePresence>
                {errors.firstName && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Last Name Field */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.lastName
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <AnimatePresence>
                {errors.lastName && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Date of Birth Field - ONLY for patients */}
            {userType === "patient" && (
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="text-gray-400" size={18} />
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.dateOfBirth
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <AnimatePresence>
                {errors.dateOfBirth && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.dateOfBirth}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            )}

            {/* Gender Field - ONLY for patients */}
            {userType === "patient" && (
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Gender
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <select
                  name="gender"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.gender
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <AnimatePresence>
                {errors.gender && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.gender}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
            )}

            {/* Email Field */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff
                      className="text-gray-400 hover:text-gray-500"
                      size={18}
                    />
                  ) : (
                    <Eye
                      className="text-gray-400 hover:text-gray-500"
                      size={18}
                    />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-300"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                      : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      className="text-gray-400 hover:text-gray-500"
                      size={18}
                    />
                  ) : (
                    <Eye
                      className="text-gray-400 hover:text-gray-500"
                      size={18}
                    />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    className="text-red-500 text-xs mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Terms and Conditions Checkbox */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptsTermsAndConditions"
                    name="acceptsTermsAndConditions"
                    type="checkbox"
                    checked={formData.acceptsTermsAndConditions}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      acceptsTermsAndConditions: e.target.checked
                    }))}
                    className={`h-4 w-4 rounded border-2 focus:ring-2 transition-colors duration-200 ${
                      errors.acceptsTermsAndConditions
                        ? "border-red-500 focus:ring-red-300"
                        : darkMode
                        ? "border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500 focus:border-indigo-500"
                        : "border-gray-300 bg-white text-indigo-600 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="acceptsTermsAndConditions"
                    className={`font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    I accept the{" "}
                    <button
                      type="button"
                      className={`underline hover:no-underline ${
                        darkMode
                          ? "text-indigo-400 hover:text-indigo-300"
                          : "text-indigo-600 hover:text-indigo-800"
                      }`}
                      onClick={() => {
                        // TODO: Open terms and conditions modal/page
                        alert("Terms and Conditions would open here");
                      }}
                      disabled={isSubmitting}
                    >
                      Terms and Conditions
                    </button>
                  </label>
                  <AnimatePresence>
                    {errors.acceptsTermsAndConditions && (
                      <motion.p
                        className="text-red-500 text-xs mt-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {errors.acceptsTermsAndConditions}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Specialist-specific fields - REMOVED */}
            {/* All specialist fields have been removed from the form */}

            {/* Submit Button */}
            <motion.button
              className={`w-full font-medium py-2 px-4 rounded-lg transition duration-200 flex justify-center items-center ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white disabled:opacity-70`}
              type="submit"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Create Account"
              )}
            </motion.button>
          </motion.form>

          {/* Login Link */}
          <motion.div
            className={`text-center mt-6 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
            variants={itemVariants}
          >
            Already have an account?{" "}
            <button
              type="button"
              className={`font-medium ${
                darkMode
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-indigo-600 hover:text-indigo-800"
              }`}
              onClick={() => navigate("/login")}
              disabled={isSubmitting}
            >
              Sign in
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
