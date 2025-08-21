import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, ChevronRight, ChevronLeft, Check } from "react-feather";
import axios from "axios";
import { toast } from "react-hot-toast";

const MandatoryQuestionnaire = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information (pre-filled from registration)
    full_name: "",
    age: "",
    gender: "",
    
    // Chief Complaint
    chief_complaint: "",
    
    // Mental Health Treatment Data
    past_psychiatric_diagnosis: "",
    past_psychiatric_treatment: "",
    hospitalizations: "",
    ect_history: "",
    
    // Medical and Substance History
    current_medications: "",
    medication_allergies: "",
    otc_supplements: "",
    medication_adherence: "",
    medical_history_summary: "",
    chronic_illnesses: "",
    neurological_problems: "",
    head_injury: "",
    seizure_history: "",
    pregnancy_status: "",
    
    // Substance Use
    alcohol_use: "",
    drug_use: "",
    prescription_drug_abuse: "",
    last_use_date: "",
    substance_treatment: "",
    tobacco_use: "",
    
    // Family Mental Health History
    family_mental_health_history: "",
    family_mental_health_stigma: "",
    
    // Cultural and Spiritual Context
    cultural_background: "",
    cultural_beliefs: "",
    spiritual_supports: "",
    
    // Lifestyle Factors
    lifestyle_smoking: "",
    lifestyle_alcohol: "",
    lifestyle_activity: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.body.className = savedMode ? "dark" : "light";
    
    // Pre-fill basic information from registration
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData) {
      setFormData(prev => ({
        ...prev,
        full_name: userData.first_name + " " + userData.last_name || "",
        age: userData.age || "",
        gender: userData.gender || "",
      }));
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.body.className = newMode ? "dark" : "light";
  };

  // Question configuration
  const questions = [
    {
      id: "chief_complaint",
      title: "What brings you here today?",
      subtitle: "Please describe your main concern or reason for seeking help",
      type: "textarea",
      required: true,
      placeholder: "Describe your symptoms, feelings, or concerns..."
    },
    {
      id: "past_psychiatric_diagnosis",
      title: "Have you been diagnosed with any mental health conditions in the past?",
      subtitle: "This helps us understand your treatment history",
      type: "mcq",
      options: ["Yes", "No", "Not sure"],
      required: false
    },
    {
      id: "past_psychiatric_treatment",
      title: "Have you received mental health treatment before?",
      subtitle: "Include therapy, counseling, or psychiatric care",
      type: "mcq",
      options: ["Yes", "No", "Not sure"],
      required: false
    },
    {
      id: "hospitalizations",
      title: "Have you ever been hospitalized for mental health reasons?",
      subtitle: "This includes psychiatric hospitalizations",
      type: "mcq",
      options: ["Yes", "No", "Not sure"],
      required: false
    },
    {
      id: "current_medications",
      title: "Are you currently taking any medications?",
      subtitle: "Include prescription drugs, over-the-counter medications, and supplements",
      type: "textarea",
      required: false,
      placeholder: "List your current medications and dosages..."
    },
    {
      id: "medication_allergies",
      title: "Do you have any medication allergies or adverse reactions?",
      subtitle: "This is important for your safety",
      type: "mcq",
      options: ["Yes", "No", "Not sure"],
      required: false
    },
    {
      id: "medical_history_summary",
      title: "Do you have any chronic medical conditions?",
      subtitle: "Examples: diabetes, heart disease, thyroid problems, etc.",
      type: "textarea",
      required: false,
      placeholder: "Describe any chronic medical conditions..."
    },
    {
      id: "alcohol_use",
      title: "How would you describe your alcohol consumption?",
      subtitle: "Be honest - this helps us provide better care",
      type: "mcq",
      options: ["Never drink", "Occasionally", "Moderate", "Heavy", "In recovery"],
      required: false
    },
    {
      id: "drug_use",
      title: "Have you used recreational drugs in the past?",
      subtitle: "This includes marijuana, cocaine, etc.",
      type: "mcq",
      options: ["Never", "In the past", "Occasionally", "Regularly", "In recovery"],
      required: false
    },
    {
      id: "family_mental_health_history",
      title: "Is there a history of mental health conditions in your family?",
      subtitle: "This can include depression, anxiety, bipolar disorder, etc.",
      type: "mcq",
      options: ["Yes", "No", "Not sure"],
      required: false
    },
    {
      id: "cultural_background",
      title: "How important is your cultural background in your life?",
      subtitle: "This helps us provide culturally sensitive care",
      type: "mcq",
      options: ["Very important", "Somewhat important", "Not very important", "Not important"],
      required: false
    },
    {
      id: "lifestyle_activity",
      title: "How would you describe your current activity level?",
      subtitle: "This includes exercise and physical activity",
      type: "mcq",
      options: ["Very active", "Moderately active", "Somewhat active", "Sedentary"],
      required: false
    }
  ];

  const totalSteps = questions.length;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateCurrentStep = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.required && !formData[currentQuestion.id]) {
      setErrors(prev => ({ ...prev, [currentQuestion.id]: "This field is required" }));
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please sign in first");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/mandatory-questionnaire`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Questionnaire completed successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const value = formData[question.id];
    const error = errors[question.id];

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {question.title}
          </h2>
          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {question.subtitle}
          </p>
        </div>

        {question.type === "mcq" && (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange(question.id, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  value === option
                    ? darkMode
                      ? "border-indigo-400 bg-indigo-900/20 text-indigo-300"
                      : "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "textarea" && (
          <textarea
            value={value}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={`w-full p-4 rounded-lg border-2 resize-none ${
              error
                ? "border-red-500 focus:ring-red-300"
                : darkMode
                ? "border-gray-600 bg-gray-800 text-white focus:ring-indigo-500 focus:border-indigo-500"
                : "border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            } focus:outline-none focus:ring-2 transition-colors`}
          />
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className={`text-4xl font-bold mb-4 ${
              darkMode ? "text-indigo-400" : "text-indigo-600"
            }`}
          >
            MindMate Health Assessment
          </motion.h1>
          <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Let's get to know you better to provide personalized care
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Container */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {renderQuestion(questions[currentStep])}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? "opacity-50 cursor-not-allowed"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </button>

            {currentStep === totalSteps - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Check size={20} className="mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Complete Assessment"}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Next
                <ChevronRight size={20} className="ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          className={`fixed top-4 right-4 p-3 rounded-full transition-colors duration-200 ${
            darkMode
              ? "bg-gray-700 text-yellow-300"
              : "bg-gray-100 text-gray-700"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MandatoryQuestionnaire;
