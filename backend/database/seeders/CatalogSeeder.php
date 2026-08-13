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
        // 1. Brands
        $brandsData = [
            'Adidas', 'Nike', 'Zara', 'Balenciaga', 'Burberry', 
            'Kenzo', 'Givenchy', 'Apple', 'Sony', 'Puma', 'Gucci', 'Levi\'s'
        ];
        $brandModels = [];
        foreach ($brandsData as $bName) {
            $brandModels[] = Brand::firstOrCreate(
                ['slug' => Str::slug($bName)],
                ['name' => $bName, 'description' => "Official {$bName} brand collection", 'is_active' => true, 'is_featured' => true]
            );
        }

        // 2. Categories & Subcategories
        $categoriesStructure = [
            'Women' => ['Dresses', 'Jackets', 'Jumpers & Cardigans', 'Sweatshirts', 'Swimwear'],
            'Men' => ['Shorts', 'T-Shirts & Tops', 'Jeans', 'Trousers', 'Hoodies'],
            'Kids' => ['Boys', 'Girls', 'Infants'],
            'Accessories' => ['Bags', 'Mirrors', 'Rug', 'Watch', 'Sunglasses', 'Jewelry'],
            'Electronics' => ['Headphones', 'Smartwatches', 'Audio Equipment', 'Laptops'],
            'Footwear' => ['Sneakers', 'Boots', 'Sandals', 'Formal Shoes'],
            'Digital Goods' => ['Software & Presets', 'eBooks & Guides', 'Audio & Music Stems']
        ];

        $categoryMap = [];
        $allCategoriesList = [];
        foreach ($categoriesStructure as $parentName => $subCats) {
            $parentCat = Category::firstOrCreate(
                ['slug' => Str::slug($parentName)],
                ['name' => $parentName, 'is_active' => true]
            );
            $categoryMap[$parentName] = $parentCat;
            $allCategoriesList[] = $parentCat;

            foreach ($subCats as $subName) {
                $subCat = Category::firstOrCreate(
                    ['slug' => Str::slug($subName)],
                    ['parent_id' => $parentCat->id, 'name' => $subName, 'is_active' => true]
                );
                $categoryMap[$subName] = $subCat;
                $allCategoriesList[] = $subCat;
            }
        }

        // 3. Attributes (Color & Size)
        $colorAttr = Attribute::firstOrCreate(['code' => 'color'], ['name' => 'Color', 'type' => 'color']);
        $sizeAttr = Attribute::firstOrCreate(['code' => 'size'], ['name' => 'Size', 'type' => 'button']);

        $colorValues = [
            'Black' => '#222222',
            'Red' => '#C8393D',
            'Grey' => '#E4E4E4',
            'Blue' => '#0B2472',
            'Yellow' => '#D6BB4F',
            'White' => '#FFFFFF',
            'Green' => '#2E7D32',
            'Pink' => '#EC407A'
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

        // 4. Tags
        $tagsData = ['biker', 'black', 'bomber', 'leather', 'cotton', 'summer', 'trendy', 'casual', 'premium', 'vintage', 'luxury', 'digital'];
        $tagModels = [];
        foreach ($tagsData as $tName) {
            $tagModels[] = Tag::firstOrCreate(['slug' => Str::slug($tName)], ['name' => $tName]);
        }

        // High Quality Unsplash Image Pools by Theme
        $imagePools = [
            'apparel' => [
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop',
            ],
            'footwear' => [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop',
            ],
            'electronics' => [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop',
            ],
            'digital' => [
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
            ]
        ];

        // Base Product Seeds Templates
        $productCatalogTemplates = [
            // Configurable Apparel
            ['name' => 'Cropped Faux Leather Jacket', 'cat' => 'Jackets', 'type' => 'configurable', 'price' => 129.00, 'pool' => 'apparel'],
            ['name' => 'Lightweight Puffer Jacket With Hood', 'cat' => 'Jackets', 'type' => 'configurable', 'price' => 150.00, 'pool' => 'apparel'],
            ['name' => 'Oversized Vintage Denim Jacket', 'cat' => 'Jackets', 'type' => 'configurable', 'price' => 110.00, 'pool' => 'apparel'],
            ['name' => 'Classic Cotton Crewneck T-Shirt', 'cat' => 'T-Shirts & Tops', 'type' => 'configurable', 'price' => 35.00, 'pool' => 'apparel'],
            ['name' => 'Botanical Print Summer Shirt', 'cat' => 'T-Shirts & Tops', 'type' => 'configurable', 'price' => 65.00, 'pool' => 'apparel'],
            ['name' => 'Slim Fit Stretch Chino Trousers', 'cat' => 'Trousers', 'type' => 'configurable', 'price' => 79.00, 'pool' => 'apparel'],
            ['name' => 'Urban Streetwear Fleece Hoodie', 'cat' => 'Hoodies', 'type' => 'configurable', 'price' => 88.00, 'pool' => 'apparel'],
            ['name' => 'Floral Evening Maxi Dress', 'cat' => 'Dresses', 'type' => 'configurable', 'price' => 145.00, 'pool' => 'apparel'],
            ['name' => 'Ribbed Knit Wool Sweater', 'cat' => 'Jumpers & Cardigans', 'type' => 'configurable', 'price' => 95.00, 'pool' => 'apparel'],
            ['name' => 'Athletic Performance Shorts', 'cat' => 'Shorts', 'type' => 'configurable', 'price' => 45.00, 'pool' => 'apparel'],

            // Footwear
            ['name' => 'UltraBoost Performance Running Sneakers', 'cat' => 'Sneakers', 'type' => 'configurable', 'price' => 180.00, 'pool' => 'footwear'],
            ['name' => 'Classic Leather Retro Low Sneakers', 'cat' => 'Sneakers', 'type' => 'configurable', 'price' => 120.00, 'pool' => 'footwear'],
            ['name' => 'Waterproof Leather Hiking Boots', 'cat' => 'Boots', 'type' => 'simple', 'price' => 210.00, 'pool' => 'footwear'],
            ['name' => 'Italian Calfskin Formal Oxfords', 'cat' => 'Formal Shoes', 'type' => 'simple', 'price' => 290.00, 'pool' => 'footwear'],
            ['name' => 'Casual Slide Sandals', 'cat' => 'Sandals', 'type' => 'simple', 'price' => 38.00, 'pool' => 'footwear'],

            // Electronics & Gadgets
            ['name' => 'Wireless Noise Canceling Headphones Pro', 'cat' => 'Headphones', 'type' => 'simple', 'price' => 349.00, 'pool' => 'electronics'],
            ['name' => 'Smart Fitness Tracker Watch Ultra', 'cat' => 'Smartwatches', 'type' => 'simple', 'price' => 249.00, 'pool' => 'electronics'],
            ['name' => 'Hi-Fi Studio Monitor Speakers', 'cat' => 'Audio Equipment', 'type' => 'simple', 'price' => 499.00, 'pool' => 'electronics'],
            ['name' => 'Slim Metal Mechanical Keyboard', 'cat' => 'Electronics', 'type' => 'simple', 'price' => 129.00, 'pool' => 'electronics'],
            ['name' => 'Ultra HD Portable Monitor', 'cat' => 'Laptops', 'type' => 'simple', 'price' => 299.00, 'pool' => 'electronics'],

            // Virtual Products (Services / Subscriptions)
            ['name' => 'VIP Lifetime Store Membership Pass', 'cat' => 'Digital Goods', 'type' => 'virtual', 'price' => 199.00, 'pool' => 'digital'],
            ['name' => 'Custom Fashion Styling 1-on-1 Consultation', 'cat' => 'Digital Goods', 'type' => 'virtual', 'price' => 85.00, 'pool' => 'digital'],
            ['name' => 'Extended 3-Year Product Protection Plan', 'cat' => 'Digital Goods', 'type' => 'virtual', 'price' => 49.00, 'pool' => 'digital'],
            ['name' => 'Priority Express Shipping & Handling Pass', 'cat' => 'Digital Goods', 'type' => 'virtual', 'price' => 29.00, 'pool' => 'digital'],

            // Downloadable Products
            ['name' => 'Mastering E-Commerce Growth Playbook (eBook)', 'cat' => 'eBooks & Guides', 'type' => 'downloadable', 'price' => 29.00, 'pool' => 'digital'],
            ['name' => 'Pro Lightroom Preset Pack for Portrait & Fashion', 'cat' => 'Software & Presets', 'type' => 'downloadable', 'price' => 39.00, 'pool' => 'digital'],
            ['name' => 'Minimalist UI/UX Design System Asset Kit', 'cat' => 'Software & Presets', 'type' => 'downloadable', 'price' => 59.00, 'pool' => 'digital'],
            ['name' => 'Royalty-Free Lo-Fi Ambient Audio Stems', 'cat' => 'Audio & Music Stems', 'type' => 'downloadable', 'price' => 19.00, 'pool' => 'digital'],
        ];

        // Seed 105 Products total
        $targetTotalProducts = 105;
        $productCount = 0;

        for ($i = 1; $i <= $targetTotalProducts; $i++) {
            $template = $productCatalogTemplates[($i - 1) % count($productCatalogTemplates)];
            
            // Variations in product names for uniqueness
            $prefix = ($i > count($productCatalogTemplates)) ? "Series " . ceil($i / 10) . " - " : "";
            $suffix = ($i > count($productCatalogTemplates)) ? " (" . chr(65 + ($i % 26)) . ")" : "";
            $name = $prefix . $template['name'] . $suffix;
            
            $slug = Str::slug($name) . '-' . $i;
            $sku = 'SKU-' . str_pad($i, 5, '0', STR_PAD_LEFT);
            $type = $template['type'];

            $price = $template['price'] + (rand(-10, 30));
            if ($price < 10) $price = 19.99;
            $salePrice = (rand(0, 100) > 40) ? round($price * 0.85, 2) : null;
            $costPrice = round($price * 0.5, 2);

            $brand = $brandModels[rand(0, count($brandModels) - 1)];

            $product = Product::create([
                'brand_id' => $brand->id,
                'name' => $name,
                'slug' => $slug,
                'sku' => $sku,
                'type' => $type,
                'short_description' => "High quality {$name} featuring premium construction and modern design.",
                'description' => "Experience exceptional quality with {$name}. Built to last, designed for elegance, and crafted with meticulous attention to detail. Perfect for modern lifestyle needs.",
                'key_features' => "• Premium Build Quality\n• Modern Ergonomic Design\n• 1-Year Warranty Included",
                'materials_care' => "100% Premium Material. Spot clean or gentle machine wash.",
                'storage_spec' => "Keep in cool dry place.",
                'price' => $price,
                'sale_price' => $salePrice,
                'cost_price' => $costPrice,
                'stock_quantity' => rand(15, 120),
                'low_stock_threshold' => 5,
                'is_stock_managed' => $type !== 'virtual' && $type !== 'downloadable',
                'stock_status' => 'in_stock',
                'weight' => rand(1, 20) / 10,
                'dimensions' => rand(10, 40) . 'x' . rand(10, 30) . 'x' . rand(5, 20) . ' cm',
                'is_active' => true,
                'is_featured' => rand(0, 100) > 60,
                'is_trendy' => rand(0, 100) > 50,
                'rating_cache' => rand(40, 50) / 10,
                'reviews_count' => rand(5, 140),
                'meta_title' => "{$name} - Buy Online",
                'meta_description' => "Shop {$name} at best prices. Fast shipping and official warranty.",
            ]);

            // Attach Categories
            $catName = $template['cat'];
            if (isset($categoryMap[$catName])) {
                $product->categories()->sync([$categoryMap[$catName]->id]);
            } else {
                $product->categories()->sync([$allCategoriesList[rand(0, count($allCategoriesList) - 1)]->id]);
            }

            // Attach Random Tags
            $randomTagIds = collect($tagModels)->pluck('id')->random(rand(2, 4))->toArray();
            $product->tags()->sync($randomTagIds);

            // Attach Images (Primary, Hover, Gallery)
            $pool = $imagePools[$template['pool']] ?? $imagePools['apparel'];
            $img1 = $pool[($i) % count($pool)];
            $img2 = $pool[($i + 1) % count($pool)];
            $img3 = $pool[($i + 2) % count($pool)];

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $img1,
                'is_primary' => true,
                'is_hover' => false,
                'sort_order' => 0,
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $img2,
                'is_primary' => false,
                'is_hover' => true,
                'sort_order' => 1,
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $img3,
                'is_primary' => false,
                'is_hover' => false,
                'sort_order' => 2,
            ]);

            // Create Variants for Configurable products
            if ($type === 'configurable') {
                $sizesToUse = ['S', 'M', 'L', 'XL'];
                $colorsToUse = ['Black', 'Red', 'Blue'];

                foreach ($sizesToUse as $sizeKey) {
                    foreach ($colorsToUse as $colorKey) {
                        $varSku = $sku . '-' . $sizeKey . '-' . strtoupper(substr($colorKey, 0, 3));
                        $variant = ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => $varSku,
                            'price' => $price,
                            'sale_price' => $salePrice,
                            'stock_quantity' => rand(5, 30),
                        ]);

                        if (isset($sizeValModels[$sizeKey]) && isset($colorValModels[$colorKey])) {
                            $variant->attributeValues()->sync([
                                $sizeValModels[$sizeKey]->id,
                                $colorValModels[$colorKey]->id
                            ]);
                        }
                    }
                }
            }

            $productCount++;
        }
    }
}
