<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function scopeForAdminListing(Builder $query): void
    {
        $query->select([
            'id', 'name', 'contact_type', 'contact', 'level', 'source',
            'submitted_at', 'notes', 'event_id', 'event_title', 'has_account',
            'demo_account_number', 'demo_investor_password', 'created_at', 'updated_at',
        ])->selectRaw("CASE WHEN screenshot_real_account IS NOT NULL AND screenshot_real_account <> '' THEN 1 ELSE 0 END AS has_real_account_evidence")
            ->selectRaw("CASE WHEN screenshot_transfer IS NOT NULL AND screenshot_transfer <> '' THEN 1 ELSE 0 END AS has_transfer_evidence")
            ->selectRaw("CASE WHEN screenshot_real_account LIKE 'data:%' THEN NULL ELSE SUBSTR(screenshot_real_account, 1, 2048) END AS real_account_evidence_url")
            ->selectRaw("CASE WHEN screenshot_transfer LIKE 'data:%' THEN NULL ELSE SUBSTR(screenshot_transfer, 1, 2048) END AS transfer_evidence_url");
    }
}
