<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\ProductPriceLog;

class ProductObserver
{
    public function updated(Product $product): void
    {
        if ($product->isDirty(['price', 'sale_price', 'cost_price'])) {
            ProductPriceLog::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'old_price' => $product->getOriginal('price'),
                'new_price' => $product->price,
                'old_sale_price' => $product->getOriginal('sale_price'),
                'new_sale_price' => $product->sale_price,
                'old_cost_price' => $product->getOriginal('cost_price'),
                'new_cost_price' => $product->cost_price,
                'reason' => request('price_change_reason') ?? 'Price update via Admin',
            ]);
        }
    }
}
