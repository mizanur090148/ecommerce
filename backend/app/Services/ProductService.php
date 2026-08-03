<?php

namespace App\Services;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function getPaginatedProducts(array $filters = [], int $perPage = 10)
    {
        $query = Product::with(['brand', 'categories', 'primaryImage']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('slug', $filters['category']);
            });
        }

        if (!empty($filters['brand'])) {
            $query->whereHas('brand', function ($q) use ($filters) {
                $q->where('slug', $filters['brand']);
            });
        }

        if (isset($filters['stock_status'])) {
            $query->where('stock_status', $filters['stock_status']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
            if (empty($data['sku'])) {
                $data['sku'] = 'SKU-' . strtoupper(Str::random(6));
            }

            $product = Product::create($data);

            if (!empty($data['category_ids'])) {
                $product->categories()->sync($data['category_ids']);
            }

            if (!empty($data['tag_ids'])) {
                $product->tags()->sync($data['tag_ids']);
            }

            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $imgPath) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imgPath,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            $this->syncVariants($product, $data);

            return $product;
        });
    }

    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            if (isset($data['name']) && empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            $product->update($data);

            if (isset($data['category_ids'])) {
                $product->categories()->sync($data['category_ids']);
            }

            if (isset($data['tag_ids'])) {
                $product->tags()->sync($data['tag_ids']);
            }

            $this->syncVariants($product, $data);

            return $product->fresh(['brand', 'categories', 'images', 'variants.attributeValues']);
        });
    }

    protected function syncVariants(Product $product, array $data): void
    {
        $colorSizes = $data['color_sizes'] ?? [];

        if (!empty($colorSizes)) {
            // Force delete previous variants to avoid soft-deleted duplicate SKU unique constraint in MySQL
            $product->variants()->forceDelete();

            foreach ($colorSizes as $colorId => $sizeIds) {
                if (empty($sizeIds) || !is_array($sizeIds)) {
                    continue;
                }

                $colorVal = AttributeValue::find($colorId);
                if (!$colorVal) {
                    continue;
                }

                foreach ($sizeIds as $sizeId) {
                    $sizeVal = AttributeValue::find($sizeId);
                    if (!$sizeVal) {
                        continue;
                    }

                    $varSku = $product->sku . '-' . strtoupper(Str::slug($sizeVal->value)) . '-' . strtoupper(Str::slug($colorVal->value));

                    // Use updateOrCreate with product_id and sku to guarantee safety
                    $variant = ProductVariant::withTrashed()->updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'sku' => $varSku,
                        ],
                        [
                            'price' => $product->price,
                            'stock_quantity' => $product->stock_quantity,
                            'deleted_at' => null,
                        ]
                    );

                    $variant->attributeValues()->sync([$colorId, $sizeId]);
                }
            }
        }
    }

    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }
}
