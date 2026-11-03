<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            ['Super Admin', 'superadmin@example.com', UserRole::SuperAdmin],
            ['Event Admin', 'eventadmin@example.com', UserRole::EventAdmin],
            ['Staff User', 'staff@example.com', UserRole::Staff],
        ];

        foreach ($users as [$name, $email, $role]) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => $role,
                ]
            );
        }
    }
}