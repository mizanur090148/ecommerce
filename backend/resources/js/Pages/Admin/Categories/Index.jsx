import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, Link, router } from "@inertiajs/react";
import { Plus, Trash2, Edit2, X, FolderTree } from "lucide-react";

export default function Index({ categories, parentCategories }) {
  const [editingCategory, setEditingCategory] = useState(null);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: "",
    parent_id: "",
    description: "",
    is_active: true,
  });

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setData({
      name: category.name,
      parent_id: category.parent_id || "",
      description: category.description || "",
      is_active: category.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      put(route("admin.categories.update", editingCategory.id), {
        onSuccess: () => handleCancelEdit(),
      });
    } else {
      post(route("admin.categories.store"), {
        onSuccess: () => reset(),
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      router.delete(route("admin.categories.destroy", id));
    }
  };

  return (
    <AdminLayout title="Category Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create / Edit Category Form */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCategory ? `Edit: ${editingCategory.name}` : "Add New Category"}
            </h2>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Category Name *</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                required
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Parent Category</label>
              <select
                value={data.parent_id}
                onChange={(e) => setData("parent_id", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              >
                <option value="">-- None (Top Level Category) --</option>
                {parentCategories
                  .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              {editingCategory ? "Update Category" : "Save Category"}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Category List ({categories.total})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Category Name</th>
                  <th className="py-3 px-4 font-semibold">Parent Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {categories.data.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {cat.parent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-xs text-indigo-600 font-bold">Top Level</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Bar */}
          {categories.total > 0 && (
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{categories.from || 0}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{categories.to || 0}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{categories.total}</span> categories
              </div>

              {categories.links && categories.links.length > 3 && (
                <div className="flex items-center space-x-1">
                  {categories.links.map((link, key) => {
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
