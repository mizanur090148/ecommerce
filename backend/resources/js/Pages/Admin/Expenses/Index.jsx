import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, router } from "@inertiajs/react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Wallet,
  TrendingDown,
  Calendar,
  Filter,
  DollarSign,
  Truck,
  UserCheck,
  Package,
  Megaphone,
  Zap,
  Building,
  MoreHorizontal,
  CheckCircle2,
  Receipt,
  Download,
} from "lucide-react";

export default function Index({ expenses, summary, filters }) {
  const [editingExpense, setEditingExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const { data, setData, post, put, processing, reset, errors } = useForm({
    title: "",
    category: "carrying_cost",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    reference_number: "",
    note: "",
  });

  // Filter State
  const [search, setSearch] = useState(filters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(filters.category || "");
  const [selectedPayment, setSelectedPayment] = useState(filters.payment_method || "");
  const [startDate, setStartDate] = useState(filters.start_date || "");
  const [endDate, setEndDate] = useState(filters.end_date || "");

  const categoryLabels = {
    carrying_cost: { label: "Carrying / Freight Cost", icon: Truck, color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    delivery_cost: { label: "Delivery / Courier Fee", icon: Truck, color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    employee_cost: { label: "Employee Salary / Allowance", icon: UserCheck, color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
    marketing_cost: { label: "Marketing & Advertising", icon: Megaphone, color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
    utility_cost: { label: "Electricity / Utilities", icon: Zap, color: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
    packaging_cost: { label: "Packaging Supplies", icon: Package, color: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
    office_cost: { label: "Office & Rent Expenses", icon: Building, color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
    other: { label: "Other Overhead", icon: MoreHorizontal, color: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600" },
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    reset();
    setData("expense_date", new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date,
      payment_method: expense.payment_method || "cash",
      reference_number: expense.reference_number || "",
      note: expense.note || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExpense) {
      put(route("admin.expenses.update", editingExpense.id), {
        onSuccess: () => handleCloseModal(),
      });
    } else {
      post(route("admin.expenses.store"), {
        onSuccess: () => handleCloseModal(),
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      router.delete(route("admin.expenses.destroy", id));
    }
  };

  const handleApplyFilters = () => {
    router.get(
      route("admin.expenses.index"),
      {
        search,
        category: selectedCategory,
        payment_method: selectedPayment,
        start_date: startDate,
        end_date: endDate,
      },
      { preserveState: true }
    );
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedPayment("");
    setStartDate("");
    setEndDate("");
    router.get(route("admin.expenses.index"));
  };

  return (
    <AdminLayout title="Expense Management Tracker">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
            <Wallet className="w-7 h-7 mr-2.5 text-indigo-600" /> Operational Expense Records
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Track carrying costs, delivery fees, employee salaries, and operational costs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href={route("admin.expenses.export-csv", { search, category: selectedCategory, payment_method: selectedPayment, start_date: startDate, end_date: endDate })}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-emerald-600/20 flex items-center shrink-0"
          >
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </a>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Record New Expense
          </button>
        </div>
      </div>

      {/* 5 Metric Cards Guaranteed in 1 Single Horizontal Row */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.875rem', width: '100%', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Today's Cost</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
            ৳{summary.today.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1 truncate">Cost recorded today</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">This Week</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
            ৳{summary.this_week.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1 truncate">Cost recorded this week</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">This Month</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
            ৳{summary.this_month.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-1 truncate">Current monthly overhead</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">This Year</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
            ৳{summary.this_year.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-1 truncate">Annual operating budget</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Total Lifetime</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
            ৳{summary.total.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block mt-1 truncate">Cumulative cost to date</span>
        </div>
      </div>

      {/* FULL PAGE WIDTH Expense Log & Audit Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden w-full">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Log & Audit Table</h3>
            <span className="text-xs text-slate-500">Total Records: {expenses.total}</span>
          </div>

          {/* Filters Guaranteed in 1 Single Horizontal Row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'center', width: '100%' }} className="pt-1">
            <div style={{ flex: '2 1 0%', minWidth: 0 }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Title / Ref..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
              />
            </div>
            <div style={{ flex: '1.5 1 0%', minWidth: 0 }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 0%', minWidth: 0 }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
              />
            </div>
            <div style={{ flex: '1 1 0%', minWidth: 0 }}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
              />
            </div>
            <div style={{ flex: 'none', display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center shadow-sm shrink-0"
              >
                <Filter className="w-3.5 h-3.5 mr-1" /> Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition shrink-0"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Expense Title</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Amount (৳)</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Payment</th>
                <th className="py-3.5 px-4 font-semibold">Ref No.</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {expenses.data.length > 0 ? (
                expenses.data.map((item) => {
                  const catInfo = categoryLabels[item.category] || categoryLabels.other;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{item.title}</div>
                        {item.note && <div className="text-xs font-normal text-slate-500 truncate max-w-xs">{item.note}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400">
                        ৳{Number(item.amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {item.expense_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {item.reference_number || "--"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No expense records found. Click "Record New Expense" above to add your first expense.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Perfect Modal for Record / Edit Expense */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-all">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header (Ash Color) */}
            <div className="px-6 py-4 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingExpense ? "Edit Expense Record" : "Record New Expense"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fill in operational expense details below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-6 space-y-4">
                {/* Expense Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Expense Title / Particulars *
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    placeholder="e.g. Carrying Cost for Product Batch #104 or Delivery Salary"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                    required
                  />
                  {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={data.category}
                    onChange={(e) => setData("category", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                    required
                  >
                    <option value="carrying_cost">🚚 Carrying / Freight Cost</option>
                    <option value="delivery_cost">🛵 Delivery / Courier Fee</option>
                    <option value="employee_cost">👤 Employee Salary / Allowance</option>
                    <option value="marketing_cost">📢 Marketing & Ads</option>
                    <option value="utility_cost">💡 Utilities & Electricity</option>
                    <option value="packaging_cost">📦 Packaging Supplies</option>
                    <option value="office_cost">🏢 Office & Rent</option>
                    <option value="other">🔧 Other Overhead</option>
                  </select>
                </div>

                {/* Amount with Prefix Box (ZERO OVERLAP) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount (৳ BDT) *
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-900 transition">
                    <span className="px-3.5 py-2.5 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 border-r border-slate-200 dark:border-slate-700 text-sm select-none">
                      ৳
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={data.amount}
                      onChange={(e) => setData("amount", e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 bg-transparent border-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 focus:outline-none"
                      required
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                </div>

                {/* Grid Row: Date & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      value={data.expense_date}
                      onChange={(e) => setData("expense_date", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={data.payment_method}
                      onChange={(e) => setData("payment_method", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="bKash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Reference / Voucher No.
                  </label>
                  <input
                    type="text"
                    value={data.reference_number}
                    onChange={(e) => setData("reference_number", e.target.value)}
                    placeholder="e.g. VOUCHER-8902"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                  />
                </div>

                {/* Note / Remarks */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Note / Remarks
                  </label>
                  <textarea
                    value={data.note}
                    onChange={(e) => setData("note", e.target.value)}
                    rows="2"
                    placeholder="Add additional remarks or notes..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer Actions (Ash Color) */}
              <div className="px-6 py-3.5 bg-slate-100/90 dark:bg-slate-800/90 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingExpense ? "Save Changes" : "Record Expense"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
