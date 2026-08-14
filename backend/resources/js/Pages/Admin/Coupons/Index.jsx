import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, router } from "@inertiajs/react";
import { Trash2, Sparkles, Tag, DollarSign, Percent, Truck, Calendar, ShieldCheck, RefreshCw } from "lucide-react";

export default function Index({ coupons }) {
  const { data, setData, post, reset, processing, errors } = useForm({
    code: "",
    type: "percentage",
    value: "20",
    min_spend: "",
    usage_limit: "",
    expires_at: "",
    is_active: true,
  });

  const generateRandomCode = () => {
    const prefixes = ["SALE", "OFF", "PROMO", "DEAL", "SPECIAL", "VIP"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    setData("code", `${randomPrefix}${randomNumber}`);
  };

  const applyDiscountPreset = (percent) => {
    setData((prev) => ({
      ...prev,
      type: "percentage",
      value: percent.toString(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.coupons.store"), {
      onSuccess: () => reset(),
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      router.delete(route("admin.coupons.destroy", id));
    }
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.is_active) {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">Disabled</span>;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600">Expired</span>;
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600">Limit Reached</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">Active</span>;
  };

  return (
    <AdminLayout title="Advanced Coupon & Promotion Manager">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Advanced Coupon Form */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Tag className="w-5 h-5 mr-2 text-indigo-600" /> Create Advanced Coupon
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold">Coupon Code *</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Auto Generate
                </button>
              </div>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData("code", e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-300"
                placeholder="e.g. SUMMER50"
                required
              />
              {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
            </div>

            {/* Discount Type Selector */}
            <div>
              <label className="block text-sm font-semibold mb-1">Discount Type *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setData("type", "percentage")}
                  className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center ${
                    data.type === "percentage"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 mr-1" /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setData("type", "fixed")}
                  className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center ${
                    data.type === "fixed"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" /> Fixed
                </button>
                <button
                  type="button"
                  onClick={() => setData("type", "free_shipping")}
                  className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center ${
                    data.type === "free_shipping"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 mr-1" /> Free Ship
                </button>
              </div>
            </div>

            {/* Quick Percentage Presets */}
            {data.type === "percentage" && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Quick Percentage Presets:</label>
                <div className="flex space-x-2">
                  {[10, 20, 30, 50, 70].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyDiscountPreset(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        data.value === pct.toString()
                          ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1">
                {data.type === "percentage" ? "Discount Percentage (%) *" : data.type === "fixed" ? "Discount Amount (৳) *" : "Shipping Discount Value (৳)"}
              </label>
              <input
                type="number"
                step="0.01"
                value={data.value}
                onChange={(e) => setData("value", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Min Spend (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.min_spend}
                  onChange={(e) => setData("min_spend", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={data.usage_limit}
                  onChange={(e) => setData("usage_limit", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Expiration Date</label>
              <input
                type="date"
                value={data.expires_at}
                onChange={(e) => setData("expires_at", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData("is_active", e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Coupon Active Status</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              Save Advanced Coupon
            </button>
          </form>
        </div>

        {/* Coupons Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Promotional Coupons Directory ({coupons.total})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Coupon Code</th>
                  <th className="py-3 px-4 font-semibold">Discount Value</th>
                  <th className="py-3 px-4 font-semibold">Usage & Limits</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {coupons.data.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {c.type === "percentage" ? (
                        <span className="text-emerald-600 dark:text-emerald-400">{c.value}% OFF</span>
                      ) : c.type === "fixed" ? (
                        <span className="text-indigo-600 dark:text-indigo-400">৳{c.value} OFF</span>
                      ) : (
                        <span className="text-sky-600 dark:text-sky-400">Free Shipping</span>
                      )}
                      {c.min_spend && <span className="block text-xs text-slate-400">Min spend: ৳{c.min_spend}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <div>Used: {c.used_count} times</div>
                      <div>Limit: {c.usage_limit ? c.usage_limit : "Unlimited"}</div>
                    </td>
                    <td className="py-3 px-4">{getCouponStatus(c)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
