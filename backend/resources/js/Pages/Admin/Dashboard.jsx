import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, ArrowUpRight, CheckCircle } from "lucide-react";

export default function Dashboard({ metrics }) {
  const { kpis, recent_orders, low_stock_products } = metrics;

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">৳{kpis.total_revenue}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpis.total_orders}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Customers</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpis.total_customers}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Catalog Products</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpis.total_products}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
            <Link
              href={route("admin.orders.index")}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4">{order.customer_email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ৳{order.grand_total}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={route("admin.orders.show", order.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Low Stock Alerts</h2>
            </div>
          </div>

          <div className="space-y-4">
            {low_stock_products.length > 0 ? (
              low_stock_products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700"
                >
                  <div className="truncate mr-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono">SKU: {item.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex-shrink-0">
                    {item.stock_quantity} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">All items have sufficient stock levels.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
