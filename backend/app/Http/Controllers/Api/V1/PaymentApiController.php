<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\SSLCommerzService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentApiController extends Controller
{
    protected OrderService $orderService;
    protected SSLCommerzService $sslCommerzService;

    public function __construct(OrderService $orderService, SSLCommerzService $sslCommerzService)
    {
        $this->orderService = $orderService;
        $this->sslCommerzService = $sslCommerzService;
    }

    /**
     * Create order and initiate SSLCommerz payment (bKash, Nagad, Rocket, Cards).
     */
    public function initiateSSLCommerz(Request $request): JsonResponse
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
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'nullable|array',
            'coupon_code' => 'nullable|string',
            'order_notes' => 'nullable|string',
        ]);

        $validated['payment_method'] = 'SSLCommerz (bKash / Nagad / Cards)';

        try {
            $order = $this->orderService->createOrder($validated);
            $paymentResult = $this->sslCommerzService->initiatePayment($order);

            if ($paymentResult['status'] === 'success') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment session initiated',
                    'gateway_url' => $paymentResult['gateway_url'],
                    'order' => $order,
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => $paymentResult['message'] ?? 'Failed to connect to SSLCommerz',
            ], 400);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Callback for successful SSLCommerz payment.
     */
    public function successSSLCommerz(Request $request): RedirectResponse
    {
        $tranId = $request->input('tran_id');

        $order = Order::where('order_number', $tranId)->first();

        if ($order) {
            if ($this->sslCommerzService->validatePayment($request->all(), (float) $order->grand_total)) {
                $cardType = $request->input('card_type') ?? $request->input('card_brand') ?? '';
                $cardIssuer = $request->input('card_issuer') ?? '';

                $specificMethod = 'SSLCommerz';
                if (stripos($cardType, 'BKASH') !== false || stripos($cardIssuer, 'BKASH') !== false) {
                    $specificMethod = 'bKash (SSLCommerz)';
                } elseif (stripos($cardType, 'NAGAD') !== false || stripos($cardIssuer, 'NAGAD') !== false) {
                    $specificMethod = 'Nagad (SSLCommerz)';
                } elseif (stripos($cardType, 'ROCKET') !== false || stripos($cardIssuer, 'ROCKET') !== false) {
                    $specificMethod = 'Rocket (SSLCommerz)';
                } elseif (stripos($cardType, 'VISA') !== false) {
                    $specificMethod = 'Visa Card (SSLCommerz)';
                } elseif (stripos($cardType, 'MASTER') !== false) {
                    $specificMethod = 'Mastercard (SSLCommerz)';
                } elseif ($cardType) {
                    $specificMethod = "{$cardType} (SSLCommerz)";
                } else {
                    $specificMethod = 'SSLCommerz';
                }

                $order->update([
                    'status' => 'processing',
                    'payment_status' => 'paid',
                    'payment_method' => $specificMethod,
                ]);
            }
        }

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect()->to("{$frontendUrl}/cart?status=success&order=" . ($order ? $order->order_number : ''));
    }

    /**
     * Callback for failed SSLCommerz payment.
     */
    public function failSSLCommerz(Request $request): RedirectResponse
    {
        $tranId = $request->input('tran_id');
        $order = Order::where('order_number', $tranId)->first();

        if ($order) {
            $order->update(['payment_status' => 'failed']);
        }

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect()->to("{$frontendUrl}/cart?status=failed");
    }

    /**
     * Callback for cancelled SSLCommerz payment.
     */
    public function cancelSSLCommerz(Request $request): RedirectResponse
    {
        $tranId = $request->input('tran_id');
        $order = Order::where('order_number', $tranId)->first();

        if ($order) {
            $order->update(['status' => 'cancelled', 'payment_status' => 'cancelled']);
        }

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect()->to("{$frontendUrl}/cart?status=cancelled");
    }

    /**
     * IPN Webhook (Instant Payment Notification) handler from SSLCommerz server.
     */
    public function ipnSSLCommerz(Request $request): JsonResponse
    {
        $tranId = $request->input('tran_id');
        $status = $request->input('status');

        $order = Order::where('order_number', $tranId)->first();

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['status' => 'success', 'message' => 'Order already marked as paid']);
        }

        if (($status === 'VALID' || $status === 'VALIDATED') && $this->sslCommerzService->validatePayment($request->all(), (float) $order->grand_total)) {
            $order->update([
                'status' => 'processing',
                'payment_status' => 'paid',
            ]);
            return response()->json(['status' => 'success', 'message' => 'IPN payment validated successfully']);
        }

        return response()->json(['status' => 'failed', 'message' => 'IPN validation failed'], 400);
    }
}
