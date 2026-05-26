<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'user_id',
        'funnel_id',
        'email',
        'name',
        'phone',
        'source',
        'status',
        'tags',
        'metadata',
        'ip_address',
        'user_agent',
        'last_submitted_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'metadata' => 'array',
        'last_submitted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }
}
