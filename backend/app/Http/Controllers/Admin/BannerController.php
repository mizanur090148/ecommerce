<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        $banners = Banner::orderBy('sort_order')->latest()->get();

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
            'image' => 'nullable',
            'link_url' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->image_url;
        }

        Banner::create($validated);

        return redirect()->back()->with('success', 'Banner created successfully.');
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'type' => 'required|in:hero,collection,deal,popup',
            'image' => 'nullable',
            'link_url' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($banner->image && Storage::disk('public')->exists(str_replace('/storage/', '', $banner->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $banner->image));
            }
            $path = $request->file('image')->store('banners', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->image_url;
        } elseif (isset($validated['image']) && is_string($validated['image'])) {
            $validated['image'] = $banner->image;
        }

        $banner->update($validated);

        return redirect()->back()->with('success', 'Banner updated successfully.');
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image && Storage::disk('public')->exists(str_replace('/storage/', '', $banner->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $banner->image));
        }

        $banner->delete();

        return redirect()->back()->with('success', 'Banner deleted successfully.');
    }
}
