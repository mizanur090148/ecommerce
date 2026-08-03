<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(protected ProductService $productService)
    {
    }

    public function index(Request $request): Response
    {
        $products = $this->productService->getPaginatedProducts($request->all(), 10);
        $categories = Category::where('is_active', true)->get(['id', 'name']);
        $brands = Brand::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => $request->only(['search', 'category', 'brand', 'stock_status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [
            'categories' => Category::where('is_active', true)->get(),
            'brands' => Brand::where('is_active', true)->get(),
            'tags' => Tag::all(),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    public function storeColor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color_code' => 'required|string|max:50',
        ]);

        $colorAttr = Attribute::firstOrCreate(['code' => 'color'], ['name' => 'Color', 'type' => 'color']);

        AttributeValue::firstOrCreate(
            ['attribute_id' => $colorAttr->id, 'value' => $validated['name']],
            ['color_code' => $validated['color_code']]
        );

        return redirect()->back()->with('success', 'New Color option added successfully.');
    }

    public function storeSize(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
        ]);

        $sizeAttr = Attribute::firstOrCreate(['code' => 'size'], ['name' => 'Size', 'type' => 'button']);

        AttributeValue::firstOrCreate([
            'attribute_id' => $sizeAttr->id,
            'value' => strtoupper($validated['name']),
        ]);

        return redirect()->back()->with('success', 'New Size option added successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'type' => 'required|in:simple,configurable,virtual,downloadable',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids' => 'array',
            'tag_ids' => 'array',
            'color_sizes' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'key_features' => 'nullable|string',
            'materials_care' => 'nullable|string',
            'storage_spec' => 'nullable|string',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_trendy' => 'boolean',
        ]);

        $this->productService->createProduct($validated);

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['categories', 'tags', 'images', 'variants.attributeValues']);

        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->get(),
            'brands' => Brand::where('is_active', true)->get(),
            'tags' => Tag::all(),
            'attributes' => Attribute::with('values')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:products,sku,' . $product->id,
            'type' => 'required|in:simple,configurable,virtual,downloadable',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids' => 'array',
            'tag_ids' => 'array',
            'color_sizes' => 'nullable|array',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'key_features' => 'nullable|string',
            'materials_care' => 'nullable|string',
            'storage_spec' => 'nullable|string',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_trendy' => 'boolean',
        ]);

        $this->productService->updateProduct($product, $validated);

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $this->productService->deleteProduct($product);

        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
