<?php

use App\Http\Controllers\Api\V1\AuthApiController;
use App\Http\Controllers\Api\V1\OrderApiController;
use App\Http\Controllers\Api\V1\ProductApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth REST APIs
    Route::post('/auth/register', [AuthApiController::class, 'register']);
    Route::post('/auth/login', [AuthApiController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthApiController::class, 'me']);
        Route::post('/auth/logout', [AuthApiController::class, 'logout']);
    });

    // Public Catalog REST APIs
    Route::get('/products', [ProductApiController::class, 'index']);
    Route::get('/products/filters', [ProductApiController::class, 'filters']);
    Route::get('/products/{slug}', [ProductApiController::class, 'show']);

    // Orders & Checkout REST APIs
    Route::post('/checkout', [OrderApiController::class, 'store']);
    Route::post('/coupons/validate', [OrderApiController::class, 'validateCoupon']);
});
