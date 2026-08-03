<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected AnalyticsService $analyticsService)
    {
    }

    public function index(): Response
    {
        $metrics = $this->analyticsService->getDashboardMetrics();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
        ]);
    }
}
