// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import MainLayout from "./components/Home/MainLayout";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";
import OTP from "./components/OTP"; // Import the new OTP component
import MandatoryQuestionnaire from "./components/MandatoryQuestionnaire";
import ForgotPassword from "./components/ForgotPassword";
import DevTeam from "./components/DevTeam";
import OAuthSuccess from "./components/OAuthSuccess";
import AdminDashboard from "./components/AdminDashboard";
import SpecialistDashboard from "./components/SpecialistDashboard";
import SpecialistCompleteProfile from "./components/SpecialistCompleteProfile";
import SpecialistPendingApproval from "./components/SpecialistPendingApproval";
import SpecialistApplicationRejected from "./components/SpecialistApplicationRejected";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home/*" element={<MainLayout />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OTP />} />{" "}
        {/* Add the new route for OTP */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dev-team" element={<DevTeam />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route
          path="/mandatory-questionnaire"
          element={<MandatoryQuestionnaire />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/specialist-dashboard" element={<SpecialistDashboard />} />
        <Route path="/specialist" element={<SpecialistDashboard />} /> {/* Legacy route */}
        <Route path="/complete-profile" element={<SpecialistCompleteProfile />} />
        <Route path="/specialist-complete-profile" element={<SpecialistCompleteProfile />} /> {/* Legacy route */}
        <Route path="/pending-approval" element={<SpecialistPendingApproval />} />
        <Route path="/application-rejected" element={<SpecialistApplicationRejected />} />
      </Routes>
    </Router>
  );
}

export default App;
