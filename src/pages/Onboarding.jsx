import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { User, BookOpen, Loader2, ArrowRight } from "lucide-react";

export default function Onboarding({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    program: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 1. Combine inputs
      const combinedName = `${formData.firstName} ${formData.lastName}`.trim();

      // 2. Save to Supabase (Just the program now, no year level)
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: combinedName,
          course_year: formData.program,
        })
        .eq("id", user.id);

      if (!error) {
        onComplete();
      } else {
        alert("Error saving profile: " + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* --- BACKGROUND PATTERN --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100 animate-fade-in-up">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-1.5 flex-1 bg-brand-500 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-brand-100 rounded-full"></div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider ml-2">
            Step 1 of 2
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-600">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Let's set up your profile
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            We need a few details to personalize your student dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name Split */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
                First Name
              </label>
              <input
                type="text"
                required
                placeholder="Juan"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
                Last Name
              </label>
              <input
                type="text"
                required
                placeholder="Dela Cruz"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 2: Program Only */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
              Degree Program
            </label>
            <div className="relative">
              <BookOpen
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                required
                placeholder="BS Information Technology"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                value={formData.program}
                onChange={(e) =>
                  setFormData({ ...formData, program: e.target.value })
                }
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Complete Setup <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
