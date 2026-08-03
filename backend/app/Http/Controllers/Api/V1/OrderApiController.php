<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderApiController extends Controller
{
    public function __construct(protected OrderService $orderService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'billing_address' => 'required|array',
            'shipping_address' => 'nullable|array',
            'payment_method' => 'required|string',
            'coupon_code' => 'nullable|string',
            'order_notes' => 'nullable|string',
        ]);

        $order = $this->orderService->createOrder($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Order placed successfully',
            'data' => $order,
        ], 201);
    }
}
