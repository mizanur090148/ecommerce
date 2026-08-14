import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { Eye, Search, Filter, RotateCcw, Calendar, ShoppingBag, CreditCard, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function Index({ orders, filters }) {
  const [search, setSearch] = useState(filters?.search || "");
  const [status, setStatus] = useState(filters?.status || "");
  const [paymentStatus, setPaymentStatus] = useState(filters?.payment_status || "");

  // Debounced live search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        search !== (filters?.search || "") ||
        status !== (filters?.status || "") ||
        paymentStatus !== (filters?.payment_status || "")
      ) {
        router.get(
          route("admin.orders.index"),
          {
            search: search || undefined,
            status: status || undefined,
            payment_status: paymentStatus || undefined,
          },
          { preserveState: true, replace: true }
        );
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, status, paymentStatus]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    router.get(route("admin.orders.index"));
  };

  const handleStatusChange = (orderId, newStatus) => {
    router.patch(route("admin.orders.update-status", orderId), { status: newStatus });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadgeColor = (st) => {
    switch (st?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300";
      case "processing":
      case "packed":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300";
      case "delivered":
      case "completed":
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "cancelled":
      case "failed":
      case "refunded":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-6">
        {/* Top Header Controls & Search Filters */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Orders</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Orders: <span className="font-semibold text-slate-700 dark:text-slate-200">{orders.total}</span>
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href={route("admin.orders.create")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create Order
            </Link>

            {/* Live Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search order #, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Reset Filters */}
            {(search || status || paymentStatus) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-xl transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Order Number</th>
                  <th className="py-3.5 px-4">Order Type</th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Order Date
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Payment
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {orders.data && orders.data.length > 0 ? (
                  orders.data.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {order.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        {order.order_source === "manual_admin" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                            Manual
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            Online
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{order.customer_email}</div>
                        {order.customer_phone && (
                          <div className="text-xs text-slate-400">{order.customer_phone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {order.payment_method || "N/A"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ৳{Number(order.grand_total || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer ${getStatusBadgeColor(
                            order.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={route("admin.orders.show", order.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/70 dark:text-indigo-300 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500">
                      No customer orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Footer */}
          {orders.links && orders.links.length > 3 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{orders.from || 0}</span> to{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{orders.to || 0}</span> of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{orders.total}</span> orders
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {orders.links.map((link, idx) => {
                  if (!link.url) {
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1.5 text-xs text-slate-400 dark:text-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  }
                  return (
                    <Link
                      key={idx}
                      href={link.url}
                      preserveState
                      preserveScroll
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                        link.active
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
