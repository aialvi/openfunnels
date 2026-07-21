<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FunnelVariant extends Model
{
    protected $fillable = ['funnel_id', 'name', 'content', 'settings', 'weight', 'is_active'];

    protected $casts = [
        'content' => 'array',
        'settings' => 'array',
        'weight' => 'integer',
        'is_active' => 'boolean',
    ];

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(FunnelEvent::class, 'variant_id');
    }
}
