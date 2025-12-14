import React, { useState } from "react";
import { motion } from "framer-motion";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "contactMessages"), {
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      });

      alert("Message successfully sent! ");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.log(error);
      alert("Failed to send message ❌ Try Again!");
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-purple-950 text-white overflow-hidden">

      {/* BACKGROUND VIDEO */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay loop muted playsInline
        src="https://assets.mixkit.co/videos/35540/35540-720.mp4"
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* HEADER */}
      <section className="relative z-10 text-center pt-24 pb-10 px-6">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-purple-300 drop-shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Contact Us
        </motion.h1>
        <motion.p
          className="text-white/90 mt-4 max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          We’re here to collaborate and support your AI & Automotive Innovations.
        </motion.p>
      </section>

      {/* MAIN SECTION */}
      <section className="relative z-10 py-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 min-h-[75vh] items-stretch">
          
          {/* LEFT VIDEO */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center h-full"
          >
            <video
              autoPlay loop muted playsInline
              className="w-full max-w-[600px] h-full object-cover rounded-3xl shadow-2xl"
            >
              <source
                src="https://cdn.pixabay.com/video/2025/05/20/280244_large.mp4"
                type="video/webm"
              />
            </video>
          </motion.div>

          {/* FORM */}
          <div className="flex flex-col justify-center items-center text-center h-full">
            <motion.div
              className="mt-8 w-full max-w-md bg-purple-800/30 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-purple-300 mb-4">Send us a Message</h2>

              <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <input
                  className="p-3 rounded-lg bg-white/10 placeholder:text-gray-300 text-white
                    focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  className="p-3 rounded-lg bg-white/10 placeholder:text-gray-300 text-white
                    focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <textarea
                  rows="4"
                  className="p-3 rounded-lg bg-white/10 placeholder:text-gray-300 text-white
                    focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  className="bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold"
                >
                  Send
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
       {/* LIVE LOCATION SECTION */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.h2
          className="text-4xl font-bold text-purple-300 text-center mb-12 drop-shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Live Location
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* MAP */}
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl border border-purple-700 h-full"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              title="Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2182.8112323808023!2d78.40097229965373!3d17.494531327587534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91f20663c46d%3A0x846796db82f76735!2sSocial%20Prachar!5e1!3m2!1sen!2sin!4v1763630963348!5m2!1sen!2sin"
              width="100%"
              height="600"
              style={{ border: 0 }}
              loading="lazy"
              
            ></iframe>
          </motion.div>

          {/* ADDRESS CARD */}
          <motion.div
            className="p-8 rounded-2xl bg-purple-800/40 backdrop-blur-xl shadow-xl 
              border border-purple-600 flex flex-col justify-center text-center"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-purple-600/40 p-4 w-fit rounded-xl shadow-lg mb-5 d-block mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-10 h-10"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>

            <h3 className="text-3xl font-semibold text-purple-300">Our Address</h3>
            <p className="text-white/85 mt-3 leading-relaxed text-lg ">
              TORQx , KPHB <br />
              Hyderabad, Telangana <br />
              500072, India
            </p>

            <div className="mt-6">
              <p className="font-semibold text-purple-300">Phone:</p>
              <p className="text-white/80">+91 707589 2216</p>

              <p className="font-semibold text-purple-300 mt-3">Email:</p>
              <p className="text-white/80">support@TORQxgmail.com</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMAGE CARDS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-purple-300 text-center mb-10">
          Highlights & Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {[
            "https://www.shutterstock.com/image-photo/using-laptop-show-icon-address-600nw-2521386695.jpg",
            "https://www.searchenginejournal.com/wp-content/uploads/2022/08/contact-us-2-62fa2cc2edbaf-sej.png",
            "https://www.elegantthemes.com/blog/wp-content/uploads/2019/08/000-Contact-Page.png"
          ].map((img, i) => (
            <motion.div
              key={i}
              className="rounded-xl overflow-hidden bg-purple-800/30 shadow-lg backdrop-blur-xl"
              whileHover={{ scale: 1.05, rotate: 1.5 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <img src={img} className="w-full h-56 object-cover" />
              <div className="p-4 text-center">
                <p className="text-white/90">AI Powered Automotive </p>
              </div>
            </motion.div>
          ))}

        </div>
      </section>

      {/* IMAGE */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
        <img
          src="https://images.unsplash.com/photo-1740560051533-3acef26ace95?fm=jpg&q=60&w=3000"
          className="mt-8 mx-auto rounded-xl shadow-lg w-full max-w-3xl"
        />
      </section>
    </div>
  );
}
