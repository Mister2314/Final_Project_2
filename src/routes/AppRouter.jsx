import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "../context/UserContext";
import { ProtectedRoute, AuthRoute } from "./ProtectedRoute";
import LoadingScreen from "../components/Loading/LoadingScreen";

// Page imports
import Home from "../pages/Home/Home";
import Login from "../layout/Login/Login";
import Signup from "../layout/Signup/Signup";
import FaqPage from "../pages/Faq/FaqPage";
import ContactPage from "../pages/Contact/ContactPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import ProfileSettings from "../components/ProfileSettings/ProfileSettings";
import NotFound from "../pages/404/Page404"; // Import the NotFound component

const AppRouter = () => {
  return (
    <Router>
      <UserProvider>
        <LoadingScreen />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          
          {/* Auth Routes - Only accessible when NOT logged in */}
          <Route element={<AuthRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          
          {/* Protected Routes - Only accessible when logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
          </Route>

          {/* 404 Not Found Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default AppRouter;