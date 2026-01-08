import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Search,
  Coffee,
  Bus,
  BookOpen,
  Wifi,
  ShoppingBag,
  Zap,
  Loader2,
  X,
  Trash2,
  Pencil,
  AlertTriangle,
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

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // State for Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "Food",
    description: "",
  });

  // --- FETCH DATA ---
  const fetchExpenses = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error) setExpenses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // --- HANDLE SUBMIT (ADD OR UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      category: formData.categoryId,
      description: formData.description || "No description",
      date: new Date().toISOString(),
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("expenses")
        .update({
          amount: payload.amount,
          category: payload.category,
          description: payload.description,
        })
        .eq("id", currentId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("expenses")
        .insert([payload]);
      error = insertError;
    }

    if (!error) {
      closeModal();
      fetchExpenses();
    } else {
      alert("Error: " + error.message);
    }
  };

  // --- DELETE LOGIC ---
  const initiateDelete = (id) => {
    setExpenseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseToDelete);

    if (!error) {
      setExpenses(expenses.filter((item) => item.id !== expenseToDelete));
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } else {
      alert("Error deleting: " + error.message);
    }
    setIsDeleting(false);
  };

  // --- HELPER FUNCTIONS ---
  const openAddModal = () => {
    setFormData({ amount: "", categoryId: "Food", description: "" });
    setIsEditing(false);
    setCurrentId(null);
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setFormData({
      amount: expense.amount,
      categoryId: expense.category,
      description: expense.description,
    });
    setIsEditing(true);
    setCurrentId(expense.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ amount: "", categoryId: "Food", description: "" });
  };

  const getCategory = (id) =>
    CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Expenses
          </h1>
          <p className="text-gray-500 text-sm">Track where your money goes.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* EXPENSES TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center text-gray-500">
            <Loader2 className="animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((expense) => {
                const category = getCategory(expense.category);
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${category.color} bg-opacity-10`}
                        >
                          {React.createElement(category.icon, { size: 16 })}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {category.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right font-mono">
                      ₱{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => initiateDelete(expense.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No expenses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all scale-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Expense" : "New Expense"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-mono text-lg"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description{" "}
                  <span className="text-gray-400 font-normal ml-1">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What was this for?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 active:scale-[0.98]"
              >
                {isEditing ? "Save Changes" : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl transform transition-all scale-100 animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-1">
                <AlertTriangle className="text-red-600" size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Expense?
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to remove this expense? This action
                  cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
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
        </div>
      )}
    </div>
  );
}
