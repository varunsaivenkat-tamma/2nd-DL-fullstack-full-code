import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AIDashboard from "./pages/AIDashboard";
import Subscription from "./pages/Subscription";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";   // ⭐ Add this
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const location = useLocation();

  // pages where navbar & footer should NOT show
  const hideLayoutRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hide Navbar on auth pages */}
      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-dashboard" element={<AIDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/subscription" element={<Subscription />} /> 
          

          {/* ⭐ Add this route for new password page */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Hide Footer on auth pages */}
      {!hideLayout && <Footer />}
    </div>
  );
}
