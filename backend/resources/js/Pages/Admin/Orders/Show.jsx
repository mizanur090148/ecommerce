import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Printer } from "lucide-react";

export default function Show({ order }) {
  return (
    <AdminLayout title={`Order Details: ${order.order_number}`}>
      <div className="mb-6 flex justify-between items-center">
        <Link href={route("admin.orders.index")} className="inline-flex items-center text-sm font-semibold text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
        <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl">
          <Printer className="w-4 h-4 mr-2" /> Print Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex justify-between border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold">UOMO ENTERPRISE</h2>
            <p className="text-sm text-slate-500">Order #{order.order_number}</p>
            <p className="text-xs text-slate-400">Date: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full uppercase">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300">Billing Address</h4>
            <p>{order.billing_address?.first_name} {order.billing_address?.last_name}</p>
            <p>{order.billing_address?.street}</p>
            <p>{order.billing_address?.city}, {order.billing_address?.country}</p>
            <p>{order.customer_email}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300">Payment Information</h4>
            <p>Method: {order.payment_method}</p>
            <p>Status: {order.payment_status}</p>
          </div>
        </div>

        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Item</th>
              <th className="py-2">SKU</th>
              <th className="py-2">Unit Price</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-semibold">{item.product_name}</td>
                <td className="py-3 font-mono text-xs">{item.sku}</td>
                <td className="py-3">${item.unit_price}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3 text-right font-bold">${item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t pt-4">
          <div className="w-64 space-y-2 text-sm text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${order.shipping_total}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg text-indigo-600">
              <span>Grand Total:</span>
              <span>${order.grand_total}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
