<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistApiController extends Controller
{
    /**
     * Get all wishlisted products for logged-in user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $wishlists = Wishlist::with(['product.primaryImage', 'product.images', 'product.brand', 'product.categories'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $products = $wishlists->pluck('product')->filter();

        return response()->json([
            'status' => 'success',
            'data' => $products->values(),
        ]);
    }

    /**
     * Toggle a product in user's wishlist (add if missing, remove if present).
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();
        $productId = $request->input('product_id');

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'status' => 'success',
                'action' => 'removed',
                'message' => 'Removed from Wishlist',
            ]);
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $productId,
        ]);

        return response()->json([
            'status' => 'success',
            'action' => 'added',
            'message' => 'Added to Wishlist',
        ]);
    }

    /**
     * Bulk sync guest LocalStorage wishlist items into user DB wishlist upon login.
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $user = $request->user();
        $productIds = $request->input('product_ids');

        foreach ($productIds as $productId) {
            Wishlist::firstOrCreate([
                'user_id' => $user->id,
                'product_id' => $productId,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Wishlist synced successfully',
        ]);
    }
}
