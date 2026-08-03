import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";

export default function Index({ brands }) {
  const { data, setData, post, processing, reset } = useForm({
    name: "",
    description: "",
    is_active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.brands.store"), { onSuccess: () => reset() });
  };

  const handleDelete = (id) => {
    if (confirm("Delete brand?")) {
      router.delete(route("admin.brands.destroy", id));
    }
  };

  return (
    <AdminLayout title="Brand Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Brand</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Brand Name *</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition"
            >
              Save Brand
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Products Count</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {brands.data.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-4 font-semibold">{b.name}</td>
                  <td className="py-3 px-4">{b.products_count} products</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(b.id)} className="text-rose-500 hover:text-rose-700">
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
