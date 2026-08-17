import React, { useState } from "react";
import { Link, usePage, Head } from "@inertiajs/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Users,
  Ticket,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  AlertCircle,
  Wallet,
  BarChart3,
} from "lucide-react";

export default function AdminLayout({ children, title }) {
  const { auth, flash } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const navigation = [
    { name: "Dashboard", href: route("admin.dashboard"), icon: LayoutDashboard },
    { name: "Products", href: route("admin.products.index"), icon: Package },
    { name: "Categories", href: route("admin.categories.index"), icon: FolderTree },
    { name: "Brands", href: route("admin.brands.index"), icon: Tag },
    { name: "Orders", href: route("admin.orders.index"), icon: ShoppingBag },
    { name: "Customers", href: route("admin.customers.index"), icon: Users },
    { name: "Coupons", href: route("admin.coupons.index"), icon: Ticket },
    { name: "Expense Tracker", href: route("admin.expenses.index"), icon: Wallet },
    { name: "Financial Reports", href: route("admin.reports.index"), icon: BarChart3 },
    { name: "Banners & CMS", href: route("admin.banners.index"), icon: ImageIcon },
    { name: "Blogs", href: route("admin.blogs.index"), icon: FileText },
    { name: "Settings", href: route("admin.settings.index"), icon: Settings },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex ${darkMode ? "dark" : ""}`}>
      <Head title={title || "Admin Dashboard"} />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
          <Link href={route("admin.dashboard")} className="flex items-center space-x-3">
            <span className="font-bold text-lg tracking-wider text-white">Admin Dashboard</span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = route().current(item.href.split('.').slice(0, 2).join('.') + '.*') || route().current() === item.name.toLowerCase();
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                {auth.user?.name?.charAt(0) || "A"}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">{auth.user?.name || "Admin"}</p>
                <p className="text-xs text-slate-400 truncate">{auth.user?.email}</p>
              </div>
            </div>
            <Link
              href={route("logout")}
              method="post"
              as="button"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white truncate">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Flash Notifications */}
        {flash?.success && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-3 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{flash.success}</span>
          </div>
        )}
        {flash?.error && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center space-x-3 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span className="text-sm font-medium">{flash.error}</span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
