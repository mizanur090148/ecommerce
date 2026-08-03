import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { Plus, Search, Filter, Edit, Trash2, Package } from "lucide-react";

export default function Index({ products, categories, brands, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("admin.products.index"), { search: searchTerm }, { preserveState: true });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      router.delete(route("admin.products.destroy", id));
    }
  };

  return (
    <AdminLayout title="Products Catalog">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <Link
          href={route("admin.products.create")}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Product
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">SKU</th>
                <th className="py-3.5 px-4 font-semibold">Brand</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Stock</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {products.data.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 font-bold text-slate-500">
                        {product.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 dark:text-white block truncate">
                          {product.name}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">{product.type} product</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {product.sku}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {product.brand?.name || "N/A"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    ${product.price}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold ${
                        product.stock_quantity > 10 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        product.is_active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {product.is_active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={route("admin.products.edit", product.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
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
      </div>
    </AdminLayout>
  );
}
