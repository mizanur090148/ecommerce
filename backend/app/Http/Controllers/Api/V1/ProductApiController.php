<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'categories', 'primaryImage', 'images'])
            ->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category)->orWhere('name', $request->category);
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
        $product = Product::with(['brand', 'categories', 'images', 'variants.attributeValues', 'reviews'])
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    public function filters(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'slug', 'products_count']);

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
                'brands' => $brands,
                'min_price' => floor($minPrice),
                'max_price' => ceil($maxPrice > 0 ? $maxPrice : 1000),
                'colors' => ['#0B2472', '#D6BB4F', '#282828', '#B0D6E8', '#9C7539', '#D29B47', '#E5AE95', '#D76B67', '#BABABA', '#BFDCC4'],
                'sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            ],
        ]);
    }
}
