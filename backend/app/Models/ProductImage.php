<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'image_path', 'is_primary', 'is_hover', 'sort_order'];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_hover' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
