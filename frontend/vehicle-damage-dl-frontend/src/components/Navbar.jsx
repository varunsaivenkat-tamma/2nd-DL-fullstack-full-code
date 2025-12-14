import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useVehicle from "../context/VehicleContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useVehicle();
  const navigate = useNavigate();

  // Handle authentication
  const handleAuth = async () => {
    if (user) {
      await logout();
      navigate("/login");
    }
  };

  // Navigate to home on logo click
  const handleLogoClick = () => navigate("/");

  // Generate random alphabet avatar
  const getRandomAvatar = (name) => {
    const alphabet = name ? name.charAt(0).toUpperCase() : 'U';
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-red-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return { letter: alphabet, color: randomColor };
  };

  const userAvatar = user ? getRandomAvatar(user.name || user.email) : null;

  // Navigation links
  const links = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/ai-dashboard", label: "Our AI" },
    { path: "/contact", label: "Contact" },
  ];

  // Active link styling
  const linkClass = ({ isActive }) =>
    `no-underline select-none !outline-none !border-none relative transition ${
      isActive ? "font-semibold text-blue-400" : "text-gray-300"
    }`;

  // Animation variants
  const navAnimation = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const logoAnimation = {
    hover: { scale: 1.05, rotate: [-1, 1, -1, 0], transition: { duration: 0.6 } },
    tap: { scale: 0.95 }
  };

  const linkItemAnimation = {
    hover: { scale: 1.05, y: -2, transition: { type: "spring", stiffness: 400, damping: 10 } },
    tap: { scale: 0.98 }
  };

  const buttonAnimation = {
    hover: { scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)", transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const mobileLinkAnimation = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <>
      {/* Main Navigation */}
      <motion.nav variants={navAnimation} initial="hidden" animate="visible" className="bg-safeBg/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo Section */}
          <motion.div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick} variants={logoAnimation} whileHover="hover" whileTap="tap">
            <motion.img src="https://img.freepik.com/premium-vector/sport-car-logo-template-perfect-logo-business-related-automotive-industry_665349-549.jpg?semt=ais_hybrid&w=740&q=80" alt="logo" className="rounded-full w-10 h-10 object-cover" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} />
            <motion.div className="text-white font-bold text-xl" whileHover={{ color: "#60a5fa" }} transition={{ duration: 0.2 }}>TORQx</motion.div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center text-base">
            {links.map((link, idx) => (
              <motion.div key={idx} variants={linkItemAnimation} whileHover="hover" whileTap="tap">
                <NavLink to={link.path} className={linkClass}>{link.label}</NavLink>
              </motion.div>
            ))}
            
            {/* User Avatar - Alphabet based */}
            {user && userAvatar && (
              <motion.div 
                className={`rounded-full w-10 h-10 flex items-center justify-center text-white font-bold border border-gray-500 ml-4 ${userAvatar.color}`}
                whileHover={{ scale: 1.1, borderColor: "#60a5fa" }}
                transition={{ duration: 0.2 }}
              >
                {userAvatar.letter}
              </motion.div>
            )}

            {/* Auth Button */}
            {user ? (
              <motion.button onClick={handleAuth} className="no-underline text-gray-300 font-semibold transition px-3 py-1 rounded-lg" variants={buttonAnimation} whileHover="hover" whileTap="tap">Logout</motion.button>
            ) : (
              <motion.div variants={buttonAnimation} whileHover="hover" whileTap="tap">
                <NavLink to="/login" className="no-underline text-gray-300 transition px-3 py-1 rounded-lg">Login</NavLink>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button onClick={() => setOpen(true)} className="md:hidden text-white p-2 rounded-lg" whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.9 }}>
            <motion.svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.3 }}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </motion.svg>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black z-40" onClick={() => setOpen(false)} />
            
            <motion.aside key="sidebar" initial={{ x: "-100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-100%", opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-safeBg p-6 shadow-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              <motion.button onClick={() => setOpen(false)} className="text-white mb-5 p-2 rounded-lg hover:bg-white/10" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>✖ Close</motion.button>

              <motion.div className="flex flex-col gap-5 text-lg" variants={staggerContainer} initial="initial" animate="animate">
                {links.map((link, idx) => (
                  <motion.div key={idx} variants={mobileLinkAnimation}>
                    <NavLink to={link.path} className={({ isActive }) => `no-underline text-gray-300 hover:text-blue-400 block py-2 px-3 rounded-lg transition-colors ${isActive ? "text-blue-400 font-semibold bg-white/5" : ""}`} onClick={() => setOpen(false)}>{link.label}</NavLink>
                  </motion.div>
                ))}
                
                {/* Mobile User Info */}
                {user && userAvatar && (
                  <motion.div variants={mobileLinkAnimation} className="flex items-center gap-3 py-2 px-3 border-t border-gray-700 pt-4">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white font-bold ${userAvatar.color}`}>
                      {userAvatar.letter}
                    </div>
                    <span className="text-gray-300 text-sm truncate">{user.name || user.email}</span>
                  </motion.div>
                )}
                
                {/* Mobile Auth */}
                <motion.div variants={mobileLinkAnimation} className="mt-4">
                  {user ? (
                    <motion.button className="text-blue-400 text-left w-full py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" onClick={() => { handleAuth(); setOpen(false); }} whileHover={{ x: 5 }}>Logout</motion.button>
                  ) : (
                    <NavLink to="/login" className="text-blue-400 text-left block py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>Login</NavLink>
                  )}
                </motion.div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}