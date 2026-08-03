import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";

export default function Index({ coupons }) {
  const { data, setData, post, reset } = useForm({
    code: "",
    type: "percentage",
    value: "",
    min_spend: "",
    is_active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.coupons.store"), { onSuccess: () => reset() });
  };

  const handleDelete = (id) => {
    if (confirm("Delete coupon?")) {
      router.delete(route("admin.coupons.destroy", id));
    }
  };

  return (
    <AdminLayout title="Coupon Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Create Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Coupon Code *</label>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData("code", e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Value *</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.value}
                  onChange={(e) => setData("value", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl">
              Save Coupon
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b text-slate-500">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Used Count</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {coupons.data.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.code}</td>
                  <td className="py-3 px-4 font-bold">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="py-3 px-4">{c.used_count} times</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
