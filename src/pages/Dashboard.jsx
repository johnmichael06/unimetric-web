import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import {
  TrendingUp,
  Loader2,
  Zap,
  Wallet,
  Pencil,
  Check,
  X,
  Calendar,
  ArrowUpRight,
  Target,
  Trophy,
  Plus,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  parseISO,
} from "date-fns";

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

export default function Dashboard({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState("month");

  const [budgets, setBudgets] = useState({ monthly: 0, weekly: 0 });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  const [metrics, setMetrics] = useState({
    totalSpent: 0,
    electricityCost: 0,
    recentTransactions: [],
    chartData: [],
    goals: [],
  });

  // --- 2. TOUR LOGIC ---
  useEffect(() => {
    if (!loading && !localStorage.getItem("hasSeenDashboardTour")) {
      startTour();
    }
  }, [loading]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: "Finish",
      nextBtnText: "Next",
      prevBtnText: "Back",
      steps: [
        {
          element: "#overview-header",
          popover: {
            title: "Welcome to UniMetric!",
            description:
              "Here is a quick overview of your financial health. Let me show you around.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#time-range-selector",
          popover: {
            title: "Time Views",
            description:
              "Switch between Weekly, Monthly, and Yearly views to analyze your spending.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#budget-widget",
          popover: {
            title: "Set Your Budget",
            description:
              "This is crucial! Click the Pencil icon here to set your spending limit for the month.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#electricity-card",
          popover: {
            title: "Electricity Monitor",
            description:
              "Keep an eye on your estimated electric bill here. Click it to add new meter readings.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#goals-section",
          popover: {
            title: "Savings Goals",
            description:
              "Track your progress towards that new laptop or trip here.",
            side: "top",
            align: "start",
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem("hasSeenDashboardTour", "true");
      },
    });

    driverObj.drive();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  async function fetchDashboardData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // Fetch Budgets
    const { data: profile } = await supabase
      .from("profiles")
      .select("monthly_budget, weekly_budget")
      .eq("id", user.id)
      .single();
    if (profile)
      setBudgets({
        monthly: profile.monthly_budget || 0,
        weekly: profile.weekly_budget || 0,
      });

    // Date Range Logic
    const now = new Date();
    let startDate, endDate;
    if (timeRange === "week") {
      startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      endDate = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
    } else if (timeRange === "month") {
      startDate = startOfMonth(now).toISOString();
      endDate = endOfMonth(now).toISOString();
    } else {
      startDate = startOfYear(now).toISOString();
      endDate = endOfYear(now).toISOString();
    }

    // Fetch Expenses
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    // Fetch Electricity
    const { data: elecData } = await supabase
      .from("electricity_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("reading_date", { ascending: false })
      .limit(1);

    // Fetch Goals
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    // Aggregations
    const totalSpent =
      expensesData?.reduce((sum, item) => sum + item.amount, 0) || 0;

    const expenseMap = {};
    expensesData?.forEach((item) => {
      const dateKey =
        timeRange === "year"
          ? format(parseISO(item.date), "MMM")
          : format(parseISO(item.date), "MMM d");
      expenseMap[dateKey] = (expenseMap[dateKey] || 0) + item.amount;
    });

    const chartData = Object.keys(expenseMap)
      .map((key) => ({ name: key, amount: expenseMap[key] }))
      .reverse();

    setMetrics({
      totalSpent,
      electricityCost: elecData?.[0]?.estimated_cost || 0,
      recentTransactions: expensesData?.slice(0, 5) || [],
      chartData,
      goals: goalsData || [],
    });
    setLoading(false);
  }

  const handleSaveBudget = async () => {
    if (!tempBudget || isNaN(tempBudget)) return;
    const newAmount = parseFloat(tempBudget);
    const column = timeRange === "week" ? "weekly_budget" : "monthly_budget";

    const { error } = await supabase
      .from("profiles")
      .update({ [column]: newAmount })
      .eq("id", user.id);
    if (!error) {
      setBudgets((prev) => ({
        ...prev,
        [timeRange === "week" ? "weekly" : "monthly"]: newAmount,
      }));
      setIsEditingBudget(false);
    }
  };

  const getProgress = (current, target) => {
    if (target === 0) return 0;
    const percent = (current / target) * 100;
    return Math.min(percent, 100);
  };

  if (loading)
    return (
      <div className="py-32 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" />
      </div>
    );

  const currentBudgetLimit =
    timeRange === "week" ? budgets.weekly : budgets.monthly;
  const showBudget = timeRange !== "year";
  const budgetRemaining = currentBudgetLimit - metrics.totalSpent;
  const budgetProgress =
    currentBudgetLimit > 0
      ? (metrics.totalSpent / currentBudgetLimit) * 100
      : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* 3. CUSTOM STYLES FOR THE TOUR BUTTONS */}
      <style>{`
        /* Make the NEXT/DONE button Emerald Green */
        .driver-popover-next-btn {
          background-color: #059669 !important; /* emerald-600 */
          color: white !important;
          border: none !important;
          text-shadow: none !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
        }
        .driver-popover-next-btn:hover {
          background-color: #047857 !important; /* emerald-700 */
        }

        /* Make the BACK button simpler */
        .driver-popover-prev-btn {
          background-color: transparent !important;
          color: #6B7280 !important; /* gray-500 */
          border: 1px solid #E5E7EB !important; /* gray-200 */
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
        }
        .driver-popover-prev-btn:hover {
          background-color: #F3F4F6 !important; /* gray-100 */
        }
        
        /* Optional: Smooth the popover corners */
        .driver-popover {
          border-radius: 12px !important;
          padding: 16px !important;
        }
        
        /* Fix title font */
        .driver-popover-title {
          font-family: inherit !important;
          font-weight: 700 !important;
          font-size: 1.1rem !important;
          margin-bottom: 8px !important;
        }
        .driver-popover-description {
          font-family: inherit !important;
          color: #4B5563 !important; /* gray-600 */
          margin-bottom: 16px !important;
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div id="overview-header">
          {" "}
          {/* ID FOR TOUR */}
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Overview
            </h1>
            {/* Manual Tour Trigger */}
            <button
              onClick={startTour}
              className="text-gray-400 hover:text-brand-600 transition-colors"
              title="Start Tour"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          <p className="text-gray-500 mt-1">
            {timeRange === "week"
              ? "Spending for this week (Mon-Sun)."
              : timeRange === "month"
              ? "Spending for this current month."
              : "Yearly spending summary."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Segmented Control */}
          <div
            id="time-range-selector"
            className="bg-gray-100/80 p-1 rounded-xl flex items-center"
          >
            {" "}
            {/* ID FOR TOUR */}
            {["week", "month", "year"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
                  timeRange === t
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Budget Widget */}
          {showBudget && (
            <div
              id="budget-widget" // <--- ID FOR TOUR: HIGHLIGHTS MONTHLY LIMIT
              className={`relative group bg-white border border-gray-200 rounded-xl px-4 py-2 min-w-[180px] shadow-sm transition-all ${
                isEditingBudget
                  ? "ring-2 ring-brand-500 border-transparent"
                  : "hover:border-brand-300"
              }`}
            >
              {isEditingBudget ? (
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-medium">₱</span>
                    <input
                      type="number"
                      className="w-24 bg-transparent outline-none font-bold text-gray-900 placeholder-gray-300"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      placeholder={currentBudgetLimit}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleSaveBudget}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditingBudget(false)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setTempBudget(currentBudgetLimit);
                    setIsEditingBudget(true);
                  }}
                  className="cursor-pointer h-full flex flex-col justify-center"
                >
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">
                    {timeRange} Limit
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {formatMoney(currentBudgetLimit)}
                    </span>
                    <Pencil
                      size={14}
                      className="text-gray-300 group-hover:text-brand-500 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase">
              {timeRange}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Spent</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {formatMoney(metrics.totalSpent)}
          </h3>
        </div>

        {/* Electricity */}
        <div
          id="electricity-card"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          {" "}
          {/* ID FOR TOUR */}
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
              <Zap size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Latest <ArrowUpRight size={12} />
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">Electricity Est.</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {formatMoney(metrics.electricityCost)}
          </h3>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          {showBudget ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    budgetRemaining < 0
                      ? "bg-red-50 text-red-500"
                      : "bg-green-50 text-green-500"
                  }`}
                >
                  <TrendingUp size={24} />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    budgetRemaining < 0
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {budgetRemaining < 0 ? "OVER BUDGET" : "ON TRACK"}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <h3
                className={`text-3xl font-bold mt-1 ${
                  budgetRemaining < 0 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatMoney(budgetRemaining)}
              </h3>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetProgress > 100 ? "bg-red-500" : "bg-brand-500"
                  }`}
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                ></div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Calendar size={32} className="mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-500">
                Budget tracking unavailable
                <br />
                in Yearly view
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- CHART & LISTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Activity Trend
          </h3>
          <div className="h-72">
            {metrics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F3F4F6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickFormatter={(val) => `₱${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: "#F9FAFB" }}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value) => [`₱${value}`, "Spent"]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No spending data for this period.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {metrics.recentTransactions.length > 0 ? (
              metrics.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                        {tx.description}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {tx.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-gray-900">
                      ₱{tx.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Wallet size={32} className="mb-2 opacity-20" />
                <p>No recent transactions.</p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate("history")}
            className="w-full mt-4 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
          >
            View All History
          </button>
        </div>
      </div>

      {/* --- GOALS OVERVIEW SECTION --- */}
      <div id="goals-section">
        {" "}
        {/* ID FOR TOUR */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Your Goals</h3>
          <button
            onClick={() => onNavigate("goals")}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            View all goals
          </button>
        </div>
        {metrics.goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.goals.map((goal) => {
              const percent = getProgress(
                goal.current_amount,
                goal.target_amount
              );
              const IconObj = ICONS.find((i) => i.id === goal.icon) || ICONS[0];

              return (
                <div
                  key={goal.id}
                  onClick={() => onNavigate("goals")}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${IconObj.bg} ${IconObj.text}`}
                      >
                        <IconObj.icon size={20} />
                      </div>
                      <h4 className="font-bold text-gray-900">{goal.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      {Math.round(percent)}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {formatMoney(goal.current_amount)}
                      </span>
                      <span className="text-gray-400">
                        of {formatMoney(goal.target_amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={() => onNavigate("goals")}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/10 transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm">
              <Plus
                size={24}
                className="text-gray-400 group-hover:text-brand-500"
              />
            </div>
            <h4 className="font-bold text-gray-900">Start Saving</h4>
            <p className="text-sm text-gray-500 mt-1">
              Create your first savings goal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
