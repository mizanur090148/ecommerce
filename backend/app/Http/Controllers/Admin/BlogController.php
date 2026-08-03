<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $blogs = Blog::with('author')->latest()->paginate(10);

        return Inertia::render('Admin/Blogs/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['author_id'] = auth()->id();
        $validated['published_at'] = $validated['is_published'] ? now() : null;

        Blog::create($validated);

        return redirect()->back()->with('success', 'Blog post created successfully.');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();

        return redirect()->back()->with('success', 'Blog post deleted successfully.');
    }
}
