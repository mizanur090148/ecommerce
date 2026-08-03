import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, Link, router } from "@inertiajs/react";
import { ArrowLeft, Save, Info, FileText, Layers, Search, Check, Plus, Trash2, Palette, Maximize2 } from "lucide-react";

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
      if (colorId && sizeId) {
        if (!map[colorId]) map[colorId] = [];
        if (!map[colorId].includes(sizeId)) map[colorId].push(sizeId);
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
      nextMap[colorId] = []; // Initialize empty size selection for this color
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
    if (isEditing) {
      put(route("admin.products.update", product.id));
    } else {
      post(route("admin.products.store"));
    }
  };

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

            {/* Pricing & Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-sm font-semibold mb-1">Regular Price ($) *</label>
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
                <label className="block text-sm font-semibold mb-1">Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.sale_price}
                  onChange={(e) => setData("sale_price", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Cost Price ($)</label>
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
