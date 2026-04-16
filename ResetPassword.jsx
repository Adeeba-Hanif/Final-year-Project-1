import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_REGEX = /^[0-9]{5}@admin\.riphah\.edu\.pk$/i;
const WARDEN_REGEX = /^[0-9]{5}@warden\.riphah\.edu\.pk$/i;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!ADMIN_REGEX.test(email) && !WARDEN_REGEX.test(email)) {
      setError("Enter valid Riphah email.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("Password reset link has been sent to your email.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900 text-center mb-6">Reset Password</h1>

        {error && <div className="mb-4 bg-rose-50 text-rose-600 text-xs px-3 py-2 rounded-md">{error}</div>}
        {message && <div className="mb-4 bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-md">{message}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm hover:bg-slate-800"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-xs text-center mt-4 text-slate-500">
          Back to{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-slate-900 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}