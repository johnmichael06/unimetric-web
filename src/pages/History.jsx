import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Search,
  Filter,
  Coffee,
  Bus,
  BookOpen,
  Wifi,
  ShoppingBag,
  Zap,
  Loader2,
  Calendar,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "Food",
    label: "Food & Dining",
    icon: Coffee,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "Transport",
    label: "Transportation",
    icon: Bus,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "School",
    label: "School Supplies",
    icon: BookOpen,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "Utilities",
    label: "Utilities",
    icon: Zap,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "Personal",
    label: "Personal",
    icon: ShoppingBag,
    color: "bg-pink-100 text-pink-600",
  },
];

export default function History() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch ALL expenses (no limit)
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error) setExpenses(data || []);
    setLoading(false);
  }

  // --- FILTER LOGIC ---
  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch = item.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // --- GROUP BY MONTH LOGIC ---
  // Transforms array into: { "January 2026": [...items], "December 2025": [...items] }
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(expense);
    return groups;
  }, {});

  const getCategory = (id) =>
    CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Transaction History
          </h1>
          <p className="text-gray-500 text-sm">
            View and search your past spending.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white w-full sm:w-auto cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="space-y-8">
        {Object.keys(groupedExpenses).length > 0 ? (
          Object.keys(groupedExpenses).map((month) => (
            <div key={month} className="animate-fade-in">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                {month}
              </h3>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {groupedExpenses[month].map((expense, idx) => {
                  const category = getCategory(expense.category);
                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                        idx !== groupedExpenses[month].length - 1
                          ? "border-b border-gray-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color} bg-opacity-20`}
                        >
                          {React.createElement(category.icon, { size: 18 })}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {category.label} •{" "}
                            {new Date(expense.date).toLocaleDateString(
                              "en-US",
                              { day: "numeric", weekday: "short" }
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-900">
                        ₱{expense.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-900 font-medium">No transactions found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div> // Trigger update
  );
}
