import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Camera,
  AlertTriangle,
  CheckCircle,
  Info,
  Pencil,
  Check,
  X,
  Save,
  Loader2,
  History,
} from "lucide-react";

export default function Electricity() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Rate State
  const [rate, setRate] = useState(12.5);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState("");

  // Calculator State
  const [prevReading, setPrevReading] = useState("");
  const [currReading, setCurrReading] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Load Data
  useEffect(() => {
    fetchElectricityData();
  }, []);

  async function fetchElectricityData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // 1. Get User's Rate
    const { data: profile } = await supabase
      .from("profiles")
      .select("electricity_rate")
      .eq("id", user.id)
      .single();

    if (profile) setRate(profile.electricity_rate || 12.5);

    // 2. Get Last Saved Reading (to auto-fill "Previous")
    const { data: lastReading } = await supabase
      .from("electricity_readings")
      .select("current_reading")
      .eq("user_id", user.id)
      .order("reading_date", { ascending: false })
      .limit(1)
      .single();

    if (lastReading) {
      setPrevReading(lastReading.current_reading);
    }

    setLoading(false);
  }

  // --- SAVE NEW RATE ---
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

  // --- SAVE READING TO DB ---
  const handleSaveReading = async () => {
    if (!currReading || !prevReading)
      return alert("Please enter readings first");
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

    if (error) alert("Error saving: " + error.message);
    else {
      alert("Reading saved! Check your Dashboard.");
      setPrevReading(currReading); // Move current to previous for next time
      setCurrReading("");
    }
    setSaving(false);
  };

  // Calculations
  const usage = (parseFloat(currReading) || 0) - (parseFloat(prevReading) || 0);
  const calculatedCost = usage * rate;
  const difference = (parseFloat(billAmount) || 0) - calculatedCost;
  const percentDiff =
    calculatedCost > 0 ? (difference / calculatedCost) * 100 : 0;

  const getStatusColor = () => {
    if (!billAmount) return "text-gray-600 bg-gray-50 border-gray-200";
    if (Math.abs(percentDiff) <= 5)
      return "text-brand-600 bg-brand-50 border-brand-200";
    if (percentDiff > 5) return "text-danger-600 bg-red-50 border-red-200";
    return "text-accent-600 bg-blue-50 border-blue-200";
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER WITH DYNAMIC RATE EDIT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Electricity Monitor
          </h1>
          <p className="text-gray-500">
            Verify your landlord's billing accuracy.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col items-end">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
            Current Rate
          </span>

          {isEditingRate ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">₱</span>
              <input
                type="number"
                className="w-20 border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                placeholder={rate}
                autoFocus
              />
              <span className="text-xs text-gray-400">/kWh</span>
              <button
                onClick={handleSaveRate}
                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setIsEditingRate(false)}
                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                ₱{rate.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/ kWh</span>
              <button
                onClick={() => {
                  setTempRate(rate);
                  setIsEditingRate(true);
                }}
                className="p-1 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded transition-colors"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CALCULATOR CARD */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Info size={18} className="text-brand-500" />
            Meter Reading Calculator
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: INPUTS */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Reading (kWh)
              </label>
              <input
                type="number"
                value={prevReading}
                onChange={(e) => setPrevReading(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="e.g. 1450"
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-filled from last saved reading
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Reading (kWh)
              </label>
              <input
                type="number"
                value={currReading}
                onChange={(e) => setCurrReading(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="e.g. 1582"
              />
            </div>

            <button
              onClick={handleSaveReading}
              disabled={saving || !currReading}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save this Reading
            </button>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col space-y-4">
            <div className="bg-brand-50/50 rounded-lg p-5 border border-brand-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Usage this period:</span>
                <span className="font-medium text-gray-900">
                  {usage > 0 ? usage.toFixed(1) : 0} kWh
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-gray-600 text-sm mb-1">
                  Estimated Cost:
                </span>
                <span className="text-2xl font-bold text-brand-600">
                  ₱{calculatedCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
                Verify Bill Amount
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 bg-gray-50 border border-gray-300 rounded-l-lg text-gray-500 font-medium">
                  ₱
                </span>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Enter landlord's bill..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* VERIFICATION RESULT */}
            {billAmount && (
              <div
                className={`p-3 rounded-lg border flex items-start gap-3 animate-fade-in ${getStatusColor()}`}
              >
                {Math.abs(percentDiff) > 5 ? (
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">
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
  );
}
