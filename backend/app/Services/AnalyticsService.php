<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function getDashboardMetrics(): array
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('grand_total');
        $totalOrders = Order::count();
        $totalCustomers = User::whereHas('roles', function ($q) {
            $q->where('name', 'Customer');
        })->count();
        $totalProducts = Product::count();

        $recentOrders = Order::with('user')->latest()->take(5)->get();

        $lowStockProducts = Product::where('is_stock_managed', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->take(5)
            ->get();

        $monthlySales = Order::select(
            DB::raw('MONTHNAME(created_at) as month'),
            DB::raw('COUNT(*) as total_orders'),
            DB::raw('SUM(grand_total) as revenue')
        )
        ->groupBy('month')
        ->orderBy(DB::raw('MIN(created_at)'))
        ->get();

        return [
            'kpis' => [
                'total_revenue' => number_format($totalRevenue, 2),
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
            ],
            'recent_orders' => $recentOrders,
            'low_stock_products' => $lowStockProducts,
            'monthly_sales' => $monthlySales,
        ];
    }
}
