import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { router } from "@inertiajs/react";

export default function Index({ customers }) {
  const toggleStatus = (id) => {
    router.patch(route("admin.customers.toggle-status", id));
  };

  return (
    <AdminLayout title="Customer Directory">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b text-slate-500">
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Orders</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {customers.data.map((c) => (
              <tr key={c.id}>
                <td className="py-3.5 px-4 font-semibold">{c.name}</td>
                <td className="py-3.5 px-4">{c.email}</td>
                <td className="py-3.5 px-4">{c.orders_count} orders</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button onClick={() => toggleStatus(c.id)} className="text-xs font-semibold text-indigo-600 hover:underline">
                    {c.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
