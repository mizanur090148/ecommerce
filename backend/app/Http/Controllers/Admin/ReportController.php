<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'this_month');
        $startDate = null;
        $endDate = null;

        switch ($period) {
            case 'today':
                $startDate = Carbon::today()->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                break;

            case 'this_week':
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
                break;

            case 'this_year':
                $startDate = Carbon::now()->startOfYear();
                $endDate = Carbon::now()->endOfYear();
                break;

            case 'custom':
                if ($request->filled('start_date') && $request->filled('end_date')) {
                    $startDate = Carbon::parse($request->start_date)->startOfDay();
                    $endDate = Carbon::parse($request->end_date)->endOfDay();
                } else {
                    $startDate = Carbon::now()->startOfMonth();
                    $endDate = Carbon::now()->endOfMonth();
                }
                break;

            case 'this_month':
            default:
                $period = 'this_month';
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
                break;
        }

        // 1. Calculate Gross Sales Revenue (Orders not cancelled)
        $ordersQuery = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $grossSales = (float) $ordersQuery->sum('grand_total');
        $ordersCount = $ordersQuery->count();
        $avgOrderValue = $ordersCount > 0 ? $grossSales / $ordersCount : 0;

        // 2. Calculate Total Operational Expenses
        $expensesQuery = Expense::whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);

        $totalExpenses = (float) $expensesQuery->sum('amount');

        // 3. Financial Metrics
        $netProfit = $grossSales - $totalExpenses;
        $profitMargin = $grossSales > 0 ? ($netProfit / $grossSales) * 100 : 0;

        // 4. Expense Breakdown by Category
        $categoryBreakdown = Expense::whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->selectRaw('category, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->map(function ($item) use ($totalExpenses) {
                $item->percentage = $totalExpenses > 0 ? round(($item->total_amount / $totalExpenses) * 100, 1) : 0;
                return $item;
            });

        // 5. Recent Financial Activity Ledger (Recent 10 Expenses & Recent 10 Orders)
        $recentExpenses = Expense::whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->latest('expense_date')
            ->take(8)
            ->get();

        $recentOrders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->take(8)
            ->get(['id', 'order_number', 'grand_total', 'status', 'payment_status', 'created_at']);

        return Inertia::render('Admin/Reports/Index', [
            'period' => $period,
            'date_range' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'metrics' => [
                'gross_sales' => $grossSales,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
                'profit_margin' => round($profitMargin, 2),
                'orders_count' => $ordersCount,
                'avg_order_value' => round($avgOrderValue, 2),
            ],
            'category_breakdown' => $categoryBreakdown,
            'recent_expenses' => $recentExpenses,
            'recent_orders' => $recentOrders,
            'filters' => $request->only(['period', 'start_date', 'end_date']),
        ]);
    }
}
