<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        $banners = Banner::orderBy('sort_order')->get();

        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'type' => 'required|in:hero,collection,deal,popup',
            'image' => 'required|string',
            'link_url' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Banner::create($validated);

        return redirect()->back()->with('success', 'Banner created successfully.');
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();

        return redirect()->back()->with('success', 'Banner deleted successfully.');
    }
}
