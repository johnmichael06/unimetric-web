import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import {
  Info,
  Pencil,
  Check,
  X,
  Save,
  Loader2,
  Zap,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle, // Added back for the verification UI
} from "lucide-react";

export default function Electricity({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Data State
  const [rate, setRate] = useState(12.5);
  const [readingsHistory, setReadingsHistory] = useState([]);

  // UI State
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculator Inputs
  const [prevReading, setPrevReading] = useState("");
  const [currReading, setCurrReading] = useState("");
  const [billAmount, setBillAmount] = useState(""); // Stores landlord's bill
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // 1. Get Rate
    const { data: profile } = await supabase
      .from("profiles")
      .select("electricity_rate")
      .eq("id", user.id)
      .single();
    if (profile) setRate(profile.electricity_rate || 12.5);

    // 2. Get History
    const { data: history } = await supabase
      .from("electricity_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("reading_date", { ascending: false })
      .limit(10);

    if (history && history.length > 0) {
      setReadingsHistory(history);
      setPrevReading(history[0].current_reading);
    }

    setLoading(false);
  }

  // --- ACTIONS ---

  const handleSaveRate = async () => {
    if (!tempRate || isNaN(tempRate)) return;
    const newRate = parseFloat(tempRate);
    const { error } = await supabase
      .from("profiles")
      .update({ electricity_rate: newRate })
      .eq("id", user.id);
    if (!error) {
      setRate(newRate);
      setIsEditingRate(false);
    }
  };

  const handleSaveReading = async () => {
    if (!currReading || !prevReading) return alert("Please enter readings");

    if (parseFloat(currReading) < parseFloat(prevReading)) {
      return alert("Current reading cannot be lower than Previous reading!");
    }

    setSaving(true);
    const usage = parseFloat(currReading) - parseFloat(prevReading);
    const cost = usage * rate;

    const { error } = await supabase.from("electricity_readings").insert([
      {
        user_id: user.id,
        previous_reading: parseFloat(prevReading),
        current_reading: parseFloat(currReading),
        estimated_cost: cost,
        reading_date: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setShowSuccessModal(true);
      fetchData();
      setCurrReading("");
      setBillAmount(""); // Reset bill input
    }
    setSaving(false);
  };

  const initiateDelete = (id) => {
    setReadingToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!readingToDelete) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("electricity_readings")
      .delete()
      .eq("id", readingToDelete);

    if (!error) {
      setReadingsHistory(
        readingsHistory.filter((item) => item.id !== readingToDelete)
      );
      fetchData();
      setShowDeleteModal(false);
      setReadingToDelete(null);
    } else {
      alert("Error deleting: " + error.message);
    }
    setIsDeleting(false);
  };

  // --- CALCULATIONS ---
  const usage = currReading
    ? parseFloat(currReading) - (parseFloat(prevReading) || 0)
    : 0;
  const calculatedCost = usage * rate;

  // Verification Logic
  const difference = (parseFloat(billAmount) || 0) - calculatedCost;
  const percentDiff =
    calculatedCost > 0 ? (difference / calculatedCost) * 100 : 0;

  const getStatusColor = () => {
    if (!billAmount) return "text-gray-600 bg-gray-50 border-gray-200";
    if (Math.abs(percentDiff) <= 5)
      return "text-emerald-600 bg-emerald-50 border-emerald-200"; // Green = Fair
    if (percentDiff > 5) return "text-red-600 bg-red-50 border-red-200"; // Red = Overcharge
    return "text-blue-600 bg-blue-50 border-blue-200"; // Blue = Undercharge
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Electricity</h1>
          <p className="text-gray-500 text-sm">Monitor usage & verify bills.</p>
        </div>

        {/* Rate Widget */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">
            Rate:
          </span>
          {isEditingRate ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-16 bg-gray-50 border border-emerald-300 rounded px-1 text-sm outline-none"
                autoFocus
                placeholder={rate}
                onChange={(e) => setTempRate(e.target.value)}
              />
              <button onClick={handleSaveRate}>
                <Check size={16} className="text-green-600" />
              </button>
              <button onClick={() => setIsEditingRate(false)}>
                <X size={16} className="text-red-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">₱{rate}</span>
              <button onClick={() => setIsEditingRate(true)}>
                <Pencil
                  size={14}
                  className="text-gray-400 hover:text-emerald-600"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CALCULATOR CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 text-emerald-600">
          <Info size={20} />
          <h2 className="font-bold text-lg text-gray-900">New Reading</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: INPUTS */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Previous (kWh)
              </label>
              <input
                type="number"
                value={prevReading}
                onChange={(e) => setPrevReading(e.target.value)}
                className="w-full p-3 bg-gray-50 border-none rounded-xl font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Current (kWh)
              </label>
              <input
                type="number"
                value={currReading}
                onChange={(e) => setCurrReading(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                placeholder="0000"
              />
            </div>
            <button
              onClick={handleSaveReading}
              disabled={saving || !currReading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Reading
            </button>
          </div>

          {/* RIGHT: RESULTS & VERIFICATION */}
          <div className="flex flex-col space-y-6">
            {/* Calculation Result */}
            <div className="bg-emerald-50/30 rounded-xl p-6 flex flex-col justify-center space-y-4 border border-emerald-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Usage</span>
                <span className="font-bold text-gray-900">
                  {usage > 0 ? usage.toFixed(1) : 0} kWh
                </span>
              </div>
              <div className="border-t border-emerald-100 my-2"></div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">
                  Estimated Cost
                </span>
                <span className="text-4xl font-extrabold text-emerald-600">
                  ₱{calculatedCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* --- VERIFICATION SECTION (RESTORED) --- */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Verify Bill Amount
              </label>
              <div className="flex gap-2 mb-3">
                <span className="inline-flex items-center px-4 bg-gray-50 border border-gray-200 rounded-l-xl text-gray-500 font-bold">
                  ₱
                </span>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Enter landlord's bill..."
                  className="w-full px-3 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>

              {/* Verification Result Card */}
              {billAmount && currReading && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${getStatusColor()}`}
                >
                  {Math.abs(percentDiff) > 5 ? (
                    <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle size={20} className="mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wide">
                      {Math.abs(percentDiff) <= 5
                        ? "Fair Bill"
                        : percentDiff > 5
                        ? "Potential Overcharge"
                        : "Undercharged"}
                    </p>
                    <p className="text-xs opacity-90 mt-1">
                      Difference: ₱{difference.toFixed(2)} (
                      {percentDiff.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          Recent History
        </h3>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {readingsHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No readings recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reading</th>
                    <th className="px-6 py-4 text-right">Cost</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {readingsHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.reading_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            {item.current_reading} kWh
                          </span>
                          <span className="text-xs text-gray-400">
                            Prev: {item.previous_reading}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono font-bold ${
                          item.estimated_cost < 0
                            ? "text-red-500"
                            : "text-gray-900"
                        }`}
                      >
                        ₱{item.estimated_cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => initiateDelete(item.id)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PORTAL SUCCESS MODAL */}
      {showSuccessModal &&
        createPortal(
          <div className="fixed top-0 left-0 w-screen h-screen bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-emerald-600" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Reading Saved!
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Your electricity reading has been recorded.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => onNavigate && onNavigate("dashboard")}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold"
                  >
                    Add Another
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* PORTAL DELETE MODAL */}
      {showDeleteModal &&
        createPortal(
          <div className="fixed top-0 left-0 w-screen h-screen bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in relative">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Reading?
                </h3>
                <p className="text-sm text-gray-500 mt-2 mb-6">
                  This will remove the record from your history.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-3 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg"
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
