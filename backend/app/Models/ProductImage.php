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

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        if (empty($this->image_path)) {
            return null;
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return asset('storage/' . ltrim($this->image_path, '/'));
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
