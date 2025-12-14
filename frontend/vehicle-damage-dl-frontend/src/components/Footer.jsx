import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  // Footer animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const waveVariants = {
    animate: {
      x: ["0%", "-50%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 7,
          ease: "linear",
        }
      }
    }
  };

  const socialIconVariants = {
    hover: {
      scale: 1.2,
      y: -3,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <footer className="relative bg-gray-900 text-gray-300 pt-20 pb-10 overflow-hidden">

      {/* 🌊 ANIMATED WAVES */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        
        {/* Primary Wave */}
        <motion.div
          variants={waveVariants}
          animate="animate"
          className="relative block w-[200%] h-32"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M321.39 56.44C180.14 65.78 75.88 18.21 0 0v120h1200V0c-81.21 18.69-147.07 58.67-270.35 56.44C768.26 54 695.91 8.15 568.92 8.95c-128.15.81-189.86 47.49-247.53 47.49z"
              className="fill-blue-500"
            ></path>
          </svg>
        </motion.div>

        {/* Secondary Wave */}
        <motion.div
          variants={waveVariants}
          animate="animate"
          className="absolute top-4 w-[200%] h-32 opacity-70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M321.39 56.44C180.14 65.78 75.88 18.21 0 0v120h1200V0c-81.21 18.69-147.07 58.67-270.35 56.44C768.26 54 695.91 8.15 568.92 8.95c-128.15.81-189.86 47.49-247.53 47.49z"
              className="fill-cyan-400"
            ></path>
          </svg>
        </motion.div>

        {/* Accent Wave */}
        <motion.div
          variants={waveVariants}
          animate="animate"
          className="absolute top-8 w-[200%] h-32 opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M321.39 56.44C180.14 65.78 75.88 18.21 0 0v120h1200V0c-81.21 18.69-147.07 58.67-270.35 56.44C768.26 54 695.91 8.15 568.92 8.95c-128.15.81-189.86 47.49-247.53 47.49z"
              className="fill-orange-500"
            ></path>
          </svg>
        </motion.div>
      </div>

      {/* CONTENT */}
      <motion.div 
        className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 mt-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >

        {/* Brand Section */}
        <motion.div variants={itemVariants}>
          <motion.h3 
            className="text-2xl font-bold text-white mb-4"
            whileHover={{ color: "#60a5fa" }}
            transition={{ duration: 0.2 }}
          >
            TORQx
          </motion.h3>
          <p className="text-gray-400 mt-2 max-w-sm leading-relaxed">
            AI-powered vehicle damage detection, cinematic scans, and instant claim insight—built for the future.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <h3 className="font-bold text-white text-xl mb-4">Quick Links</h3>
          <ul className="space-y-3">
            {[
              { path: "/", label: "Home" },
              { path: "/about", label: "About" },
              { path: "/ai-dashboard", label: "Our AI" },
              { path: "/contact", label: "Contact" }
            ].map((link, index) => (
              <motion.li key={index} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link 
                  to={link.path} 
                  className="text-blue-400 no-underline hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <span className="text-xs">▶</span>
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Office Info */}
        <motion.div variants={itemVariants}>
          <h4 className="font-semibold text-white text-lg mb-4">Office</h4>
          <div className="space-y-3">
            <motion.div 
              className="flex items-center gap-3 text-gray-400"
              whileHover={{ color: "#60a5fa" }}
              transition={{ duration: 0.2 }}
            >
              <FaMapMarkerAlt className="text-blue-400 flex-shrink-0" />
              <div>
                <p>Cyber Towers, KPHB</p>
                <p>Hyderabad, India 500081</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3 text-gray-400"
              whileHover={{ color: "#60a5fa" }}
              transition={{ duration: 0.2 }}
            >
              <FaClock className="text-blue-400 flex-shrink-0" />
              <p>Mon – Sat: 10 AM – 7 PM</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={itemVariants}>
          <h4 className="font-semibold text-white text-lg mb-4">Contact</h4>
          <div className="space-y-3">
            <motion.div 
              className="flex items-center gap-3 text-gray-400"
              whileHover={{ color: "#60a5fa" }}
              transition={{ duration: 0.2 }}
            >
              <FaEnvelope className="text-blue-400 flex-shrink-0" />
              <p>support@TORQx.com</p>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3 text-gray-400"
              whileHover={{ color: "#60a5fa" }}
              transition={{ duration: 0.2 }}
            >
              <FaPhone className="text-blue-400 flex-shrink-0" />
              <p>+91 707589 2216</p>
            </motion.div>

            {/* Social Media Icons */}
            <div className="flex gap-4 mt-4">
              {[
                { icon: FaFacebook, color: "hover:text-blue-500" },
                { icon: FaInstagram, color: "hover:text-pink-500" },
                { icon: FaTwitter, color: "hover:text-blue-400" },
                { icon: FaLinkedin, color: "hover:text-blue-600" }
              ].map((SocialIcon, index) => (
                <motion.div
                  key={index}
                  variants={socialIconVariants}
                  whileHover="hover"
                  className="cursor-pointer"
                >
                  <SocialIcon.icon 
                    className={`text-gray-400 text-xl transition-colors ${SocialIcon.color}`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div 
        className="mt-14 pt-4 border-t border-gray-700 text-center text-sm text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <p>© {new Date().getFullYear()} TORQx. All rights reserved.</p>
        <motion.p 
          className="text-xs mt-2 text-gray-500"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          Driving Innovation in Vehicle Diagnostics
        </motion.p>
      </motion.div>
    </footer>
  );
}