import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, Link, router } from "@inertiajs/react";
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Save Brand
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Brand List ({brands.total})</span>
          </div>

          <div className="overflow-x-auto">
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

          {/* Server-Side Pagination Bar */}
          {brands.total > 0 && (
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{brands.from || 0}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{brands.to || 0}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{brands.total}</span> brands
              </div>

              {brands.links && brands.links.length > 3 && (
                <div className="flex items-center space-x-1">
                  {brands.links.map((link, key) => {
                    if (link.url === null) {
                      return (
                        <span
                          key={key}
                          className="px-3 py-1.5 text-xs rounded-lg text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }

                    return (
                      <Link
                        key={key}
                        href={link.url}
                        preserveState
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          link.active
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
