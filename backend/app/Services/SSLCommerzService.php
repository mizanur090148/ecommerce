<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SSLCommerzService
{
    protected string $storeId;
    protected string $storePassword;
    protected string $baseUrl;
    protected bool $isSandbox;

    public function __construct()
    {
        $this->storeId = trim(env('SSLCZ_STORE_ID') ?: config('sslcommerz.store_id', 'testbox'));
        $this->storePassword = trim(env('SSLCZ_STORE_PASSWORD') ?: config('sslcommerz.store_password', 'gwprocess@ssl'));
        $this->isSandbox = (bool) env('SSLCZ_IS_SANDBOX', config('sslcommerz.is_sandbox', true));
        $this->baseUrl = $this->isSandbox ? 'https://sandbox-gw.sslcommerz.com' : 'https://securepay.sslcommerz.com';
    }

    /**
     * Get HTTP client instance (disables local SSL cert verify on Windows local dev / sandbox mode).
     */
    protected function httpClient()
    {
        return $this->isSandbox ? Http::withoutVerifying() : Http::client();
    }

    /**
     * Initiate payment session with SSLCommerz (bKash, Nagad, Cards, Banking).
     */
    public function initiatePayment(Order $order): array
    {
        $billing = is_array($order->billing_address) ? $order->billing_address : json_decode($order->billing_address, true);

        $itemSummary = $order->items && count($order->items) > 0
            ? $order->items->pluck('product_name')->take(3)->implode(', ')
            : 'Order #' . $order->order_number;

        if ($order->items && count($order->items) > 3) {
            $itemSummary .= '...';
        }

        $postData = [
            'store_id' => $this->storeId,
            'store_passwd' => $this->storePassword,
            'total_amount' => number_format($order->grand_total, 2, '.', ''),
            'currency' => 'BDT',
            'tran_id' => $order->order_number,
            'success_url' => url('/api/v1/payment/sslcommerz/success'),
            'fail_url' => url('/api/v1/payment/sslcommerz/fail'),
            'cancel_url' => url('/api/v1/payment/sslcommerz/cancel'),
            'ipn_url' => url('/api/v1/payment/sslcommerz/ipn'),

            // Customer Information
            'cus_name' => trim(($billing['firstName'] ?? 'Customer') . ' ' . ($billing['lastName'] ?? '')),
            'cus_email' => $order->customer_email,
            'cus_add1' => $billing['address'] ?? 'Dhaka',
            'cus_city' => $billing['city'] ?? 'Dhaka',
            'cus_postcode' => $billing['postcode'] ?? '1000',
            'cus_country' => 'Bangladesh',
            'cus_phone' => $order->customer_phone ?? '01700000000',

            // Shipment Information
            'shipping_method' => 'NO',
            'num_of_item' => count($order->items),
            'product_name' => substr($itemSummary, 0, 255),
            'product_category' => 'General Apparel',
            'product_profile' => 'physical-goods',
        ];

        $endpoint = $this->baseUrl . '/gwprocess/v4/api.php';

        try {
            $response = $this->httpClient()->asForm()->post($endpoint, $postData);
            $result = $response->json();

            if (isset($result['status']) && $result['status'] === 'SUCCESS' && isset($result['GatewayPageURL'])) {
                return [
                    'status' => 'success',
                    'gateway_url' => $result['GatewayPageURL'],
                ];
            }

            Log::error('SSLCommerz initiation failed', [
                'store_id' => $this->storeId,
                'endpoint' => $endpoint,
                'response' => $result
            ]);

            $reason = $result['failedreason'] ?? 'Failed to initiate SSLCommerz payment gateway.';

            if (str_contains($reason, 'Store Credential Error')) {
                $reason .= " (Store ID: '{$this->storeId}'). Please verify SSLCZ_STORE_ID and SSLCZ_STORE_PASSWORD in backend/.env.";
            }

            return [
                'status' => 'error',
                'message' => $reason,
            ];
        } catch (\Exception $e) {
            Log::error('SSLCommerz Exception', ['error' => $e->getMessage()]);

            return [
                'status' => 'error',
                'message' => 'Network error connecting to SSLCommerz gateway: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Validate payment response with SSLCommerz server validation API.
     */
    public function validatePayment(array $postData, float $expectedAmount = 0.0): bool
    {
        $valId = $postData['val_id'] ?? null;
        if (!$valId) return false;

        $endpoint = $this->baseUrl . '/validator/api/validationserverAPI.php';

        try {
            $response = $this->httpClient()->get($endpoint, [
                'val_id' => $valId,
                'store_id' => $this->storeId,
                'store_passwd' => $this->storePassword,
                'format' => 'json',
            ]);

            $result = $response->json();

            if (isset($result['status']) && ($result['status'] === 'VALID' || $result['status'] === 'VALIDATED')) {
                // Verify paid amount matches expected order total
                if ($expectedAmount > 0) {
                    $paidAmount = (float) ($result['amount'] ?? $result['currency_amount'] ?? 0);
                    if (abs($paidAmount - $expectedAmount) > 1.0) {
                        Log::warning('SSLCommerz Amount mismatch', [
                            'paid' => $paidAmount,
                            'expected' => $expectedAmount,
                            'tran_id' => $postData['tran_id'] ?? null,
                        ]);
                        return false;
                    }
                }
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('SSLCommerz Validation Exception', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
