import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { Eye, ShoppingBag } from "lucide-react";

export default function Index({ orders }) {
  const handleStatusChange = (orderId, newStatus) => {
    router.patch(route("admin.orders.update-status", orderId), { status: newStatus });
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500">
              <th className="py-3 px-4">Order Number</th>
              <th className="py-3 px-4">Customer Email</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Grand Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {orders.data.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{order.order_number}</td>
                <td className="py-3.5 px-4">{order.customer_email}</td>
                <td className="py-3.5 px-4 text-slate-500">{order.payment_method}</td>
                <td className="py-3.5 px-4 font-bold">${order.grand_total}</td>
                <td className="py-3.5 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
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
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
