import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// IMAGES
import img1 from "../assets/carousel/img-cor-1.jpg";
import img2 from "../assets/carousel/img-cor-2.jpg";
import img3 from "../assets/carousel/img-cor-3.avif";
import img4 from "../assets/carousel/img-cor-4.jpg";
import img5 from "../assets/carousel/img-cor-5.jpg";

import varunImg from "../assets/team/varun.jpg";
import srinivasImg from "../assets/team/srinivas.jpg";
import tejaswiniImg from "../assets/team/tejaswini.jpg";
import ganeshImg from "../assets/team/ganesh.jpg";
import vamsiImg from "../assets/team/vamsi.jpg";

const images = [img1, img2, img3, img4, img5];

const teamMembers = [
  { name: "Tamma Varun Sai Venkat", role: "Full-Stack Developer", img: varunImg },
  { name: "K. Srinivas", role: "Full-Stack Developer", img: srinivasImg },
  { name: "Tejaswini Pandeti", role: "Full-Stack Developer", img: tejaswiniImg },
  { name: "Ganesh Sura", role: "Data Scientist", img: ganeshImg },
  { name: "Vamsi Kumar", role: "Data Scientist", img: vamsiImg },
];

const features = [
  { title: "Automatic Damage Detection", desc: "Detect dents, scratches, and cracks instantly using AI." },
  { title: "Cost Estimation", desc: "Get part-wise repair and replacement estimates." },
  { title: "Fast & Optimized", desc: "Light-weight, high-speed inference pipeline." },
  { title: "Cinematic Reports", desc: "Generate high-quality, visual repair reports." },
];

const benefits = [
  "Save time on manual inspections",
  "Receive accurate cost estimates instantly",
  "Enhance transparency in claims process",
  "Reduce disputes and improve trust",
];

const steps = [
  { title: "Upload vehicle images", desc: "Users upload images from multiple angles." },
  { title: "Model detects damages", desc: "Identifies dents, scratches, cracks." },
  { title: "System calculates cost", desc: "AI automatically estimates repair cost." },
  { title: "Generate report", desc: "Download high-quality professional reports." },
];

const cardData = [
  {
    title: "Damage Categories",
    desc: "Types of damages identified.",
    details: "Detects dents, scratches, bumper damage, cracks and more.",
  },
  {
    title: "Supported Vehicles",
    desc: "Vehicles compatible with system.",
    details: "Cars, bikes, trucks, SUVs, commercial vehicles supported.",
  },
  {
    title: "Technology Stack",
    desc: "Tech behind the system.",
    details: "YOLOv8, CNN, Flask, React, Vite, TensorFlow.",
  },
];

/* POPUP */
function PopupModal({ open, onClose, content }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-safeSurface p-6 rounded-2xl max-w-md text-center shadow-xl border border-safePrimary/20">
        <h2 className="text-2xl font-bold mb-3 text-safeHeading">{content.title}</h2>
        <p className="text-safeBody mb-6">{content.details}</p>

        <button
          className="px-6 py-2 bg-safeSecondary hover:opacity-80 rounded-lg text-white font-semibold"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* CAROUSEL */
function GlowCarousel() {
  const trackRef = useRef(null);
  const speedRef = useRef(0.9); // Faster speed

  useEffect(() => {
    const track = trackRef.current;
    let animationId;
    let position = 0;
    let singleWidth = track.scrollWidth / 2;

    const animate = () => {
      position -= speedRef.current;

      if (Math.abs(position) >= singleWidth) {
        position = 0; // Seamlessly reset
      }

      track.style.transform = `translate3d(${position}px, 0, 0)`; // GPU boost
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const pause = () => (speedRef.current = 0);
    const resume = () => (speedRef.current = 0.9);

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden py-14">
      <h2 className="text-center text-4xl font-bold  mb-10 tracking-wide">
        Visual Showcase
      </h2>

      <div className="relative w-full whitespace-nowrap">
        <div
          ref={trackRef}
          className="inline-flex gap-9 px-6 will-change-transform"
        >
          {[...images, ...images].map((src, i) => (
            <div
              key={i}
              className="w-[260px] h-[180px] rounded-xl overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_35px_rgba(168,85,247,0.9)] hover:brightness-110"
            >
              <img src={src} className="w-full h-full object-contain" alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* MAIN PAGE */
export default function About() {
  const [openIndex, setOpenIndex] = useState(null);
  const [popup, setPopup] = useState({ open: false, content: {} });

  return (
    <div className="space-y-24 bg-safeBg min-h-screen text-safeHeading pb-32">

      {/* HERO */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loop muted autoPlay playsInline
          src="https://cdn.pixabay.com/video/2024/09/09/230471_large.mp4"
        />
        <div className="absolute inset-0 bg-safeBg/60"></div>

        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-safePrimary">
            About 
            
          </h1>
          <p className="mt-4 text-lg md:text-xl text-safeBody max-w-2xl mx-auto">
            AI-powered vehicle damage detection and repair cost estimation.
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="bg-safeSurface p-6 rounded-2xl shadow-lg border border-safePrimary/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <h3 className="text-xl font-semibold text-safePrimary mb-2">{f.title}</h3>
            <p className="text-safeBody">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* BENEFITS */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-safePrimary mb-8">Benefits</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="bg-safeDeep p-4 rounded-lg shadow border border-safePrimary/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              {b}
            </motion.div>
          ))}
        </div>
      </section>

      {/* STEPS ACCORDION */}
      <section className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-safePrimary">How It Works</h2>

        <div className="space-y-4">
          {steps.map((s, i) => {
            const isOpen = openIndex === i;

            return (
              <div key={i} className="bg-safeSurface p-4 rounded-lg shadow border border-safePrimary/10">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full justify-between items-center"
                >
                  <h3 className="text-lg font-semibold text-safePrimary">{s.title}</h3>
                  <span className="text-2xl font-bold text-safePrimary">{isOpen ? "-" : "+"}</span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm text-safeBody mt-3 overflow-hidden"
                    >
                      {s.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CAROUSEL */}
      <GlowCarousel />

      {/* INFO CARDS */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-bold text-center mb-10 text-safePrimary">More About the System</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {cardData.map((card, i) => (
            <motion.div
              key={i}
              className="bg-safeSurface p-6 rounded-2xl shadow-lg border border-safePrimary/10 hover:scale-105 transition-transform text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-xl font-semibold text-safePrimary">{card.title}</h3>
              <p className="text-safeBody mt-2 mb-4">{card.desc}</p>

             {/*  <button
                onClick={() => setPopup({ open: true, content: card })}
                className="px-4 py-2 bg-safeSecondary hover:opacity-80 rounded-lg text-white"
              >
                View More
              </button> */}
            </motion.div>
          ))}
        </div>
      </section>

      {/* POPUP MODAL */}
      <PopupModal
        open={popup.open}
        onClose={() => setPopup({ open: false, content: {} })}
        content={popup.content}
      />

      {/* TEAM SECTION */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <h2 className="text-3xl font-bold text-center mb-5 text-safePrimary">Our Team</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {teamMembers.map((t, i) => (
            <motion.div
              key={i}
              className="bg-safeDeep rounded-2xl p-6 text-center shadow-lg border border-safePrimary/10 hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <img
                src={t.img}
                alt={t.name}
                className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-4 border-safePrimary"
              />
              <h3 className="text-xl font-semibold text-safePrimary">{t.name}</h3>
              <p className="text-safeBody">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
