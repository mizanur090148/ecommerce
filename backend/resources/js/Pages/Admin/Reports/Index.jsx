import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { router, Link } from "@inertiajs/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Wallet,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  Clock,
  Truck,
  UserCheck,
  Package,
  Megaphone,
  Zap,
  Building,
  MoreHorizontal,
  Download,
} from "lucide-react";

export default function Index({ period, date_range, metrics, category_breakdown, recent_expenses, recent_orders, filters }) {
  const [activePeriod, setActivePeriod] = useState(period || "this_month");
  const [startDate, setStartDate] = useState(filters.start_date || date_range.start);
  const [endDate, setEndDate] = useState(filters.end_date || date_range.end);

  const categoryLabels = {
    carrying_cost: { label: "Carrying / Freight Cost", icon: Truck, color: "bg-amber-50 text-amber-700 border-amber-200" },
    delivery_cost: { label: "Delivery / Courier Fee", icon: Truck, color: "bg-blue-50 text-blue-700 border-blue-200" },
    employee_cost: { label: "Employee Salary / Allowance", icon: UserCheck, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    marketing_cost: { label: "Marketing & Advertising", icon: Megaphone, color: "bg-purple-50 text-purple-700 border-purple-200" },
    utility_cost: { label: "Electricity / Utilities", icon: Zap, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    packaging_cost: { label: "Packaging Supplies", icon: Package, color: "bg-orange-50 text-orange-700 border-orange-200" },
    office_cost: { label: "Office & Rent Expenses", icon: Building, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    other: { label: "Other Overhead", icon: MoreHorizontal, color: "bg-slate-100 text-slate-700 border-slate-200" },
  };

  const handlePeriodChange = (newPeriod) => {
    setActivePeriod(newPeriod);
    if (newPeriod !== "custom") {
      router.get(route("admin.reports.index"), { period: newPeriod }, { preserveState: true });
    }
  };

  const handleApplyCustomDate = () => {
    router.get(
      route("admin.reports.index"),
      {
        period: "custom",
        start_date: startDate,
        end_date: endDate,
      },
      { preserveState: true }
    );
  };

  const isProfitable = metrics.net_profit >= 0;

  return (
    <AdminLayout title="Financial Reports & Profit Analytics">
      {/* Timeframe Selector Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-900 dark:text-white">Reporting Timeframe:</span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
            {date_range.start} to {date_range.end}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {[
            { key: "today", label: "Today" },
            { key: "this_week", label: "This Week" },
            { key: "this_month", label: "This Month" },
            { key: "this_year", label: "This Year" },
            { key: "custom", label: "Custom Range" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => handlePeriodChange(p.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activePeriod === p.key
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}

          <a
            href={route("admin.reports.export-csv", { period: activePeriod, start_date: startDate, end_date: endDate })}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center ml-2 shrink-0"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </a>
        </div>
      </div>

      {/* Custom Date Inputs if Custom Selected */}
      {activePeriod === "custom" && (
        <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"
            />
          </div>
          <button
            onClick={handleApplyCustomDate}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Executive Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Gross Sales */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            ৳{metrics.gross_sales.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 flex items-center">
            <ShoppingBag className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            <span>{metrics.orders_count} orders (Avg: ৳{metrics.avg_order_value})</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Operational Costs</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            ৳{metrics.total_expenses.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 flex items-center">
            <Wallet className="w-3.5 h-3.5 mr-1 text-rose-500" />
            <span>Recorded operational expenses</span>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit / Loss</span>
            <div className={`p-2.5 rounded-xl ${isProfitable ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {isProfitable ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            </div>
          </div>
          <div className={`text-3xl font-black mb-1 ${isProfitable ? "text-emerald-600" : "text-rose-600"}`}>
            ৳{metrics.net_profit.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 flex items-center">
            <span>Sales minus operational expenses</span>
          </div>
        </div>

        {/* Profit Margin % */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {metrics.profit_margin}%
          </div>
          <div className="text-xs text-slate-500 flex items-center">
            <span>Net margin on total revenue</span>
          </div>
        </div>
      </div>

      {/* Expense Category Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-indigo-600" /> Expense Category Distribution
          </h3>

          {category_breakdown.length > 0 ? (
            <div className="space-y-4">
              {category_breakdown.map((item) => {
                const catInfo = categoryLabels[item.category] || categoryLabels.other;
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200">{catInfo.label}</span>
                      <span className="text-slate-900 dark:text-white">
                        ৳{Number(item.total_amount).toLocaleString("en-BD")} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expense categories recorded for this timeframe.
            </div>
          )}
        </div>

        {/* Recent Financial Activity: Orders & Expenses Ledgers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Orders Ledger */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-emerald-600" /> Sales Orders Ledger
              </h3>
              <Link href={route("admin.orders.index")} className="text-xs font-bold text-indigo-600 hover:underline">
                View All Orders &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3 font-semibold">Order No</th>
                    <th className="py-2.5 px-3 font-semibold">Total Revenue</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Payment</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {recent_orders && recent_orders.length > 0 ? (
                    recent_orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-2.5 px-3 font-bold text-indigo-600">#{o.order_number}</td>
                        <td className="py-2.5 px-3 font-black text-emerald-600">
                          ৳{Number(o.grand_total || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No sales orders found for this timeframe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Expenses Ledger */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-rose-600" /> Operational Expenses Audit Ledger
              </h3>
              <Link href={route("admin.expenses.index")} className="text-xs font-bold text-indigo-600 hover:underline">
                Manage Expenses &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3 font-semibold">Title</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Amount</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Expense Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {recent_expenses && recent_expenses.length > 0 ? (
                    recent_expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {exp.title}
                          {exp.reference_number && (
                            <span className="block text-[10px] font-normal text-slate-400">Ref: {exp.reference_number}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {exp.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-black text-rose-600">
                          ৳{Number(exp.amount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {exp.expense_date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-400">
                        No operational expenses recorded for this timeframe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
