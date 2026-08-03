import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm } from "@inertiajs/react";
import { Save } from "lucide-react";

export default function Index({ settings }) {
  const { data, setData, post, processing } = useForm({
    store_name: settings.store_name || "Uomo Enterprise eCommerce",
    store_email: settings.store_email || "sale@uomo.com",
    store_phone: settings.store_phone || "+1 246-345-0695",
    store_address: settings.store_address || "1418 River Drive, Suite 35 Cottonhall, CA 9622 United States",
    currency_code: settings.currency_code || "USD",
    currency_symbol: settings.currency_symbol || "$",
    shipping_flat_rate: settings.shipping_flat_rate || "5.00",
    tax_rate_percent: settings.tax_rate_percent || "10.0",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.settings.update"));
  };

  return (
    <AdminLayout title="Enterprise Store Settings">
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Store Identity & Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Store Name</label>
              <input
                type="text"
                value={data.store_name}
                onChange={(e) => setData("store_name", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={data.store_email}
                onChange={(e) => setData("store_email", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Support Phone</label>
              <input
                type="text"
                value={data.store_phone}
                onChange={(e) => setData("store_phone", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Store Address</label>
              <input
                type="text"
                value={data.store_address}
                onChange={(e) => setData("store_address", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Currency & Shipping Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Currency Code</label>
              <input
                type="text"
                value={data.currency_code}
                onChange={(e) => setData("currency_code", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={data.currency_symbol}
                onChange={(e) => setData("currency_symbol", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Flat Rate Shipping ($)</label>
              <input
                type="number"
                step="0.01"
                value={data.shipping_flat_rate}
                onChange={(e) => setData("shipping_flat_rate", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={data.tax_rate_percent}
                onChange={(e) => setData("tax_rate_percent", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4 mr-2" /> Save Store Settings
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
