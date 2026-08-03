<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = ['user_id', 'company_name', 'loyalty_points'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
