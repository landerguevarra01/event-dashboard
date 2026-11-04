<?php

use App\Http\Controllers\DashboardRedirectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardRedirectController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/super-admin.php';
require __DIR__.'/event-admin.php';
require __DIR__.'/staff.php';
require __DIR__.'/event-workspace.php';
