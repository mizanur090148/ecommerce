import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { ArrowLeft, Printer, CheckCircle, Clock, CreditCard, ShieldCheck, MapPin, Building, Phone, Mail } from "lucide-react";

export default function Show({ order }) {
  const [status, setStatus] = useState(order.status || "pending");
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status || "pending");
  const [saving, setSaving] = useState(false);

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setSaving(true);
    router.patch(
      route("admin.orders.update-status", order.id),
      { status, payment_status: paymentStatus },
      {
        onFinish: () => setSaving(false),
      }
    );
  };

  const handlePrint = () => {
    window.print();
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

  const getStatusColor = (st) => {
    switch (st?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      case "processing":
      case "packed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      case "delivered":
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "cancelled":
      case "failed":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <AdminLayout title={`Order Details: ${order.order_number}`}>
      {/* Print Specific CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printableInvoice, #printableInvoice * {
            visibility: visible;
          }
          #printableInvoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Top Header Actions (No Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <Link
            href={route("admin.orders.index")}
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders List
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={route("admin.orders.invoice", order.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4 mr-2" /> Download PDF Invoice
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Invoice
            </button>
          </div>
        </div>

        {/* Order Status & Payment Status Edit Control Box (No Print) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm no-print">
          <form onSubmit={handleUpdateStatus} className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">Update Order Status:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Order Status Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Order:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Payment Status Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Payment:</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Printable Official Invoice Container */}
        <div
          id="printableInvoice"
          className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8"
        >
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-6 gap-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                GENTLE STYLE
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official Commercial Sales Receipt & Tax Invoice
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                <p>📍 Head Office: Level 8, Tower 14, Gulshan-2, Dhaka 1212 (+880 1733-714009)</p>
                <p>🏢 Branch: SS Road, Sirajganj 6700 (+880 1610-608835)</p>
                <p>✉️ Email: sale@gentlestyle.com</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-2">
              <div className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                {order.order_number}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Date: <strong className="text-slate-700 dark:text-slate-200">{formatDate(order.created_at)}</strong>
              </p>
              <div className="flex items-center gap-2 sm:justify-end pt-1">
                <span className={`px-3 py-1 text-xs font-bold rounded-md uppercase border ${getStatusColor(order.status)}`}>
                  Status: {order.status}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-md uppercase border ${getStatusColor(order.payment_status)}`}>
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-2">
                Customer & Billing Address
              </h4>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {order.billing_address?.firstName || "Customer"} {order.billing_address?.lastName || ""}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {order.billing_address?.address || order.billing_address?.street || "Standard Shipping Address"}
              </p>
              <p className="text-slate-600 dark:text-slate-300">{order.billing_address?.city || "Dhaka"}, Bangladesh</p>
              <p className="text-slate-500 pt-1 font-mono text-xs">✉️ {order.customer_email}</p>
              {order.customer_phone && <p className="text-slate-500 font-mono text-xs">📞 {order.customer_phone}</p>}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-2">
                Payment & Dispatch Summary
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                Payment Channel: <strong className="text-slate-900 dark:text-white">{order.payment_method}</strong>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Payment Status: <strong className="text-slate-900 dark:text-white capitalize">{order.payment_status}</strong>
              </p>
              {order.order_notes && (
                <p className="text-xs text-slate-500 pt-2 italic">
                  Note: "{order.order_notes}"
                </p>
              )}
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4 text-center">Unit Price</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.product_name}
                      </div>
                      {item.variant_id && (
                        <span className="inline-block mt-0.5 text-[11px] font-mono px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                          Variant #{item.variant_id}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {item.sku || `PRD-${item.product_id}`}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                      ৳{Number(item.unit_price || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ৳{Number(item.subtotal || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Signature Line */}
          <div className="flex flex-col sm:flex-row justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-6 gap-6">
            <div className="text-xs text-slate-400 max-w-sm space-y-1">
              <p>Thank you for shopping with Gentle Style!</p>
              <p>For support inquiries, contact <strong>sale@gentlestyle.com</strong> or <strong>+880 1733-714009</strong>.</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal:</span>
                <span>৳{Number(order.subtotal || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(order.discount_total || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span>-৳{Number(order.discount_total).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping Charge:</span>
                <span>৳{Number(order.shipping_total || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-lg text-indigo-600 dark:text-indigo-400">
                <span>Grand Total:</span>
                <span>৳{Number(order.grand_total || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Official Signature Footer for Printed Invoice */}
          <div className="hidden print:flex justify-between items-end pt-16 text-xs text-slate-600">
            <div className="border-t border-slate-400 pt-1 w-44 text-center">
              Customer Signature
            </div>
            <div className="border-t border-slate-400 pt-1 w-44 text-center font-bold">
              Authorized Store Stamp
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
