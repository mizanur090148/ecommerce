<?php

use App\Http\Controllers\Api\V1\OrderApiController;
use App\Http\Controllers\Api\V1\ProductApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Catalog REST APIs
    Route::get('/products', [ProductApiController::class, 'index']);
    Route::get('/products/filters', [ProductApiController::class, 'filters']);
    Route::get('/products/{slug}', [ProductApiController::class, 'show']);

    // Orders & Checkout REST APIs
    Route::post('/checkout', [OrderApiController::class, 'store']);
});
