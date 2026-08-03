import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";

export default function Index({ blogs }) {
  const { data, setData, post, reset } = useForm({
    title: "",
    content: "",
    is_published: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.blogs.store"), { onSuccess: () => reset() });
  };

  const handleDelete = (id) => {
    if (confirm("Delete article?")) {
      router.delete(route("admin.blogs.destroy", id));
    }
  };

  return (
    <AdminLayout title="Blog Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Add Article</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Title *</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Content *</label>
              <textarea
                rows={4}
                value={data.content}
                onChange={(e) => setData("content", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                required
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl">
              Publish Article
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b text-slate-500">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {blogs.data.map((b) => (
                <tr key={b.id}>
                  <td className="py-3 px-4 font-semibold">{b.title}</td>
                  <td className="py-3 px-4 text-slate-500">{b.author?.name || "Admin"}</td>
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
