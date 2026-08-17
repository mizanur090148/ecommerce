import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { Star, Trash2, CheckCircle, XCircle, Search } from "lucide-react";

export default function Index({ reviews, filters }) {
  const [search, setSearch] = useState(filters.search || "");

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("admin.reviews.index"), { search }, { preserveState: true });
  };

  const handleToggleApproval = (id) => {
    router.patch(route("admin.reviews.toggle-approval", id));
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this customer review?")) {
      router.delete(route("admin.reviews.destroy", id));
    }
  };

  return (
    <AdminLayout title="Product Reviews & Ratings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Reviews</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and moderate product ratings & reviews</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Reviewer</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Comment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {reviews.data.length > 0 ? (
                reviews.data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition">
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white max-w-xs truncate">
                      {item.product ? (
                        <a
                          href={`/product/${item.product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-indigo-600 dark:text-indigo-400"
                        >
                          {item.product.name}
                        </a>
                      ) : (
                        "Deleted Product"
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-800 dark:text-white">{item.reviewer_name}</p>
                      <p className="text-xs text-slate-400">{item.reviewer_email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < item.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                          />
                        ))}
                        <span className="ml-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {item.rating}.0
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{item.comment}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.is_approved
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                        }`}
                      >
                        {item.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleApproval(item.id)}
                        className={`p-2 rounded-lg transition ${
                          item.is_approved
                            ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        }`}
                        title={item.is_approved ? "Unapprove Review" : "Approve Review"}
                      >
                        {item.is_approved ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                        title="Delete Review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No customer reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
