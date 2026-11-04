<?php

use App\Http\Controllers\Event\AttendeeController;
use App\Http\Controllers\Event\CheckInController;
use App\Http\Controllers\Event\InformationController;
use App\Http\Controllers\Event\LiveAttendanceController;
use App\Http\Controllers\Event\OperationsController;
use App\Http\Controllers\Event\OverviewController;
use App\Http\Controllers\Event\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'event.access'])
    ->prefix('events/{event}')
    ->name('events.')
    ->group(function () {
        // Visible to everyone assigned to the event
        Route::get('/', OverviewController::class)->name('overview');

        Route::get('registrations', [RegistrationController::class, 'index'])
            ->name('registrations.index');
        Route::post('registrations/{registration}/approve', [RegistrationController::class, 'approve'])
            ->name('registrations.approve');
        Route::post('registrations/{registration}/reject', [RegistrationController::class, 'reject'])
            ->name('registrations.reject');

        Route::get('attendees', [AttendeeController::class, 'index'])
            ->name('attendees.index');
        Route::post('attendees', [AttendeeController::class, 'store'])
            ->name('attendees.store');

        Route::get('check-in', [CheckInController::class, 'index'])
            ->name('check-in.index');
        Route::post('check-in/scan', [CheckInController::class, 'scan'])
            ->name('check-in.scan');
        Route::post('check-in/{attendee}', [CheckInController::class, 'store'])
            ->whereNumber('attendee')
            ->name('check-in.store');

        Route::get('live', LiveAttendanceController::class)
            ->name('live');

        // Event Admins and Super Admins only
        Route::middleware('role:super_admin,event_admin')->group(function () {
            Route::get('information', [InformationController::class, 'edit'])
                ->name('information.edit');
            Route::put('information', [InformationController::class, 'update'])
                ->name('information.update');

            // Event Operations and the closing steps
            Route::get('operations', [OperationsController::class, 'show'])
                ->name('operations.show');
            Route::post('operations/start', [OperationsController::class, 'start'])
                ->name('operations.start');
            Route::post('operations/complete', [OperationsController::class, 'complete'])
                ->name('operations.complete');
            Route::post('operations/archive', [OperationsController::class, 'archive'])
                ->name('operations.archive');

            // Review Attendance
            Route::get('review-attendance', [OperationsController::class, 'review'])
                ->name('review.show');
            Route::post('review-attendance/confirm', [OperationsController::class, 'confirmReview'])
                ->name('review.confirm');
        });
    });
