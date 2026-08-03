<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::whereHas('roles', function ($q) {
            $q->where('name', 'Customer');
        })->withCount('orders')->withSum('orders', 'grand_total');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()->paginate(15);

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(User $customer): Response
    {
        $customer->load(['addresses', 'orders.items', 'reviews']);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function toggleStatus(User $customer)
    {
        $newStatus = $customer->status === 'active' ? 'suspended' : 'active';
        $customer->update(['status' => $newStatus]);

        return redirect()->back()->with('success', "Customer status updated to {$newStatus}.");
    }
}
