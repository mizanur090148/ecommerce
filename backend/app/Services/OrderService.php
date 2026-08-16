<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function getPaginatedOrders(array $filters = [], int $perPage = 10)
    {
        $query = Order::with(['user', 'items']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('billing_address', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));

            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($data['items'] as $itemData) {
                // Pessimistic Database Row Lock to prevent race conditions during high concurrent traffic
                $product = Product::where('id', $itemData['product_id'])->lockForUpdate()->firstOrFail();

                if ($product->is_stock_managed) {
                    if ($product->stock_status === 'out_of_stock' || $product->stock_quantity < 1) {
                        throw new \InvalidArgumentException("Product '{$product->name}' is out of stock.");
                    }
                    if ($itemData['quantity'] > $product->stock_quantity) {
                        throw new \InvalidArgumentException("Cannot order {$itemData['quantity']} units of '{$product->name}'. Only {$product->stock_quantity} available in stock.");
                    }
                }

                $unitPrice = $product->sale_price ?: $product->price;
                $itemSubtotal = $unitPrice * $itemData['quantity'];
                $subtotal += $itemSubtotal;

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'variant_id' => $itemData['variant_id'] ?? null,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $itemData['quantity'],
                    'subtotal' => $itemSubtotal,
                ];

                // Deduct stock quantity
                if ($product->is_stock_managed) {
                    $product->decrement('stock_quantity', $itemData['quantity']);
                    if ($product->stock_quantity <= 0) {
                        $product->update(['stock_status' => 'out_of_stock']);
                    }
                }
            }

            $discountTotal = 0;
            if (!empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', $data['coupon_code'])->where('is_active', true)->first();
                if ($coupon) {
                    $discountTotal = $coupon->type === 'percentage'
                        ? ($subtotal * ($coupon->value / 100))
                        : min($subtotal, $coupon->value);
                    $coupon->increment('used_count');
                }
            }

            $shippingTotal = $data['shipping_total'] ?? 0.00;
            $taxTotal = $data['tax_total'] ?? 0.00;
            $grandTotal = max(0, $subtotal - $discountTotal + $shippingTotal + $taxTotal);

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $data['user_id'] ?? null,
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'status' => 'pending',
                'order_source' => $data['order_source'] ?? 'online',
                'payment_status' => 'pending',
                'payment_method' => $data['payment_method'] ?? 'Direct Bank Transfer',
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'shipping_total' => $shippingTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'billing_address' => $data['billing_address'],
                'shipping_address' => $data['shipping_address'] ?? $data['billing_address'],
                'order_notes' => $data['order_notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
            }

            return $order->load('items');
        });
    }

    public function __construct(protected NotificationService $notificationService)
    {
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);
        if ($status === 'delivered') {
            $order->update(['payment_status' => 'paid']);
        }

        // Trigger Automated SMS & Email Notification
        $this->notificationService->sendOrderStatusNotification($order, $status);

        return $order;
    }
}
