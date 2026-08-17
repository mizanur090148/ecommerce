<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with('product:id,name,slug');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reviewer_name', 'like', "%{$search}%")
                  ->orWhere('reviewer_email', 'like', "%{$search}%")
                  ->orWhere('comment', 'like', "%{$search}%")
                  ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        $reviews = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['search']),
        ]);
    }

    public function toggleApproval(Review $review)
    {
        $review->update([
            'is_approved' => !$review->is_approved,
        ]);

        $this->recalculateProductRating($review->product_id);

        return back()->with('success', 'Review status updated successfully.');
    }

    public function destroy(Review $review)
    {
        $productId = $review->product_id;
        $review->delete();

        $this->recalculateProductRating($productId);

        return back()->with('success', 'Review deleted successfully.');
    }

    private function recalculateProductRating($productId)
    {
        $product = Product::find($productId);
        if ($product) {
            $approvedReviews = Review::where('product_id', $productId)
                ->where('is_approved', true)
                ->get();

            $avgRating = $approvedReviews->avg('rating') ?? 0;
            $product->update([
                'rating_cache' => round($avgRating, 1),
                'reviews_count' => $approvedReviews->count(),
            ]);
        }
    }
}
