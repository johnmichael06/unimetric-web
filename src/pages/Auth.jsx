import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Zap, Loader2, ArrowLeft } from "lucide-react"; // Import ArrowLeft

export default function Auth({ onBack }) {
  // <--- Accept onBack prop here
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: email.split("@")[0] } },
      });
      if (error) setMessage(error.message);
      else setMessage("Success! Check your email for the confirmation link.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* --- BACK BUTTON --- */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-white"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back to Home</span>
      </button>

      {/* --- BACKGROUND PATTERN --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* --- AUTH CARD --- */}
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 transform rotate-3">
            <Zap size={32} fill="white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isLogin
            ? "Enter your details to access your dashboard."
            : "Start tracking your student budget today."}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@school.edu"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.includes("Success")
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-50 text-center text-sm">
          <span className="text-gray-500">
            {isLogin ? "New here?" : "Already joined?"}
          </span>{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-600 hover:text-brand-800 font-bold transition-colors"
          >
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
