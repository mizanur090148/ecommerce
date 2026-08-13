<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPriceLog extends Model
{
    protected $fillable = [
        'product_id',
        'variant_id',
        'user_id',
        'old_price',
        'new_price',
        'old_sale_price',
        'new_sale_price',
        'old_cost_price',
        'new_cost_price',
        'reason',
    ];

    protected $casts = [
        'old_price' => 'decimal:2',
        'new_price' => 'decimal:2',
        'old_sale_price' => 'decimal:2',
        'new_sale_price' => 'decimal:2',
        'old_cost_price' => 'decimal:2',
        'new_cost_price' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
