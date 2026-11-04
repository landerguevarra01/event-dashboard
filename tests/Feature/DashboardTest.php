<?php

use App\Enums\UserRole;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('authenticated users are sent to their own dashboard', function (UserRole $role, string $routeName) {
    $this->actingAs(User::factory()->create(['role' => $role]));

    $this->get(route('dashboard'))->assertRedirect(route($routeName));
})->with([
    'super admin' => [UserRole::SuperAdmin, 'super-admin.dashboard'],
    'event admin' => [UserRole::EventAdmin, 'event-admin.dashboard'],
    'staff' => [UserRole::Staff, 'staff.dashboard'],
]);

test('staff cannot open the super admin dashboard', function () {
    $this->actingAs(User::factory()->staff()->create());

    $this->get(route('super-admin.dashboard'))->assertForbidden();
});

test('event admins cannot open the super admin dashboard', function () {
    $this->actingAs(User::factory()->eventAdmin()->create());

    $this->get(route('super-admin.dashboard'))->assertForbidden();
});
