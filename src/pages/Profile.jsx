import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, BookOpen, Save, Loader2, CheckCircle } from "lucide-react";

export default function ProfileSettings({ onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // Profile States matching your Onboarding data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [program, setProgram] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, course_year")
        .eq("id", user.id)
        .single();

      if (data) {
        // Split the full name back into First and Last for the inputs
        const nameParts = data.full_name ? data.full_name.split(" ") : ["", ""];
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setProgram(data.course_year || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Combine names just like in Onboarding
    const combinedName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: combinedName,
        course_year: program,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setMessage("Profile updated successfully!");
      if (onUpdate) onUpdate(); // Refresh the Sidebar name
      setTimeout(() => setMessage(""), 3000);
    }
    setUpdating(false);
  }

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User size={20} className="text-brand-500" />
          Account Settings
        </h2>
      </div>

      <form onSubmit={updateProfile} className="p-6 space-y-6">
        {/* Read Only Email */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
            Email Address
          </label>
          <input
            type="text"
            disabled
            value={email}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Name Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Degree Program */}
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
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
            <CheckCircle size={16} />
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={updating}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Update Profile
        </button>
      </form>
    </div>
  );
}
