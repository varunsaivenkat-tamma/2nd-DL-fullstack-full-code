import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [oobCode, setOobCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOobCode(params.get("oobCode"));
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (password !== confirm) {
      setErr("Passwords do not match!");
      return;
    }

    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);

      setMsg("Password updated successfully!");

      setTimeout(() => navigate("/login"), 1500); // redirect to login
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Reset Password
        </h2>

        <form onSubmit={handleReset} className="space-y-5">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition-all shadow-md"
          >
            Update Password
          </button>
        </form>

        {msg && <p className="mt-4 text-green-300 text-center">{msg}</p>}
        {err && <p className="mt-4 text-red-300 text-center">{err}</p>}
      </div>
    </div>
  );
}
