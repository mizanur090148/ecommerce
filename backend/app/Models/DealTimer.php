<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DealTimer extends Model
{
    protected $fillable = ['title', 'subtitle', 'end_datetime', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'end_datetime' => 'datetime',
    ];
}
