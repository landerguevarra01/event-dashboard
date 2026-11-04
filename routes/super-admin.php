<?php

use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\EventController;
use App\Http\Controllers\SuperAdmin\EventOrganizerController;
use App\Http\Controllers\SuperAdmin\EventRegistrationSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])
    ->prefix('super-admin')
    ->name('super-admin.')
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::get('events', [EventController::class, 'index'])->name('events.index');
        Route::get('events/create', [EventController::class, 'create'])->name('events.create');
        Route::post('events', [EventController::class, 'store'])->name('events.store');

        Route::get('events/{event}/organizers', [EventOrganizerController::class, 'edit'])
            ->name('events.organizers.edit');
        Route::post('events/{event}/organizers', [EventOrganizerController::class, 'store'])
            ->name('events.organizers.store');
        Route::delete('events/{event}/organizers/{user}', [EventOrganizerController::class, 'destroy'])
            ->name('events.organizers.destroy');

        Route::get('events/{event}/registration', [EventRegistrationSettingController::class, 'edit'])
            ->name('events.registration.edit');
        Route::put('events/{event}/registration', [EventRegistrationSettingController::class, 'update'])
            ->name('events.registration.update');

        Route::post('events/{event}/publish', [EventController::class, 'publish'])
            ->name('events.publish');
    });
