<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'title',
        'category',
        'amount',
        'expense_date',
        'payment_method',
        'reference_number',
        'note',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date:Y-m-d',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
