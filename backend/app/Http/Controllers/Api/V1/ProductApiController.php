<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'categories', 'primaryImage', 'images'])
            ->where('is_active', true);

        if ($request->filled('category')) {
            $catSearch = trim($request->category);
            $query->whereHas('categories', function ($q) use ($catSearch) {
                $q->where('slug', $catSearch)
                  ->orWhere('name', $catSearch)
                  ->orWhere('slug', 'like', '%' . \Illuminate\Support\Str::slug($catSearch) . '%')
                  ->orWhere('name', 'like', '%' . $catSearch . '%');
            });
        }

        if ($request->filled('brand')) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('slug', $request->brand)->orWhere('name', $request->brand);
            });
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'latest' => $query->latest(),
                'best_seller' => $query->orderBy('reviews_count', 'desc'),
                'featured' => $query->where('is_featured', true),
                'price_low_high' => $query->orderBy('price', 'asc'),
                'price_high_low' => $query->orderBy('price', 'desc'),
                default => $query->latest(),
            };
        } else {
            $query->latest();
        }

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with([
            'brand',
            'categories',
            'images',
            'variants.attributeValues',
            'reviews' => fn($q) => $q->where('is_approved', true)->latest(),
        ])
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->first();

        if (!$product) {
            $product = Product::with([
                'brand',
                'categories',
                'images',
                'variants.attributeValues',
                'reviews' => fn($q) => $q->where('is_approved', true)->latest(),
            ])
                ->where('slug', 'like', "%{$slug}%")
                ->first() ?? Product::with([
                    'brand',
                    'categories',
                    'images',
                    'variants.attributeValues',
                    'reviews' => fn($q) => $q->where('is_approved', true)->latest(),
                ])->first();
        }

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    public function storeReview(Request $request, string $productId): JsonResponse
    {
        $validated = $request->validate([
            'reviewer_name' => 'required|string|max:255',
            'reviewer_email' => 'required|email|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        $review = Review::create([
            'product_id' => $productId,
            'user_id' => $request->user()?->id,
            'reviewer_name' => $validated['reviewer_name'],
            'reviewer_email' => $validated['reviewer_email'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_approved' => true,
        ]);

        $product = Product::find($productId);
        if ($product) {
            $reviews = Review::where('product_id', $productId)->get();
            $avgRating = $reviews->avg('rating');
            $product->update([
                'rating_cache' => round($avgRating, 1),
                'reviews_count' => $reviews->count(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Thank you! Your review has been submitted.',
            'data' => $review,
        ]);
    }

    public function filters(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->whereHas('products', function ($q) {
                $q->where('is_active', true);
            })
            ->withCount(['products' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'products_count', 'image', 'description', 'is_featured'])
            ->map(function ($cat) {
                $cat->image = $cat->image_url ?? $cat->image;
                return $cat;
            });

        $specialCategories = Category::where('is_active', true)
            ->where('is_featured', true)
            ->withCount('products')
            ->orderBy('order', 'asc')
            ->take(4)
            ->get(['id', 'name', 'slug', 'image', 'description', 'products_count']);

        if ($specialCategories->count() < 4) {
            $existingIds = $specialCategories->pluck('id')->toArray();
            $fillCategories = Category::where('is_active', true)
                ->whereNotIn('id', $existingIds)
                ->withCount('products')
                ->take(4 - $specialCategories->count())
                ->get(['id', 'name', 'slug', 'image', 'description', 'products_count']);

            $specialCategories = $specialCategories->concat($fillCategories);
        }

        $specialCategories = $specialCategories->map(function ($cat) {
            $cat->image = $cat->image_url ?? $cat->image;
            return $cat;
        });

        $brands = Brand::where('is_active', true)
            ->withCount('products')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'products_count']);

        $minPrice = (float) (Product::where('is_active', true)->min('price') ?? 0);
        $maxPrice = (float) (Product::where('is_active', true)->max('price') ?? 1000);

        return response()->json([
            'status' => 'success',
            'data' => [
                'categories' => $categories,
                'special_categories' => $specialCategories,
                'brands' => $brands,
                'min_price' => floor($minPrice),
                'max_price' => ceil($maxPrice > 0 ? $maxPrice : 1000),
                'colors' => ['#0B2472', '#D6BB4F', '#282828', '#B0D6E8', '#9C7539', '#D29B47', '#E5AE95', '#D76B67', '#BABABA', '#BFDCC4'],
                'sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            ],
        ]);
    }

    public function banners(Request $request): JsonResponse
    {
        $type = $request->query('type');

        $query = \App\Models\Banner::where('is_active', true);

        if ($type) {
            $query->where('type', $type);
        }

        $banners = $query->orderBy('sort_order', 'asc')->latest()->get();

        $banners = $banners->map(function ($b) {
            $b->image = $b->image_url ?? $b->image;
            return $b;
        });

        return response()->json([
            'status' => 'success',
            'data' => $banners,
        ]);
    }
}
