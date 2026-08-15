import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, router } from "@inertiajs/react";
import { Plus, Trash2, Edit2, X, Image as ImageIcon, ExternalLink } from "lucide-react";

export default function Index({ banners = [] }) {
  const [editingBanner, setEditingBanner] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data, setData, post, processing, reset, errors } = useForm({
    title: "",
    subtitle: "",
    type: "hero",
    image: null,
    link_url: "/shop",
    button_text: "Discover More",
    sort_order: 0,
    is_active: true,
  });

  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      type: banner.type || "hero",
      image: banner.image || null,
      link_url: banner.link_url || "/shop",
      button_text: banner.button_text || "Discover More",
      sort_order: banner.sort_order ?? 0,
      is_active: banner.is_active ?? true,
    });
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBanner) {
      router.post(
        route("admin.banners.update", editingBanner.id),
        {
          _method: "PUT",
          ...data,
        },
        {
          onSuccess: () => handleCancelEdit(),
        }
      );
    } else {
      post(route("admin.banners.store"), {
        onSuccess: () => reset(),
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      router.delete(route("admin.banners.destroy", id));
    }
  };

  const filteredBanners = activeTab === "all"
    ? banners
    : banners.filter((b) => b.type === activeTab);

  return (
    <AdminLayout title="Banners & Slider Manager">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create / Edit Form */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingBanner ? `Edit Banner: ${editingBanner.title}` : "Add New Banner Slide"}
            </h2>
            {editingBanner && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="block text-sm font-semibold mb-1">Banner Title *</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                placeholder="e.g. Summer Sale Stylish"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                required
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                value={data.subtitle}
                onChange={(e) => setData("subtitle", e.target.value)}
                placeholder="e.g. Limited Time Offer - Up to 60% off"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Banner Type *</label>
              <select
                value={data.type}
                onChange={(e) => setData("type", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium"
              >
                <option value="hero">Hero Slider (Homepage Hero)</option>
                <option value="collection">Collection Box Banner</option>
                <option value="deal">Deal Banner</option>
                <option value="popup">Newsletter Popup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setData("image", e.target.files[0]);
                  }
                }}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {data.image && typeof data.image === "object" && (
                <div className="mt-2.5 flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600">
                  <img
                    src={URL.createObjectURL(data.image)}
                    alt="New Banner Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-indigo-200 shadow-sm"
                  />
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">New Upload Preview</span>
                    <span className="text-xs text-slate-500 truncate max-w-[160px] block">{data.image.name}</span>
                  </div>
                </div>
              )}
              {data.image && typeof data.image === "string" && (
                <div className="mt-2.5 flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600">
                  <img
                    src={data.image}
                    alt="Current Banner"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Current Image</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Button Text</label>
                <input
                  type="text"
                  value={data.button_text}
                  onChange={(e) => setData("button_text", e.target.value)}
                  placeholder="e.g. Discover More"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Sort Order</label>
                <input
                  type="number"
                  value={data.sort_order}
                  onChange={(e) => setData("sort_order", Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Target Link URL</label>
              <input
                type="text"
                value={data.link_url}
                onChange={(e) => setData("link_url", e.target.value)}
                placeholder="/shop or /shop?category=women"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={data.is_active}
                onChange={(e) => setData("is_active", e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Active Banner
              </label>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              {editingBanner ? "Update Banner Slide" : "Save Banner Slide"}
            </button>
          </form>
        </div>

        {/* Banners List & Filter Tabs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          {/* Filter Tabs */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">Banners List ({filteredBanners.length})</h3>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-semibold">
              {["all", "hero", "collection", "deal", "popup"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    activeTab === type
                      ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {type === "hero" ? "Hero Slider" : type}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Preview</th>
                  <th className="py-3 px-4 font-semibold">Title & Subtitle</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Link URL</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredBanners.length > 0 ? (
                  filteredBanners.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        {b.image ? (
                          <img
                            src={b.image_url || b.image}
                            alt={b.title}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{b.title}</div>
                        {b.subtitle && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{b.subtitle}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase">
                          {b.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 truncate max-w-[140px]">
                        {b.link_url ? (
                          <span className="flex items-center text-indigo-600 hover:underline">
                            {b.link_url} <ExternalLink className="w-3 h-3 ml-1" />
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No banners found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
