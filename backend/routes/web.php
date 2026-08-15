<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->name('dashboard');

Route::prefix('admin')->name('admin.')->middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Catalog
    Route::post('products/colors', [ProductController::class, 'storeColor'])->name('products.store-color');
    Route::post('products/sizes', [ProductController::class, 'storeSize'])->name('products.store-size');
    Route::resource('products', ProductController::class);
    Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
    Route::resource('brands', BrandController::class)->except(['create', 'edit']);

    // Sales & Orders
    Route::resource('orders', OrderController::class)->except(['edit', 'update']);
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::resource('coupons', CouponController::class)->except(['create', 'edit']);

    // Customers
    Route::resource('customers', CustomerController::class)->only(['index', 'show']);
    Route::patch('customers/{customer}/toggle-status', [CustomerController::class, 'toggleStatus'])->name('customers.toggle-status');

    // CMS & Marketing
    Route::resource('banners', BannerController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('blogs', BlogController::class)->only(['index', 'store', 'destroy']);

    // Settings
    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
