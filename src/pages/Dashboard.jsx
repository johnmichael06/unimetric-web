import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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

export default function Dashboard({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'

  const [budgets, setBudgets] = useState({ monthly: 0, weekly: 0 });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  const [metrics, setMetrics] = useState({
    totalSpent: 0,
    electricityCost: 0,
    recentTransactions: [],
    chartData: [],
  });

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
    <div className="space-y-8">
      {/* --- POLISHED HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Overview
          </h1>
          <p className="text-gray-500 mt-1">
            {timeRange === "week"
              ? "Spending for this week (Mon-Sun)."
              : timeRange === "month"
              ? "Spending for this current month."
              : "Yearly spending summary."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Custom Segmented Control */}
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center">
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
              className={`
              relative group bg-white border border-gray-200 rounded-xl px-4 py-2 min-w-[180px] shadow-sm transition-all
              ${
                isEditingBudget
                  ? "ring-2 ring-brand-500 border-transparent"
                  : "hover:border-brand-300"
              }
            `}
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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
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
    </div>
  );
}
