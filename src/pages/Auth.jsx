import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Zap,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'error' or 'success'

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessageType("error");
        // Make the error message user-friendly
        if (error.message.includes("Invalid login credentials")) {
          setMessage("Incorrect email or password. Please try again.");
        } else {
          setMessage(error.message);
        }
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: email.split("@")[0] } },
      });
      if (error) {
        setMessageType("error");
        setMessage(error.message);
      } else {
        setMessageType("success");
        setMessage("Success! Please check your email to confirm your account.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* --- BACK BUTTON --- */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-white shadow-sm"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back to Home</span>
      </button>

      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* --- AUTH CARD --- */}
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 animate-fade-in-up">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 transform -rotate-3 transition-transform hover:rotate-0">
            <Zap size={28} fill="white" />
          </div>
        </div>

        {/* Dynamic Titles */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isLogin ? "Sign in to UniMetric" : "Create an Account"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isLogin
              ? "Welcome back! Please enter your details."
              : "Start tracking your student budget today."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter Email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Toggle Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm">
          <p className="text-gray-500 mb-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(""); // Clear errors when switching
            }}
            className="text-brand-600 hover:text-brand-700 font-bold transition-colors hover:underline"
          >
            {isLogin ? "Create one!" : "Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
}
