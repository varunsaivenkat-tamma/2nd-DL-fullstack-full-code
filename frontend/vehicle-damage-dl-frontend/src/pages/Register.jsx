import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useVehicle from "../context/VehicleContext.jsx";
import { auth, db } from "../../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useVehicle();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date(),
        authType: "manual",
      });

      alert("Account created successfully!");
      navigate("/login");

    } catch (err) {
      console.error("Register error:", err);

      // 🛠 FIX: Clean message for email already in use
      if (err.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login instead.");
        return navigate("/login");
      }

      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const user = await loginWithGoogle();

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        createdAt: new Date(),
        authType: "google",
      });

      navigate("/");
    } catch (err) {
      console.error("Google Signup Error:", err);
      alert("Google signup failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/thumb_back/fw800/background/20230408/pngtree-car-blue-background-image_2178129.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative bg-gray-800/80 p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 text-white outline-none"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 text-white outline-none"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-700 text-white outline-none pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-white"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPwd ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-700 text-white outline-none pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-white"
            >
              {showConfirmPwd ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Register
          </button>
        </form>

        <button
          onClick={handleGoogleSignup}
          className="w-full mt-6 bg-white text-gray-800 py-3 rounded-xl font-semibold 
          flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-6 h-6"
            alt="Google logo"
          />
          Sign up with Google
        </button>

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
