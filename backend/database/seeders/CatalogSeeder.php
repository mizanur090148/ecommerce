<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Brands
        $brandsData = ['Adidas', 'Balmain', 'Balenciaga', 'Burberry', 'Kenzo', 'Givenchy', 'Zara'];
        $brandModels = [];
        foreach ($brandsData as $bName) {
            $brandModels[] = Brand::firstOrCreate(
                ['slug' => Str::slug($bName)],
                ['name' => $bName, 'description' => "Official {$bName} brand collection", 'is_active' => true, 'is_featured' => true]
            );
        }

        // Categories
        $categoriesData = [
            'Women' => ['Dresses', 'Jackets', 'Jumpers & Cardigans', 'Sweatshirts', 'Swimwear'],
            'Men' => ['Shorts', 'T-Shirts & Tops', 'Jeans', 'Trousers'],
            'Kids' => ['Boys', 'Girls'],
            'Accessories' => ['Bags', 'Mirrors', 'Rug', 'Watch']
        ];

        $categoryMap = [];
        foreach ($categoriesData as $parentName => $subCats) {
            $parentCat = Category::firstOrCreate(
                ['slug' => Str::slug($parentName)],
                ['name' => $parentName, 'is_active' => true]
            );
            $categoryMap[$parentName] = $parentCat;

            foreach ($subCats as $subName) {
                $subCat = Category::firstOrCreate(
                    ['slug' => Str::slug($subName)],
                    ['parent_id' => $parentCat->id, 'name' => $subName, 'is_active' => true]
                );
                $categoryMap[$subName] = $subCat;
            }
        }

        // Attributes (Color & Size)
        $colorAttr = Attribute::firstOrCreate(['code' => 'color'], ['name' => 'Color', 'type' => 'color']);
        $sizeAttr = Attribute::firstOrCreate(['code' => 'size'], ['name' => 'Size', 'type' => 'button']);

        $colorValues = [
            'Black' => '#222222',
            'Red' => '#C8393D',
            'Grey' => '#E4E4E4',
            'Blue' => '#0B2472',
            'Yellow' => '#D6BB4F'
        ];
        $colorValModels = [];
        foreach ($colorValues as $cName => $cHex) {
            $colorValModels[$cName] = AttributeValue::firstOrCreate(
                ['attribute_id' => $colorAttr->id, 'value' => $cName],
                ['color_code' => $cHex]
            );
        }

        $sizeValues = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        $sizeValModels = [];
        foreach ($sizeValues as $sVal) {
            $sizeValModels[$sVal] = AttributeValue::firstOrCreate(
                ['attribute_id' => $sizeAttr->id, 'value' => $sVal]
            );
        }

        // Tags
        $tagsData = ['biker', 'black', 'bomber', 'leather', 'cotton', 'summer', 'trendy'];
        $tagModels = [];
        foreach ($tagsData as $tName) {
            $tagModels[] = Tag::firstOrCreate(['slug' => Str::slug($tName)], ['name' => $tName]);
        }

        // Store Products matching Frontend StoreData
        $storeProducts = [
            ['name' => 'Cropped Faux Leather Jacket', 'price' => 29.00, 'category' => 'Jackets', 'type' => 'configurable'],
            ['name' => 'Calvin Shorts', 'price' => 62.00, 'category' => 'Shorts', 'type' => 'simple'],
            ['name' => 'Shirt In Botanical Cheetah Print', 'price' => 60.00, 'category' => 'T-Shirts & Tops', 'type' => 'simple'],
            ['name' => 'Cotton Jersey T-Shirt', 'price' => 17.00, 'category' => 'T-Shirts & Tops', 'type' => 'simple'],
            ['name' => 'Cableknit Shawl', 'price' => 100.00, 'category' => 'Jumpers & Cardigans', 'type' => 'simple'],
            ['name' => 'Colorful Jacket', 'price' => 69.00, 'category' => 'Jackets', 'type' => 'simple'],
            ['name' => 'Zessi Dresses', 'price' => 99.00, 'category' => 'Dresses', 'type' => 'simple'],
            ['name' => 'Kirby T-Shirt', 'price' => 37.00, 'category' => 'T-Shirts & Tops', 'type' => 'simple'],
            ['name' => 'Hosking Blue Area Rug', 'price' => 29.00, 'category' => 'Rug', 'type' => 'simple'],
            ['name' => 'Hanneman Pouf', 'price' => 92.00, 'category' => 'Bags', 'type' => 'simple'],
            ['name' => 'Cushion Futon Slipcover', 'price' => 25.00, 'category' => 'Accessories', 'type' => 'simple'],
            ['name' => 'Hub Accent Mirror', 'price' => 27.00, 'category' => 'Mirrors', 'type' => 'simple'],
            ['name' => 'Bold Male Black Analog', 'price' => 39.00, 'category' => 'Watch', 'type' => 'simple'],
            ['name' => 'Lightweight Puffer Jacket With a Hood', 'price' => 90.00, 'category' => 'Jackets', 'type' => 'configurable']
        ];

        foreach ($storeProducts as $idx => $pItem) {
            $slug = Str::slug($pItem['name']);
            $sku = 'SKU-' . str_pad($idx + 1, 4, '0', STR_PAD_LEFT);

            $product = Product::firstOrCreate(
                ['slug' => $slug],
                [
                    'brand_id' => $brandModels[$idx % count($brandModels)]->id,
                    'name' => $pItem['name'],
                    'sku' => $sku,
                    'type' => $pItem['type'],
                    'short_description' => "High quality {$pItem['name']} made from premium materials.",
                    'description' => "Phasellus sed volutpat orci. Fusce eget lore mauris vehicula elementum gravida nec dui. Aenean aliquam varius ipsum, non ultricies tellus sodales eu.",
                    'price' => $pItem['price'],
                    'sale_price' => $pItem['price'] * 0.9,
                    'stock_quantity' => 50,
                    'low_stock_threshold' => 5,
                    'is_stock_managed' => true,
                    'stock_status' => 'in_stock',
                    'is_active' => true,
                    'is_featured' => $idx % 2 === 0,
                    'is_trendy' => true,
                    'rating_cache' => 4.8,
                    'reviews_count' => rand(15, 120),
                ]
            );

            // Attach Category
            if (isset($categoryMap[$pItem['category']])) {
                $product->categories()->sync([$categoryMap[$pItem['category']]->id]);
            }

            // Create Variants if Configurable
            if ($pItem['type'] === 'configurable') {
                foreach (['S', 'M', 'L'] as $sizeKey) {
                    foreach (['Black', 'Red'] as $colorKey) {
                        $varSku = $sku . '-' . $sizeKey . '-' . strtoupper($colorKey);
                        $variant = ProductVariant::firstOrCreate(
                            ['sku' => $varSku],
                            [
                                'product_id' => $product->id,
                                'price' => $pItem['price'],
                                'stock_quantity' => 20
                            ]
                        );

                        if (isset($sizeValModels[$sizeKey]) && isset($colorValModels[$colorKey])) {
                            $variant->attributeValues()->sync([
                                $sizeValModels[$sizeKey]->id,
                                $colorValModels[$colorKey]->id
                            ]);
                        }
                    }
                }
            }
        }
    }
}
