<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelEvent extends Model
{
    protected $fillable = [
        'funnel_id',
        'event_type',
        'session_id',
        'form_id',
        'attribution',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'attribution' => 'array',
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }
}
