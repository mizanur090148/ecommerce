<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService)
    {
    }

    public function index(Request $request): Response
    {
        $orders = $this->orderService->getPaginatedOrders($request->all(), 10);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment_status']),
        ]);
    }

    public function create(): Response
    {
        $products = Product::with('primaryImage')
            ->where('stock_status', 'in_stock')
            ->select(['id', 'name', 'sku', 'price', 'sale_price', 'stock_quantity'])
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'price' => $p->price,
                    'sale_price' => $p->sale_price,
                    'stock_quantity' => $p->stock_quantity,
                    'primary_image' => $p->primary_image_url ?? $p->primaryImage?->url ?? '',
                ];
            });

        return Inertia::render('Admin/Orders/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:50',
            'street' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'payment_method' => 'required|string',
            'shipping_total' => 'nullable|numeric|min:0',
            'order_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $billingAddress = [
            'firstName' => $validated['customer_name'],
            'lastName' => '',
            'address' => $validated['street'],
            'city' => $validated['city'],
        ];

        $orderPayload = [
            'customer_email' => strtolower($validated['customer_email']),
            'customer_phone' => $validated['customer_phone'],
            'order_source' => 'manual_admin',
            'billing_address' => $billingAddress,
            'shipping_address' => $billingAddress,
            'payment_method' => $validated['payment_method'],
            'shipping_total' => (float) ($validated['shipping_total'] ?? 0.00),
            'order_notes' => $validated['order_notes'] ?? null,
            'items' => $validated['items'],
        ];

        try {
            $order = $this->orderService->createOrder($orderPayload);
            return redirect()->route('admin.orders.show', $order->id)->with('success', 'Manual order created successfully!');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->withErrors(['items' => $e->getMessage()]);
        }
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product', 'items.variant', 'shipments']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,processing,packed,shipped,delivered,returned,refunded,cancelled',
            'payment_status' => 'nullable|in:pending,paid,refunded,failed',
        ]);

        if (!empty($validated['status'])) {
            $this->orderService->updateOrderStatus($order, $validated['status']);
        }

        if (!empty($validated['payment_status'])) {
            $order->update(['payment_status' => $validated['payment_status']]);
        }

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', 'Order deleted successfully.');
    }

    public function downloadInvoice(Order $order)
    {
        $order->load(['items.product', 'user']);

        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', ['order' => $order]);
            return $pdf->download("Invoice-{$order->order_number}.pdf");
        }

        return view('pdf.invoice', ['order' => $order]);
    }
}
