import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  // ---- responsive + reduced-motion detection ----
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsMobile(mqMobile.matches);
      setReduceMotion(mqReduce.matches);
    };
    update();
    mqMobile.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

  // ---- top slideshow ----
  const slides = [
    "https://i.pinimg.com/736x/86/6b/15/866b1523e6d60691e5ee3c2ab2adf06b.jpg",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
    "https://wallpaper.forfun.com/fetch/e1/e134cabd1beb3e45778291e64174d17b.jpeg",
    "https://di-uploads-development.dealerinspire.com/bmwofsandiego/uploads/2023/05/BMW-Mobile-1.png",
  ];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      4000
    );
    return () => clearInterval(id);
  }, [slides.length, reduceMotion]);

  // ---- blur intensity ----
  const [blur, setBlur] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setBlur(Math.min(0.8, y / 1200));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---- counters ----
  const insightsRef = useRef(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [inference, setInference] = useState(0);
  const [records, setRecords] = useState(0);
  useEffect(() => {
    if (!insightsRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const start = performance.now();
          const duration = 1300;
          const animate = (now) => {
            const t = Math.min(1, (now - start) / duration);
            setAccuracy(Math.round(94 * t));
            setInference(Math.round(120 * t));
            setRecords(Math.round(22342 * t));
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(insightsRef.current);
    return () => obs.disconnect();
  }, [countersStarted]);

  const howRef = useRef(null);
  const scrollToHow = () =>
    howRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ---- features, pipeline, severity, testimonials ----
  const features = [
    {
      title: "Precise Localization",
      text: "Detects dents, scratches, and cracks with pixel-level precision.",
      img: "https://inspektlabs.com/blog/content/images/2024/10/Gemini_Generated_Image_4gfftu4gfftu4gff_optimized_100.jpeg",
    },
    {
      title: "Repair Cost Estimates",
      text: "Part-wise cost breakdown and labor estimation for accurate quotes.",
      img: "https://www.teamly.com/blog/wp-content/uploads/2022/10/Cost-estimation-and-budgeting-in-project-management.png",
    },
    {
      title: "Fast Inference",
      text: "Optimized pipeline for sub-200ms inference on GPUs.",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const pipelineSteps = [
    {
      title: "Image Upload",
      desc: "User uploads a clear vehicle image.",
      gif: "https://plus.unsplash.com/premium_photo-1733317438378-1d6a0b8e65e7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZGlnaXRhbCUyMGNhcnxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
    },
    {
      title: "Damage Detection",
      desc: "AI localizes and classifies severity.",
      gif: "https://intelliarts.com/wp-content/uploads/2023/04/1f990c_d3a66935e5634422b06e7e9b074e6091mv2-e1694509810261.webp",
    },
    {
      title: "Cost Estimation",
      desc: "Computes part-wise repair and labor cost.",
      gif: "https://www.autotrainingcentre.com/wp-content/uploads/2020/04/collision-estimator.jpg",
    },
    {
      title: "Result & Report",
      desc: "Generates report and estimated cost.",
      gif: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVwb3J0c3xlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
    },
  ];

  const testimonials = [
    {
      name: "AutoFix Garage",
      quote:
        "The detection precision and speed are phenomenal. Saves hours of manual inspection.",
    },
    {
      name: "Dr. Vishnu",
      quote:
        "A neat AI + UI integration — accurate, fast and reliable for workshops.",
    },
    {
      name: "CarCare Services",
      quote:
        "Visuals and results helped our clients trust the repair estimates instantly.",
    },
  ];

  const liveGif =
    "https://miro.medium.com/v2/resize:fit:4800/format:webp/0*imFMjvkgizTroPsV.gif";

  const rotateKeyframes = {
    rotateY: [-6, 6, -6],
    rotateX: [-1.5, 1.5, -1.5],
    scale: [1, 1.02, 1],
  };
  const rotateTransition = {
    duration: 10,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  };

  // ----- AUTO SCROLL FOR SEVERITY CAROUSEL -----
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % 6); // 6 images
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#05060b] via-[#0b0f1a] to-[#020206] text-white overflow-x-hidden">
      {/* ambient blur */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none transition-opacity"
        style={{
          backdropFilter: `blur(${Math.round(blur * 10)}px)`,
          opacity: blur,
        }}
      />

      {/* ---------- HERO SLIDER ---------- */}
      <section className="relative w-full h-[60vh] overflow-hidden">
        <AnimatePresence initial={false}>
          {slides.map(
            (src, idx) =>
              idx === current && (
                <motion.div
                  key={src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="absolute inset-0"
                >
                  <img
                    src={src}
                    alt="slide"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-[#13082a]/30 to-transparent" />
                </motion.div>
              )
          )}
        </AnimatePresence>

        <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight text-warning"
          >
            "Drive the Future- <br />
            <span className="text-">Power,Precision & Performance"</span>
          </motion.h1>

          <p className="mt-4 text-light max-w-xl fw-bold">
            "Discover next-gen automotive technology,stylish,designs, and machines built to thrill"
          </p>

          <div className="mt-6">
            <button
              onClick={scrollToHow}
              className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-md font-semibold shadow-lg shadow-indigo-700/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ---------- MAIN HERO (3D car) ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-16" ref={howRef}>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center">
            <motion.div
              animate={rotateKeyframes}
              transition={rotateTransition}
              className="relative w-full max-w-md rounded-xl"
            >
              <img
                src="https://mobisoftinfotech.com/resources/wp-content/uploads/2024/01/og-role_of_ai_in_damage_detection.png"
                alt="main-car"
                className="w-full object-cover rounded-xl shadow-[0_25px_60px_rgba(5,7,15,0.8)]"
              />
              <motion.div
                initial={{ x: "-120%" }}
                animate={{ x: "120%" }}
                transition={{ repeat: Infinity, duration: 4.2, ease: "linear" }}
                style={{ transform: "skewX(-12deg)" }}
                className="absolute top-0 left-0 h-full w-56 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent mix-blend-screen"
              />
            </motion.div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-indigo-300">
              Drive The Future Of Mobility
            </h2>
            <p className="text-slate-300 mt-4 max-w-lg">
              Experience cutting-edge design, advanced engineering,and unmatched
              performance built for the next generation
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Feature Cards ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 rounded-xl overflow-hidden border border-white/6 shadow-sm"
            >
              <img
                src={f.img}
                alt={f.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-indigo-300">
                  {f.title}
                </h3>
                <p className="text-slate-300 mt-2 text-sm">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Why Choose Our AI ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-indigo-300 text-center mb-8">
          Why Choose Our AI
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/6">
            <h4 className="font-semibold text-indigo-300">Accuracy</h4>
            <p className="text-slate-300 mt-2 text-sm">
              High precision detection validated on curated datasets.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/6">
            <h4 className="font-semibold text-indigo-300">Reliability</h4>
            <p className="text-slate-300 mt-2 text-sm">
              Robust AI trained and tested for production workflows.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/6">
            <h4 className="font-semibold text-indigo-300">Speed</h4>
            <p className="text-slate-300 mt-2 text-sm">
              Real-time inference with optimized pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Model Pipeline ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-indigo-300 text-center mb-8">
          Model Pipeline Overview
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {pipelineSteps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 p-4 rounded-lg border border-white/6"
            >
              <img
                src={s.gif}
                alt={s.title}
                className="h-36 w-full object-cover rounded-md"
              />
              <h4 className="text-indigo-300 font-semibold mt-3">{s.title}</h4>
              <p className="text-slate-300 text-sm mt-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Live Damage Scan ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-indigo-300 text-center mb-8">
          Live Damage Scan Preview
        </h3>
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl w-full rounded-xl overflow-hidden border border-white/6 shadow-2xl"
          >
            <img
              src={liveGif}
              alt="live-scan"
              className="w-full h-64 object-cover"
            />
          </motion.div>
        </div>
      </section>

{/* ---------- Brand Visualization ---------- */}
<section className="max-w-7xl mx-auto px-6 py-16 overflow-hidden">
  <h3 className="text-3xl font-bold text-indigo-300 text-center mb-8">
    Brand Visualization
  </h3>

  <div className="relative w-full py-6 overflow-hidden">
    <motion.div
      className="flex gap-20 items-center whitespace-nowrap"
      animate={{ x: ["0%", "-100%"] }}
      transition={{
        repeat: Infinity,
        ease: "linear",
        duration: 25, // adjust speed
      }}
      whileHover={{ x: null }} // stops on hover
    >
      {[
        "https://www.carlogos.org/logo/Volkswagen-symbol-640x480.jpg",
        "https://static.vecteezy.com/system/resources/previews/020/502/710/non_2x/bmw-brand-logo-symbol-blue-design-germany-car-automobile-illustration-with-black-background-free-vector.jpg",
        "https://e0.pxfuel.com/wallpapers/69/330/desktop-wallpaper-honda-dark-blue-logo-dark-blue-neon-lights-creative-dark-blue-abstract-background-honda-logo-cars-brands-honda.jpg",
        "https://pngimg.com/uploads/car_logo/car_logo_PNG1642.png",
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkcWIY89rnWOuqn1-aSGBwFRuTsG99WlQHObUe8K7PfrpBKUcuX80bN1RgAtbiWfqmUa065OsWL7ffnx3YkI-lcPVD1gt2_deG0qGLeJuZIU0ENbgDvLPO2fRq4i64C7z-8evIQBXT9F0/s1600/audi_logo_by_murder0210-d39lny11.png",
        "https://wallpapers.com/images/hd/car-logo-960-x-820-wallpaper-ovsck3tg1a290h3e.jpg",
      ].concat([
        // Duplicate logos again for infinite loop
        "https://www.carlogos.org/logo/Volkswagen-symbol-640x480.jpg",
        "https://static.vecteezy.com/system/resources/previews/020/502/710/non_2x/bmw-brand-logo-symbol-blue-design-germany-car-automobile-illustration-with-black-background-free-vector.jpg",
        "https://e0.pxfuel.com/wallpapers/69/330/desktop-wallpaper-honda-dark-blue-logo-dark-blue-neon-lights-creative-dark-blue-abstract-background-honda-logo-cars-brands-honda.jpg",
        "https://pngimg.com/uploads/car_logo/car_logo_PNG1642.png",
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkcWIY89rnWOuqn1-aSGBwFRuTsG99WlQHObUe8K7PfrpBKUcuX80bN1RgAtbiWfqmUa065OsWL7ffnx3YkI-lcPVD1gt2_deG0qGLeJuZIU0ENbgDvLPO2fRq4i64C7z-8evIQBXT9F0/s1600/audi_logo_by_murder0210-d39lny11.png",
        "https://wallpapers.com/images/hd/car-logo-960-x-820-wallpaper-ovsck3tg1a290h3e.jpg",
      ]).map((logo, index) => (
        <img
          key={index}
          src={logo}
          alt="brand"
          className="w-52 h-52 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300"
        />
      ))}
    </motion.div>
  </div>
</section>



      {/* ---------- Testimonials ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-indigo-300 text-center mb-8">
          Trusted by Experts
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 p-6 rounded-xl border border-white/6"
            >
              <p className="italic text-slate-300">“{t.quote}”</p>
              <div className="mt-4 font-semibold text-indigo-300">{t.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
