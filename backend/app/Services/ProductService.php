<?php

namespace App\Services;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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

            $this->syncProductImages($product, $data);
            $this->syncVariants($product, $data);

            return $product->fresh(['brand', 'categories', 'images', 'variants.attributeValues']);
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

            $this->syncProductImages($product, $data);
            $this->syncVariants($product, $data);

            return $product->fresh(['brand', 'categories', 'images', 'variants.attributeValues']);
        });
    }

    public function syncProductImages(Product $product, array $data): void
    {
        // 1. Delete removed images
        if (!empty($data['removed_image_ids']) && is_array($data['removed_image_ids'])) {
            $imagesToDelete = ProductImage::whereIn('id', $data['removed_image_ids'])
                ->where('product_id', $product->id)
                ->get();

            foreach ($imagesToDelete as $img) {
                if ($img->image_path && Storage::disk('public')->exists($img->image_path)) {
                    Storage::disk('public')->delete($img->image_path);
                }
                $img->delete();
            }
        }

        // 2. Update existing images metadata (primary, hover, sort_order)
        if (!empty($data['existing_images']) && is_array($data['existing_images'])) {
            foreach ($data['existing_images'] as $imgMeta) {
                if (isset($imgMeta['id'])) {
                    ProductImage::where('id', $imgMeta['id'])
                        ->where('product_id', $product->id)
                        ->update([
                            'is_primary' => !empty($imgMeta['is_primary']),
                            'is_hover' => !empty($imgMeta['is_hover']),
                            'sort_order' => $imgMeta['sort_order'] ?? 0,
                        ]);
                }
            }
        }

        // 3. Process new image uploads
        if (!empty($data['new_images']) && is_array($data['new_images'])) {
            $newMeta = $data['new_images_meta'] ?? [];
            foreach ($data['new_images'] as $index => $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('products/' . $product->id, 'public');
                    $meta = $newMeta[$index] ?? [];
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'is_primary' => !empty($meta['is_primary']),
                        'is_hover' => !empty($meta['is_hover']),
                        'sort_order' => $meta['sort_order'] ?? ($index + 100),
                    ]);
                }
            }
        }

        // 4. Ensure at most 1 primary image exists
        $primaryImages = ProductImage::where('product_id', $product->id)->where('is_primary', true)->get();
        if ($primaryImages->count() > 1) {
            // Keep the first one, unset others
            $keepId = $primaryImages->first()->id;
            ProductImage::where('product_id', $product->id)->where('id', '!=', $keepId)->update(['is_primary' => false]);
        } elseif ($primaryImages->count() === 0) {
            // Fallback: Set the first available image as primary
            $firstImg = ProductImage::where('product_id', $product->id)->orderBy('sort_order')->first();
            if ($firstImg) {
                $firstImg->update(['is_primary' => true]);
            }
        }

        // 5. Ensure at most 1 hover image exists
        $hoverImages = ProductImage::where('product_id', $product->id)->where('is_hover', true)->get();
        if ($hoverImages->count() > 1) {
            $keepId = $hoverImages->first()->id;
            ProductImage::where('product_id', $product->id)->where('id', '!=', $keepId)->update(['is_hover' => false]);
        }
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
