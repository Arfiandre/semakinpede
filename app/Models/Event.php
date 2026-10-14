<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'key_takeaways' => 'array',
        'seat_quota' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
