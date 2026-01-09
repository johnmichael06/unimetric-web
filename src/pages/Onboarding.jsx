import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  User,
  BookOpen,
  Loader2,
  ArrowRight,
  Check,
  Wallet,
  Zap,
  Target,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

// --- OPTIONS (Purely for UI now) ---
const GOAL_OPTIONS = [
  { id: "track_spending", label: "Track where my money goes", icon: Wallet },
  {
    id: "verify_bills",
    label: "Check if my landlord is overcharging",
    icon: Zap,
  },
  {
    id: "save_goal",
    label: "Save for something specific (Laptop, Trip)",
    icon: Target,
  },
  {
    id: "better_habits",
    label: "Build better spending habits",
    icon: TrendingUp,
  },
  {
    id: "organize",
    label: "Organize all my finances in one place",
    icon: LayoutDashboard,
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 Data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    program: "",
  });

  // Step 2 Data (Visual only for now)
  const [selectedGoals, setSelectedGoals] = useState([]);

  const toggleGoal = (id) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const combinedName = `${formData.firstName} ${formData.lastName}`.trim();

      // --- SAVE ONLY SAFE DATA ---
      // We are NOT saving 'selectedGoals' to avoid database errors.
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
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              step >= 1 ? "bg-brand-500" : "bg-brand-100"
            }`}
          ></div>
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              step >= 2 ? "bg-brand-500" : "bg-brand-100"
            }`}
          ></div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider ml-2">
            Step {step} of 2
          </span>
        </div>

        {/* --- STEP 1: PROFILE DETAILS --- */}
        {step === 1 && (
          <div className="animate-fade-in">
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

            <form onSubmit={handleNext} className="space-y-6">
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
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
              >
                Next Step <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 2: GOALS CHECKLIST (Visual Only) --- */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                What brings you here?
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Select all that apply to help us customize your experience.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-8">
              {GOAL_OPTIONS.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`
                    cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 select-none
                    ${
                      selectedGoals.includes(goal.id)
                        ? "border-brand-500 bg-brand-50 shadow-sm"
                        : "border-gray-200 hover:border-brand-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0
                    ${
                      selectedGoals.includes(goal.id)
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                  >
                    <goal.icon size={20} />
                  </div>

                  <div className="flex-1 text-left">
                    <span
                      className={`font-semibold text-sm sm:text-base ${
                        selectedGoals.includes(goal.id)
                          ? "text-brand-900"
                          : "text-gray-700"
                      }`}
                    >
                      {goal.label}
                    </span>
                  </div>

                  {selectedGoals.includes(goal.id) && (
                    <div className="text-brand-600 animate-scale-in">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Complete Setup"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
