import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, Link, router } from "@inertiajs/react";
import { ArrowLeft, Save, Info, FileText, Layers, Search, Check, Plus, Trash2, Palette, Maximize2, Image as ImageIcon, Star, Eye, Upload, ArrowLeft as MoveLeft, ArrowRight as MoveRight, History } from "lucide-react";

export default function Form({ product, categories = [], brands = [], tags = [], attributes = [] }) {
  const isEditing = !!product;
  const [activeTab, setActiveTab] = useState("basic");

  // New Color Modal/Inline Form state
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#4F46E5");

  // New Size Modal/Inline Form state
  const [showAddSize, setShowAddSize] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");

  // Product Images state
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const colorAttr = attributes.find((a) => a.code === "color") || { values: [] };
  const sizeAttr = attributes.find((a) => a.code === "size") || { values: [] };

  // Helper to parse existing product variants into { [colorId]: [sizeId1, sizeId2] }
  const getExistingColorSizes = () => {
    if (!product?.variants) return {};
    const map = {};
    product.variants.forEach((v) => {
      let colorId = null;
      let sizeId = null;
      v.attribute_values?.forEach((av) => {
        if (av.attribute_id === colorAttr.id) colorId = av.id;
        if (av.attribute_id === sizeAttr.id) sizeId = av.id;
      });
      if (colorId) {
        if (!map[colorId]) map[colorId] = [];
        if (sizeId && !map[colorId].includes(sizeId)) map[colorId].push(sizeId);
      }
    });
    return map;
  };

  const getExistingVariantStocks = () => {
    if (!product?.variants) return {};
    const map = {};
    product.variants.forEach((v) => {
      let colorId = null;
      let sizeId = null;
      v.attribute_values?.forEach((av) => {
        if (av.attribute_id === colorAttr.id) colorId = av.id;
        if (av.attribute_id === sizeAttr.id) sizeId = av.id;
      });
      if (colorId) {
        const key = sizeId ? `${colorId}_${sizeId}` : `${colorId}`;
        map[key] = {
          stock_quantity: v.stock_quantity ?? 0,
          price: v.price ?? product.price,
        };
      }
    });
    return map;
  };

  const { data, setData, post, put, processing, errors } = useForm({
    name: product?.name || "",
    sku: product?.sku || "",
    type: product?.type || "simple",
    brand_id: product?.brand_id || "",
    category_ids: product?.categories?.map((c) => c.id) || [],
    tag_ids: product?.tags?.map((t) => t.id) || [],
    color_sizes: getExistingColorSizes(),
    variant_stocks: getExistingVariantStocks(),
    price: product?.price || "",
    sale_price: product?.sale_price || "",
    cost_price: product?.cost_price || "",
    stock_quantity: product?.stock_quantity || 0,
    weight: product?.weight || "",
    dimensions: product?.dimensions || "",
    short_description: product?.short_description || "",
    description: product?.description || "",
    key_features: product?.key_features || "",
    materials_care: product?.materials_care || "",
    storage_spec: product?.storage_spec || "",
    meta_title: product?.meta_title || "",
    meta_description: product?.meta_description || "",
    is_active: product ? product.is_active : true,
    is_featured: product ? product.is_featured : false,
    is_trendy: product ? product.is_trendy : false,
  });

  const handleFilesSelect = (files) => {
    const fileArray = Array.from(files);
    const totalExisting = existingImages.length;
    const newItems = fileArray.map((file, idx) => ({
      id: 'new-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substr(2, 5),
      file,
      previewUrl: URL.createObjectURL(file),
      is_primary: totalExisting === 0 && newImageFiles.length === 0 && idx === 0,
      is_hover: false,
    }));
    setNewImageFiles((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const setPrimaryImage = (type, id) => {
    if (type === 'existing') {
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === id }))
      );
      setNewImageFiles((prev) =>
        prev.map((img) => ({ ...img, is_primary: false }))
      );
    } else {
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: false }))
      );
      setNewImageFiles((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === id }))
      );
    }
  };

  const setHoverImage = (type, id) => {
    if (type === 'existing') {
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_hover: img.id === id ? !img.is_hover : false }))
      );
      setNewImageFiles((prev) =>
        prev.map((img) => ({ ...img, is_hover: false }))
      );
    } else {
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_hover: false }))
      );
      setNewImageFiles((prev) =>
        prev.map((img) => ({ ...img, is_hover: img.id === id ? !img.is_hover : false }))
      );
    }
  };

  const removeExistingImage = (id) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const removeNewImage = (id) => {
    setNewImageFiles((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (type, id, direction) => {
    if (type === 'existing') {
      const idx = existingImages.findIndex((img) => img.id === id);
      if (idx < 0) return;
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= existingImages.length) return;
      const updated = [...existingImages];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      setExistingImages(updated);
    } else {
      const idx = newImageFiles.findIndex((img) => img.id === id);
      if (idx < 0) return;
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newImageFiles.length) return;
      const updated = [...newImageFiles];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      setNewImageFiles(updated);
    }
  };

  const handleCategoryToggle = (id) => {
    const current = [...data.category_ids];
    setData("category_ids", current.includes(id) ? current.filter((cId) => cId !== id) : [...current, id]);
  };

  const handleTagToggle = (id) => {
    const current = [...data.tag_ids];
    setData("tag_ids", current.includes(id) ? current.filter((tId) => tId !== id) : [...current, id]);
  };

  // Toggle color in matrix
  const handleColorMatrixToggle = (colorId) => {
    const nextMap = { ...data.color_sizes };
    if (nextMap[colorId]) {
      delete nextMap[colorId];
    } else {
      nextMap[colorId] = [];
    }
    setData("color_sizes", nextMap);
  };

  // Toggle specific size for a specific color
  const handleColorSizeToggle = (colorId, sizeId) => {
    const nextMap = { ...data.color_sizes };
    const currentSizes = nextMap[colorId] ? [...nextMap[colorId]] : [];
    if (currentSizes.includes(sizeId)) {
      nextMap[colorId] = currentSizes.filter((sId) => sId !== sizeId);
    } else {
      nextMap[colorId] = [...currentSizes, sizeId];
    }
    setData("color_sizes", nextMap);
  };

  // Handle Add New Color Submit
  const handleAddColorSubmit = (e) => {
    e.preventDefault();
    if (!newColorName) return;
    router.post(
      route("admin.products.store-color"),
      { name: newColorName, color_code: newColorHex },
      {
        onSuccess: () => {
          setNewColorName("");
          setShowAddColor(false);
        },
      }
    );
  };

  // Handle Add New Size Submit
  const handleAddSizeSubmit = (e) => {
    e.preventDefault();
    if (!newSizeName) return;
    router.post(
      route("admin.products.store-size"),
      { name: newSizeName },
      {
        onSuccess: () => {
          setNewSizeName("");
          setShowAddSize(false);
        },
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...data,
      existing_images: existingImages.map((img, idx) => ({
        id: img.id,
        is_primary: img.is_primary,
        is_hover: img.is_hover,
        sort_order: idx,
      })),
      new_images: newImageFiles.map((item) => item.file),
      new_images_meta: newImageFiles.map((item, idx) => ({
        is_primary: item.is_primary,
        is_hover: item.is_hover,
        sort_order: existingImages.length + idx,
      })),
      removed_image_ids: removedImageIds,
    };

    if (isEditing) {
      router.post(route("admin.products.update", product.id), {
        ...payload,
        _method: "PUT",
      });
    } else {
      router.post(route("admin.products.store"), payload);
    }
  };

  const totalImageCount = existingImages.length + newImageFiles.length;

  return (
    <AdminLayout title={isEditing ? `Edit Product: ${product.name}` : "Create New Product"}>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={route("admin.products.index")}
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center flex-shrink-0 ${
              activeTab === "basic"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Info className="w-4 h-4 mr-2" /> Basic Info & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center flex-shrink-0 ${
              activeTab === "media"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <ImageIcon className="w-4 h-4 mr-2" /> Product Gallery & Media
            {totalImageCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-500 text-white rounded-full font-bold">
                {totalImageCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("descriptions")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center flex-shrink-0 ${
              activeTab === "descriptions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" /> Descriptions & Key Features
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center flex-shrink-0 ${
              activeTab === "specs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Layers className="w-4 h-4 mr-2" /> Specs, Colors & Sizes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center flex-shrink-0 ${
              activeTab === "seo"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Search className="w-4 h-4 mr-2" /> SEO Metadata
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center flex-shrink-0 ${
                activeTab === "audit"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <History className="w-4 h-4 mr-2" /> Price Audit Logs
              {product?.price_logs?.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-500 text-white rounded-full font-bold">
                  {product.price_logs.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab 1: Basic Info & Pricing */}
        {activeTab === "basic" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Product Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Product Name *</label>
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
                <label className="block text-sm font-semibold mb-1">SKU</label>
                <input
                  type="text"
                  value={data.sku}
                  onChange={(e) => setData("sku", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="Leave blank to auto-generate"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Product Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                >
                  <option value="simple">Simple Product</option>
                  <option value="configurable">Configurable Product (Sizes/Colors)</option>
                  <option value="virtual">Virtual Product</option>
                  <option value="downloadable">Downloadable Product</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Brand</label>
                <select
                  value={data.brand_id}
                  onChange={(e) => setData("brand_id", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                >
                  <option value="">-- None --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categories & Tags Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-sm font-semibold mb-2">Categories Selection</label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center space-x-2.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.category_ids.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tags Selection</label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  {tags.map((t) => (
                    <label key={t.id} className="flex items-center space-x-2.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.tag_ids.includes(t.id)}
                        onChange={() => handleTagToggle(t.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Advanced Discount Calculation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">Pricing & Discount Calculator</label>
                {data.price && data.sale_price && parseFloat(data.price) > parseFloat(data.sale_price) && (
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full">
                    Discount Applied: Save ৳{(parseFloat(data.price) - parseFloat(data.sale_price)).toFixed(2)} (
                    {Math.round(((parseFloat(data.price) - parseFloat(data.sale_price)) / parseFloat(data.price)) * 100)}% OFF)
                  </span>
                )}
              </div>

              {/* Quick Discount Presets */}
              <div className="flex items-center space-x-2 bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Quick Discount Calculator:</span>
                {[10, 15, 20, 25, 30, 50, 70].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      if (data.price) {
                        const calculated = (parseFloat(data.price) * (1 - pct / 100)).toFixed(2);
                        setData("sale_price", calculated);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                  >
                    {pct}% OFF
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Regular Price (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={(e) => setData("price", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Sale Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.sale_price}
                    onChange={(e) => setData("sale_price", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Cost Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.cost_price}
                    onChange={(e) => setData("cost_price", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={data.stock_quantity}
                    onChange={(e) => setData("stock_quantity", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData("is_active", e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Published (Is Active)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={data.is_featured}
                  onChange={(e) => setData("is_featured", e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Featured Product</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={data.is_trendy}
                  onChange={(e) => setData("is_trendy", e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Show in Trendy Products</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab: Product Gallery & Media */}
        {activeTab === "media" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Product Media & Gallery</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload product photos. Mark one as <span className="font-bold text-amber-600 dark:text-amber-400">Primary (Main Thumbnail)</span> and one as <span className="font-bold text-indigo-600 dark:text-indigo-400">Hover Image</span> for shop grid preview.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                  : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/40"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Drag and drop product photos here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP, AVIF up to 5MB each</p>
                </div>
              </div>
            </div>

            {/* Image Gallery Grid */}
            {totalImageCount === 0 ? (
              <div className="p-8 text-center border rounded-2xl border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No images uploaded yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Drag files into the box above to add high-resolution product photos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Uploaded Gallery ({totalImageCount} {totalImageCount === 1 ? 'Image' : 'Images'})
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img, idx) => (
                    <div
                      key={'existing-' + img.id}
                      className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col"
                    >
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                        <img
                          src={img.url}
                          alt="Product"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {img.is_primary && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-extrabold bg-amber-500 text-white shadow-md">
                              <Star className="w-3 h-3 mr-1 fill-white" /> Primary
                            </span>
                          )}
                          {img.is_hover && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-extrabold bg-indigo-600 text-white shadow-md">
                              <Eye className="w-3 h-3 mr-1" /> Hover
                            </span>
                          )}
                        </div>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-xl shadow-md opacity-80 hover:opacity-100 transition z-10"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Control toolbar */}
                      <div className="p-2.5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs gap-1">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage('existing', img.id)}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                              img.is_primary
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            Primary
                          </button>
                          <button
                            type="button"
                            onClick={() => setHoverImage('existing', img.id)}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                              img.is_hover
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
                            }`}
                          >
                            Hover
                          </button>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage('existing', img.id, 'left')}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-30 hover:bg-slate-200"
                            title="Move left"
                          >
                            <MoveLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === existingImages.length - 1}
                            onClick={() => moveImage('existing', img.id, 'right')}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-30 hover:bg-slate-200"
                            title="Move right"
                          >
                            <MoveRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* New Image File Uploads */}
                  {newImageFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative bg-slate-900 rounded-2xl overflow-hidden border-2 border-indigo-400 dark:border-indigo-600 shadow-sm flex flex-col"
                    >
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.previewUrl}
                          alt="New preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow">
                          New Upload
                        </span>
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {item.is_primary && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-extrabold bg-amber-500 text-white shadow-md">
                              <Star className="w-3 h-3 mr-1 fill-white" /> Primary
                            </span>
                          )}
                          {item.is_hover && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-extrabold bg-indigo-600 text-white shadow-md">
                              <Eye className="w-3 h-3 mr-1" /> Hover
                            </span>
                          )}
                        </div>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeNewImage(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-xl shadow-md opacity-80 hover:opacity-100 transition z-10"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Control toolbar */}
                      <div className="p-2.5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs gap-1">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage('new', item.id)}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                              item.is_primary
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            Primary
                          </button>
                          <button
                            type="button"
                            onClick={() => setHoverImage('new', item.id)}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                              item.is_hover
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
                            }`}
                          >
                            Hover
                          </button>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage('new', item.id, 'left')}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-30 hover:bg-slate-200"
                            title="Move left"
                          >
                            <MoveLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === newImageFiles.length - 1}
                            onClick={() => moveImage('new', item.id, 'right')}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-30 hover:bg-slate-200"
                            title="Move right"
                          >
                            <MoveRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Descriptions & Key Features */}
        {activeTab === "descriptions" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Descriptions & Customer Content</h2>

            <div>
              <label className="block text-sm font-semibold mb-1">Short Description (Next to product gallery)</label>
              <textarea
                rows={3}
                value={data.short_description}
                onChange={(e) => setData("short_description", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                placeholder="Phasellus sed volutpat orci. Fusce eget lore mauris vehicula..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Full Detailed Description (Tab 1 Content)</label>
              <textarea
                rows={6}
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Key Features / Highlights ("Why choose product?" Bullet Points)</label>
              <textarea
                rows={4}
                value={data.key_features}
                onChange={(e) => setData("key_features", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono"
                placeholder="• Created by cotton fabric with soft and smooth&#10;• Simple, Configurable, bundled&#10;• Downloadable/Digital Products, Virtual Products"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-sm font-semibold mb-1">Materials & Lining Composition</label>
                <input
                  type="text"
                  value={data.materials_care}
                  onChange={(e) => setData("materials_care", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="100% Polyester, Main: 100% Polyester"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Storage / Fit Specification</label>
                <input
                  type="text"
                  value={data.storage_spec}
                  onChange={(e) => setData("storage_spec", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="Relaxed fit shirt-style dress with a rugged"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Specs, Colors & Sizes */}
        {activeTab === "specs" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Physical Specs, Per-Color Sizes & Custom Options</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.weight}
                  onChange={(e) => setData("weight", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="1.25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Dimensions (L x W x H cm)</label>
                <input
                  type="text"
                  value={data.dimensions}
                  onChange={(e) => setData("dimensions", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                  placeholder="90 x 60 x 90 cm"
                />
              </div>
            </div>

            {/* Colors Selection & Custom Add */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Step 1: Select Available Colors for this Product
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddColor(!showAddColor)}
                    className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-semibold text-xs rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add New Color
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSize(!showAddSize)}
                    className="inline-flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 font-semibold text-xs rounded-lg hover:bg-emerald-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add New Size
                  </button>
                </div>
              </div>

              {/* Add New Color Form */}
              {showAddColor && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Purple, Navy)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold">Color Hex:</span>
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColorSubmit}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                  >
                    Save Color
                  </button>
                </div>
              )}

              {/* Add New Size Form */}
              {showAddSize && (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Size Name (e.g. 3XL, 38, 42)"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddSizeSubmit}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Save Size
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {colorAttr.values?.map((c) => {
                  const isSelected = !!data.color_sizes[c.id];
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorMatrixToggle(c.id)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition flex items-center space-x-2.5 ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200"
                          : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-400"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: c.color_code || "#ccc" }}
                      />
                      <span>{c.value}</span>
                      {isSelected && <Check className="w-4 h-4 ml-1 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Per-Color Size Mapping Matrix */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <label className="block text-sm font-bold text-slate-900 dark:text-white">
                Step 2: Assign Specific Sizes for Each Selected Color
              </label>

              {Object.keys(data.color_sizes).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Select at least one color above to configure specific sizes for that color.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.keys(data.color_sizes).map((colorIdStr) => {
                    const colorId = parseInt(colorIdStr);
                    const colorObj = colorAttr.values?.find((c) => c.id === colorId);
                    const selectedSizeIds = data.color_sizes[colorId] || [];

                    return (
                      <div
                        key={colorId}
                        className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-600 pb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                              style={{ backgroundColor: colorObj?.color_code || "#ccc" }}
                            />
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              Sizes available for {colorObj?.value || "Color"}:
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-indigo-600">
                            {selectedSizeIds.length} size(s) selected
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {sizeAttr.values?.map((s) => {
                            const isSizeChecked = selectedSizeIds.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleColorSizeToggle(colorId, s.id)}
                                className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center space-x-1.5 ${
                                  isSizeChecked
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-400"
                                }`}
                              >
                                <span>{s.value}</span>
                                {isSizeChecked && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Color & Size Wise Stock Quantity Input Table */}
            {Object.keys(data.color_sizes).length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white">
                      Step 3: Color & Size Stock Quantity Matrix
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Specify exact stock quantity for each generated variant option. Total product stock will auto-calculate as the sum of these values.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-bold">
                        <th className="py-3 px-4">Variant Specs</th>
                        <th className="py-3 px-4">Generated SKU</th>
                        <th className="py-3 px-4 text-center">Stock Quantity</th>
                        <th className="py-3 px-4 text-center">Price (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {Object.keys(data.color_sizes).flatMap((colorIdStr) => {
                        const colorId = parseInt(colorIdStr);
                        const colorObj = colorAttr.values?.find((c) => c.id === colorId);
                        const selectedSizeIds = data.color_sizes[colorId] || [];

                        // Color-only row if no size selected for this color
                        if (selectedSizeIds.length === 0) {
                          const key = `${colorId}`;
                          const currentStock = data.variant_stocks?.[key]?.stock_quantity ?? data.stock_quantity ?? 0;
                          const currentPrice = data.variant_stocks?.[key]?.price ?? data.price ?? 0;
                          const genSku = `${data.sku || "SKU"}-${(colorObj?.value || "COL").toUpperCase()}`;

                          return [
                            <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                              <td className="py-3 px-4 font-bold flex items-center space-x-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/20"
                                  style={{ backgroundColor: colorObj?.color_code || "#ccc" }}
                                />
                                <span>{colorObj?.value || "Color"} (No Size)</span>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500">{genSku}</td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={currentStock}
                                  onChange={(e) => {
                                    const nextStocks = { ...data.variant_stocks };
                                    nextStocks[key] = {
                                      ...nextStocks[key],
                                      stock_quantity: parseInt(e.target.value) || 0,
                                    };
                                    setData("variant_stocks", nextStocks);
                                  }}
                                  className="w-24 px-3 py-1.5 text-center font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentPrice}
                                  onChange={(e) => {
                                    const nextStocks = { ...data.variant_stocks };
                                    nextStocks[key] = {
                                      ...nextStocks[key],
                                      price: parseFloat(e.target.value) || 0,
                                    };
                                    setData("variant_stocks", nextStocks);
                                  }}
                                  className="w-28 px-3 py-1.5 text-center bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                              </td>
                            </tr>,
                          ];
                        }

                        // Color + Size matrix rows
                        return selectedSizeIds.map((sizeId) => {
                          const sizeObj = sizeAttr.values?.find((s) => s.id === sizeId);
                          const key = `${colorId}_${sizeId}`;
                          const currentStock = data.variant_stocks?.[key]?.stock_quantity ?? 0;
                          const currentPrice = data.variant_stocks?.[key]?.price ?? data.price ?? 0;
                          const genSku = `${data.sku || "SKU"}-${(sizeObj?.value || "SIZE").toUpperCase()}-${(colorObj?.value || "COL").toUpperCase()}`;

                          return (
                            <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                              <td className="py-3 px-4 font-bold flex items-center space-x-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/20"
                                  style={{ backgroundColor: colorObj?.color_code || "#ccc" }}
                                />
                                <span>{colorObj?.value || "Color"} / <span className="text-indigo-600 dark:text-indigo-400 font-mono">{sizeObj?.value}</span></span>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500">{genSku}</td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={currentStock}
                                  onChange={(e) => {
                                    const nextStocks = { ...data.variant_stocks };
                                    nextStocks[key] = {
                                      ...nextStocks[key],
                                      stock_quantity: parseInt(e.target.value) || 0,
                                    };
                                    setData("variant_stocks", nextStocks);
                                  }}
                                  className="w-24 px-3 py-1.5 text-center font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentPrice}
                                  onChange={(e) => {
                                    const nextStocks = { ...data.variant_stocks };
                                    nextStocks[key] = {
                                      ...nextStocks[key],
                                      price: parseFloat(e.target.value) || 0,
                                    };
                                    setData("variant_stocks", nextStocks);
                                  }}
                                  className="w-28 px-3 py-1.5 text-center bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                                />
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: SEO Metadata */}
        {activeTab === "seo" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">SEO Engine Optimization</h2>

            <div>
              <label className="block text-sm font-semibold mb-1">Meta Title</label>
              <input
                type="text"
                value={data.meta_title}
                onChange={(e) => setData("meta_title", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={data.meta_description}
                onChange={(e) => setData("meta_description", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>
          </div>
        )}

        {/* Tab: Price Audit Logs */}
        {activeTab === "audit" && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Price Change Audit Trail</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete historical record of all price adjustments for this product, including regular price, sale price, user accountability, and system notes.
              </p>
            </div>

            {!product?.price_logs || product.price_logs.length === 0 ? (
              <div className="p-8 text-center border rounded-2xl border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No price adjustments logged yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Price changes made to this product will automatically be recorded here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Regular Price</th>
                      <th className="py-3 px-4 font-semibold">Sale Price</th>
                      <th className="py-3 px-4 font-semibold">Cost Price</th>
                      <th className="py-3 px-4 font-semibold">Changed By</th>
                      <th className="py-3 px-4 font-semibold">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {product.price_logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1.5 text-xs">
                            <span className="line-through text-slate-400">৳{log.old_price ?? '0.00'}</span>
                            <span>➔</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{log.new_price}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {log.old_sale_price !== log.new_sale_price ? (
                            <div className="flex items-center space-x-1.5 text-xs">
                              <span className="line-through text-slate-400">৳{log.old_sale_price || '0.00'}</span>
                              <span>➔</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">৳{log.new_sale_price || '0.00'}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">৳{log.new_sale_price || 'N/A'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          ${log.new_cost_price || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {log.user?.name || "System Automated"}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md">
                            {log.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4 mr-2" /> Save Product Details
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
