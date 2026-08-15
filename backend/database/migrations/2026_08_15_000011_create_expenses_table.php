<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('category', [
                'carrying_cost',
                'delivery_cost',
                'employee_cost',
                'marketing_cost',
                'utility_cost',
                'packaging_cost',
                'office_cost',
                'other'
            ])->default('other');
            $table->decimal('amount', 12, 2);
            $table->date('expense_date');
            $table->string('payment_method')->default('cash');
            $table->string('reference_number')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
