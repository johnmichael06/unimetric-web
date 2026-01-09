import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Target,
  Trophy,
  TrendingUp,
  Loader2,
  X,
  Trash2,
  CheckCircle,
  Zap,
  Calendar,
  AlertTriangle,
  History,
} from "lucide-react";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amount
  );

const ICONS = [
  {
    id: "Target",
    icon: Target,
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },
  { id: "Travel", icon: TrendingUp, bg: "bg-blue-100", text: "text-blue-600" },
  { id: "Tech", icon: Zap, bg: "bg-purple-100", text: "text-purple-600" },
  { id: "Trophy", icon: Trophy, bg: "bg-amber-100", text: "text-amber-600" },
];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- MODAL STATES ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  // --- DELETE CONFIRMATION STATES ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'goal' | 'contribution', id: string }

  // --- DATA STATES ---
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalHistory, setGoalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- FORM STATES ---
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    icon: "Target",
  });
  const [contribution, setContribution] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setGoals(data || []);
    }
    setLoading(false);
  }

  async function fetchHistory(goalId) {
    setHistoryLoading(true);
    const { data } = await supabase
      .from("goal_contributions")
      .select("*")
      .eq("goal_id", goalId)
      .order("created_at", { ascending: false });
    setGoalHistory(data || []);
    setHistoryLoading(false);
  }

  // --- ACTIONS ---

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;

    const { error } = await supabase.from("goals").insert([
      {
        user_id: user.id,
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target),
        current_amount: 0,
        icon: newGoal.icon,
      },
    ]);

    if (!error) {
      setShowCreateModal(false);
      setNewGoal({ name: "", target: "", icon: "Target" });
      fetchGoals();
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!contribution || !selectedGoal) return;

    const amountToAdd = parseFloat(contribution);
    const newTotal = (selectedGoal.current_amount || 0) + amountToAdd;

    // 1. Add to History Table
    const { error: histError } = await supabase
      .from("goal_contributions")
      .insert([
        {
          goal_id: selectedGoal.id,
          amount: amountToAdd,
          note: "Deposit",
        },
      ]);

    if (!histError) {
      // 2. Update Goal Total
      await supabase
        .from("goals")
        .update({ current_amount: newTotal })
        .eq("id", selectedGoal.id);

      // 3. Update UI
      const updatedGoals = goals.map((g) =>
        g.id === selectedGoal.id ? { ...g, current_amount: newTotal } : g
      );
      setGoals(updatedGoals);

      // Update selected goal and refresh history if detail is open
      setSelectedGoal({ ...selectedGoal, current_amount: newTotal });
      fetchHistory(selectedGoal.id);

      setShowAddMoneyModal(false);
      setContribution("");
    }
  };

  const initiateDelete = (type, id) => {
    setItemToDelete({ type, id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "goal") {
      // DELETE GOAL
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", itemToDelete.id);
      if (!error) {
        setGoals(goals.filter((g) => g.id !== itemToDelete.id));
        setShowDetailModal(false); // Close detail if open
      }
    } else if (itemToDelete.type === "contribution") {
      // DELETE CONTRIBUTION
      // 1. Get the contribution amount first to subtract it
      const contribution = goalHistory.find((h) => h.id === itemToDelete.id);
      if (contribution) {
        await supabase
          .from("goal_contributions")
          .delete()
          .eq("id", itemToDelete.id);

        // 2. Update Goal Total
        const newTotal =
          (selectedGoal.current_amount || 0) - contribution.amount;
        await supabase
          .from("goals")
          .update({ current_amount: newTotal })
          .eq("id", selectedGoal.id);

        // 3. Update UI
        setGoalHistory(goalHistory.filter((h) => h.id !== itemToDelete.id));
        const updatedGoals = goals.map((g) =>
          g.id === selectedGoal.id ? { ...g, current_amount: newTotal } : g
        );
        setGoals(updatedGoals);
        setSelectedGoal({ ...selectedGoal, current_amount: newTotal });
      }
    }

    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // --- OPEN DETAIL VIEW ---
  const openGoalDetail = (goal) => {
    setSelectedGoal(goal);
    fetchHistory(goal.id);
    setShowDetailModal(true);
  };

  const getProgress = (current, target) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Savings Goals
          </h1>
          <p className="text-gray-500 mt-1">
            Track your progress toward things you want to buy.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
        >
          <Plus size={20} />
          New Goal
        </button>
      </div>

      {/* GOALS GRID */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-3xl text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <Trophy size={40} className="text-emerald-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No goals yet</h3>
          <p className="text-gray-500 max-w-sm mt-2 mb-8">
            Start saving for that new laptop, a graduation trip, or just a rainy
            day fund.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = getProgress(
              goal.current_amount,
              goal.target_amount
            );
            const isCompleted = percent >= 100;
            const IconObj = ICONS.find((i) => i.id === goal.icon) || ICONS[0];

            return (
              <div
                key={goal.id}
                onClick={() => openGoalDetail(goal)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${IconObj.bg} ${IconObj.text}`}
                  >
                    <IconObj.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {goal.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      {isCompleted ? "Completed" : "In Progress"}
                    </p>
                  </div>
                </div>

                <div className="mb-2 flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatMoney(goal.current_amount)}
                  </span>
                  <span className="text-sm text-gray-500 font-medium mb-1">
                    of {formatMoney(goal.target_amount)}
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                {isCompleted ? (
                  <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Goal Reached!
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Don't open detail view
                      setSelectedGoal(goal);
                      setShowAddMoneyModal(true);
                    }}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Money
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- GOAL DETAIL MODAL (Full View) --- */}
      {showDetailModal &&
        selectedGoal &&
        createPortal(
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Target size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedGoal.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Goal: {formatMoney(selectedGoal.target_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => initiateDelete("goal", selectedGoal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Big Progress Section */}
                <div className="text-center py-4">
                  <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                    Current Savings
                  </span>
                  <h1 className="text-5xl font-bold text-gray-900 mt-2 mb-6">
                    {formatMoney(selectedGoal.current_amount)}
                  </h1>

                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden mb-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${getProgress(
                          selectedGoal.current_amount,
                          selectedGoal.target_amount
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>0%</span>
                    <span>
                      {Math.round(
                        getProgress(
                          selectedGoal.current_amount,
                          selectedGoal.target_amount
                        )
                      )}
                      % Complete
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAddMoneyModal(true)}
                    className="py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Plus size={24} />
                    <span>Add Money</span>
                  </button>
                  <button
                    disabled
                    className="py-4 bg-gray-100 text-gray-400 rounded-xl font-bold flex flex-col items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <TrendingUp size={24} />
                    <span>Withdraw (Soon)</span>
                  </button>
                </div>

                {/* History List */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History size={20} className="text-gray-400" /> History
                  </h3>
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                    {historyLoading ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="animate-spin text-gray-400" />
                      </div>
                    ) : goalHistory.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        No deposits yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {goalHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 flex items-center justify-between hover:bg-white transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Plus size={16} strokeWidth={3} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  Deposit
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    item.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-bold text-emerald-600">
                                + {formatMoney(item.amount)}
                              </span>
                              <button
                                onClick={() =>
                                  initiateDelete("contribution", item.id)
                                }
                                className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Entry"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* --- ADD MONEY MODAL --- */}
      {showAddMoneyModal &&
        selectedGoal &&
        createPortal(
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <TrendingUp size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add to {selectedGoal.name}
                </h2>
              </div>
              <form onSubmit={handleAddMoney} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">
                    ₱
                  </span>
                  <input
                    type="number"
                    required
                    autoFocus
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-2xl font-bold text-center text-gray-900"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setContribution(amt.toString())}
                      className="py-2 rounded-lg bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      +₱{amt}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                >
                  Confirm Deposit
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* --- CREATE GOAL MODAL --- */}
      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Create New Goal
              </h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Laptop"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newGoal.name}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Target Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      ₱
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="25000"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg"
                      value={newGoal.target}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, target: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Choose Icon
                  </label>
                  <div className="flex gap-3">
                    {ICONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setNewGoal({ ...newGoal, icon: item.id })
                        }
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          newGoal.icon === item.id
                            ? "bg-gray-900 text-white ring-2 ring-offset-2 ring-gray-900"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <item.icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  Create Goal
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {showDeleteConfirm &&
        createPortal(
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fade-in text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {itemToDelete?.type === "goal"
                  ? "Delete Goal?"
                  : "Delete Entry?"}
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                {itemToDelete?.type === "goal"
                  ? "This will delete the goal and all its history permanently."
                  : "This will remove this deposit and decrease your total savings."}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-3 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
