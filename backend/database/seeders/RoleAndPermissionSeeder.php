<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage-users' => 'Users',
            'manage-catalog' => 'Catalog',
            'manage-orders' => 'Orders',
            'manage-customers' => 'Customers',
            'manage-coupons' => 'Marketing',
            'manage-cms' => 'CMS',
            'manage-settings' => 'Settings',
        ];

        foreach ($permissions as $name => $group) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['group' => $group]
            );
        }

        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $customer = Role::firstOrCreate(['name' => 'Customer', 'guard_name' => 'web']);

        $allPermissionIds = Permission::pluck('id');
        $superAdmin->permissions()->sync($allPermissionIds);
        $admin->permissions()->sync($allPermissionIds);
    }
}
