<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@gentlestyle.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'name' => 'Super Admin',
                'phone' => '+12463450695',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        $superAdminRole = Role::where('name', 'Super Admin')->first();
        if ($superAdminRole) {
            $admin->assignRole($superAdminRole);
        }

        // Demo customer user
        $customerUser = User::firstOrCreate(
            ['email' => 'customer@gentlestyle.com'],
            [
                'first_name' => 'Janice',
                'last_name' => 'Miller',
                'name' => 'Janice Miller',
                'phone' => '+1987654321',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        $customerRole = Role::where('name', 'Customer')->first();
        if ($customerRole) {
            $customerUser->assignRole($customerRole);
        }
    }
}
