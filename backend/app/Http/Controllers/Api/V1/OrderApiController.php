<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
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
            'customer_phone' => 'required|string',
            'billing_address' => 'required|array',
            'billing_address.firstName' => 'required|string',
            'billing_address.lastName' => 'required|string',
            'billing_address.address' => 'required|string',
            'billing_address.city' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|integer',
            'items.*.color' => 'nullable|string',
            'items.*.size' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'nullable|array',
            'payment_method' => 'required|string',
            'coupon_code' => 'nullable|string',
            'order_notes' => 'nullable|string',
        ]);

        try {
            $order = $this->orderService->createOrder($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully',
                'data' => $order,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json(['status' => 'error', 'message' => 'Invalid or inactive coupon code.'], 404);
        }

        if ($coupon->expires_at && now()->greaterThan($coupon->expires_at)) {
            return response()->json(['status' => 'error', 'message' => 'This coupon has expired.'], 422);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['status' => 'error', 'message' => 'Coupon usage limit reached.'], 422);
        }

        if ($coupon->min_spend && $request->subtotal < $coupon->min_spend) {
            return response()->json([
                'status' => 'error',
                'message' => "Minimum order amount of ৳" . number_format($coupon->min_spend, 2) . " required for this coupon.",
            ], 422);
        }

        $discountAmount = 0;
        if ($coupon->type === 'percentage') {
            $discountAmount = ($request->subtotal * $coupon->value) / 100;
        } elseif ($coupon->type === 'fixed') {
            $discountAmount = min($coupon->value, $request->subtotal);
        } elseif ($coupon->type === 'free_shipping') {
            $discountAmount = $coupon->value;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon applied successfully!',
            'data' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float)$coupon->value,
                'discount_amount' => round($discountAmount, 2),
                'min_spend' => $coupon->min_spend ? (float)$coupon->min_spend : null,
            ],
        ]);
    }

    public function showByNumber(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order,
        ]);
    }
}
