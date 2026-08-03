<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Blog;
use App\Models\Coupon;
use App\Models\DealTimer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        // Banners
        Banner::firstOrCreate(['title' => 'Summer Sale Stylish'], [
            'subtitle' => 'Limited Time Offer - Up to 60% off & Free Shipping',
            'type' => 'hero',
            'image' => 'banner_1.jpg',
            'link_url' => '/shop',
            'is_active' => true,
            'sort_order' => 1
        ]);

        Banner::firstOrCreate(['title' => 'Spring Collection Sale'], [
            'subtitle' => 'Deal of the Week',
            'type' => 'deal',
            'image' => 'banner_2.jpg',
            'link_url' => '/shop',
            'is_active' => true,
            'sort_order' => 2
        ]);

        // Deal Timer
        DealTimer::firstOrCreate(['title' => 'Spring Collection'], [
            'subtitle' => 'Deal of the Week',
            'end_datetime' => now()->addDays(30),
            'is_active' => true
        ]);

        // Coupons
        Coupon::firstOrCreate(['code' => 'SPRING20'], [
            'type' => 'percentage',
            'value' => 20.00,
            'min_spend' => 50.00,
            'is_active' => true,
            'expires_at' => now()->addMonths(3)
        ]);

        Coupon::firstOrCreate(['code' => 'FLAT10'], [
            'type' => 'fixed',
            'value' => 10.00,
            'min_spend' => 30.00,
            'is_active' => true,
            'expires_at' => now()->addMonths(6)
        ]);

        // Blogs
        $author = User::where('email', 'admin@uomo.com')->first();
        $blogTopics = [
            "Woman with good shoes is never be ugly place",
            "Heaven upon heaven moveth every have known",
            "Tree doesn't good void, waters without created",
            "Given Set was without from god divide rule Hath",
            "Tree earth fowl given moveth deep lesser after sky",
            "Us yielding Fish sea night night the said him two"
        ];

        foreach ($blogTopics as $idx => $heading) {
            Blog::firstOrCreate(['slug' => \Illuminate\Support\Str::slug($heading)], [
                'title' => $heading,
                'thumbnail' => "blog" . ($idx + 1) . ".jpg",
                'content' => "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                'author_id' => $author?->id,
                'published_at' => now(),
                'is_published' => true
            ]);
        }

        // Settings
        $settingsData = [
            'store_name' => 'Uomo Enterprise eCommerce',
            'store_email' => 'sale@uomo.com',
            'store_phone' => '+1 246-345-0695',
            'store_address' => '1418 River Drive, Suite 35 Cottonhall, CA 9622 United States',
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'shipping_flat_rate' => '5.00',
            'tax_rate_percent' => '10.0',
        ];

        foreach ($settingsData as $key => $val) {
            Setting::set($key, $val, 'general');
        }

        // Sample Orders for Dashboard Testing
        $customer = User::where('email', 'customer@uomo.com')->first();
        $product = Product::first();

        if ($customer && $product) {
            for ($i = 1; $i <= 5; $i++) {
                $order = Order::firstOrCreate(['order_number' => 'ORD-' . (1000 + $i)], [
                    'user_id' => $customer->id,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone ?? '+1987654321',
                    'status' => $i % 2 === 0 ? 'delivered' : 'processing',
                    'payment_status' => 'paid',
                    'payment_method' => 'Direct Bank Transfer',
                    'subtotal' => $product->price * $i,
                    'discount_total' => 0.00,
                    'shipping_total' => 5.00,
                    'tax_total' => 11.00,
                    'grand_total' => ($product->price * $i) + 16.00,
                    'billing_address' => [
                        'first_name' => 'Janice',
                        'last_name' => 'Miller',
                        'street' => '123 Main St',
                        'city' => 'New York',
                        'zip' => '10001',
                        'country' => 'United States'
                    ],
                    'shipping_address' => [
                        'first_name' => 'Janice',
                        'last_name' => 'Miller',
                        'street' => '123 Main St',
                        'city' => 'New York',
                        'zip' => '10001',
                        'country' => 'United States'
                    ]
                ]);

                OrderItem::firstOrCreate(['order_id' => $order->id, 'product_id' => $product->id], [
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price' => $product->price,
                    'quantity' => $i,
                    'subtotal' => $product->price * $i
                ]);
            }
        }
    }
}
