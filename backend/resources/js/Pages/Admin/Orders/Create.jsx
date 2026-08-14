import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Plus, Trash2, ShoppingBag, User, Search, Check, AlertCircle } from "lucide-react";

export default function Create({ products = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    street: "",
    city: "Dhaka",
    payment_method: "Cash on Delivery",
    shipping_total: 0,
    order_notes: "",
    items: [],
  });

  const [productSearch, setProductSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filter products based on live search query (matches name or SKU)
  const filteredProducts = productSearch.trim() === ""
    ? products.slice(0, 6)
    : products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
      );

  const handleAddProduct = (product) => {
    const existingIdx = data.items.findIndex((item) => String(item.product_id) === String(product.id));

    if (existingIdx > -1) {
      const updated = [...data.items];
      updated[existingIdx].quantity += 1;
      setData("items", updated);
    } else {
      setData("items", [
        ...data.items,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku || `PRD-${product.id}`,
          price: Number(product.sale_price || product.price),
          image: product.primary_image || "",
          stock_quantity: product.stock_quantity,
          quantity: 1,
        },
      ]);
    }
    setProductSearch("");
    setShowSearchResults(false);
  };

  const handleRemoveItem = (index) => {
    const updated = [...data.items];
    updated.splice(index, 1);
    setData("items", updated);
  };

  const handleQuantityChange = (index, delta) => {
    const updated = [...data.items];
    const newQty = updated[index].quantity + delta;
    if (newQty >= 1 && newQty <= (updated[index].stock_quantity || 99)) {
      updated[index].quantity = newQty;
      setData("items", updated);
    }
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + (Number(data.shipping_total) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.items.length === 0) {
      alert("Please search and add at least one product to the order.");
      return;
    }
    post(route("admin.orders.store"));
  };

  return (
    <AdminLayout title="Create Manual Order">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href={route("admin.orders.index")}
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Manual Order</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Customer Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Customer Full Name"
                  value={data.customer_name}
                  onChange={(e) => setData("customer_name", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.customer_name && <p className="text-xs text-rose-500 mt-1">{errors.customer_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={data.customer_email}
                  onChange={(e) => setData("customer_email", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.customer_email && <p className="text-xs text-rose-500 mt-1">{errors.customer_email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+8801700000000"
                  value={data.customer_phone}
                  onChange={(e) => setData("customer_phone", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.customer_phone && <p className="text-xs text-rose-500 mt-1">{errors.customer_phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House #, Road #, Area"
                  value={data.street}
                  onChange={(e) => setData("street", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Town / City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dhaka"
                  value={data.city}
                  onChange={(e) => setData("city", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Search & Selection Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Order Items</h3>
              </div>
            </div>

            {/* Product Autocomplete Search Input */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                🔍 Search Catalog Products (Name or SKU)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type product name or SKU to search (e.g. Leather Jacket, VIP Pass)..."
                  value={productSearch}
                  onFocus={() => setShowSearchResults(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowSearchResults(true);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Floating Autocomplete Dropdown */}
              {showSearchResults && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3">
                          {p.primary_image ? (
                            <img src={p.primary_image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                              IMG
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm text-slate-900 dark:text-white">{p.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{p.sku || `PRD-${p.id}`} • Stock: {p.stock_quantity}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                            ৳{Number(p.sale_price || p.price).toFixed(2)}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                            + Add
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching products found for "{productSearch}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Items Grid Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[11px] font-semibold">
                    <th className="py-3 px-4">Selected Product</th>
                    <th className="py-3 px-4 text-center">Unit Price</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {data.items.length > 0 ? (
                    data.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-9 h-9 object-cover rounded-lg border border-slate-200" />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                          ৳{item.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, -1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-bold text-xs">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                        No products added yet. Use the search input above to add items to this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment & Shipping Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={data.payment_method}
                    onChange={(e) => setData("payment_method", e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="bKash (SSLCommerz)">bKash (SSLCommerz)</option>
                    <option value="Nagad (SSLCommerz)">Nagad (SSLCommerz)</option>
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Order Notes / Admin Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional order notes..."
                    value={data.order_notes}
                    onChange={(e) => setData("order_notes", e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Items Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Shipping Fee (৳):</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={data.shipping_total}
                    onChange={(e) => setData("shipping_total", e.target.value)}
                    className="w-24 text-right px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3 text-base font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Grand Total:</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={route("admin.orders.index")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing || data.items.length === 0}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50"
            >
              {processing ? "Creating Order..." : "Create Order ✓"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
