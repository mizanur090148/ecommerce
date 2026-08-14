<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'order_source')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('order_source', 32)->default('online')->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'order_source')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('order_source');
            });
        }
    }
};
