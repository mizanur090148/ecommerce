<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Expense::with('creator');

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%");
            });
        }

        // Category Filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Payment Method Filter
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Date Range Filter
        if ($request->filled('start_date')) {
            $query->whereDate('expense_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('expense_date', '<=', $request->end_date);
        }

        $expenses = $query->latest('expense_date')->latest('id')->paginate(15)->withQueryString();

        // Summary Statistics
        $todayCost = (float) Expense::whereDate('expense_date', Carbon::today())->sum('amount');
        $thisWeekCost = (float) Expense::whereBetween('expense_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])->sum('amount');
        $thisMonthCost = (float) Expense::whereBetween('expense_date', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])->sum('amount');
        $thisYearCost = (float) Expense::whereYear('expense_date', Carbon::now()->year)->sum('amount');
        $totalCost = (float) Expense::sum('amount');

        return Inertia::render('Admin/Expenses/Index', [
            'expenses' => $expenses,
            'summary' => [
                'today' => $todayCost,
                'this_week' => $thisWeekCost,
                'this_month' => $thisMonthCost,
                'this_year' => $thisYearCost,
                'total' => $totalCost,
            ],
            'filters' => $request->only(['search', 'category', 'payment_method', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:carrying_cost,delivery_cost,employee_cost,marketing_cost,utility_cost,packaging_cost,office_cost,other',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        Expense::create($validated);

        return redirect()->back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:carrying_cost,delivery_cost,employee_cost,marketing_cost,utility_cost,packaging_cost,office_cost,other',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ]);

        $expense->update($validated);

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return redirect()->back()->with('success', 'Expense deleted successfully.');
    }
}
