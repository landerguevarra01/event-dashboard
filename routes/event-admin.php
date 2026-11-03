<?php

use App\Http\Controllers\EventAdmin\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:event_admin'])
    ->prefix('event-admin')
    ->name('event-admin.')
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });