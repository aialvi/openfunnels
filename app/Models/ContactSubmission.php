<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactSubmission extends Model
{
    protected $fillable = [
        'contact_id',
        'funnel_id',
        'variant_id',
        'form_id',
        'fields',
        'attribution',
        'source',
        'url',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'fields' => 'array',
        'attribution' => 'array',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function funnel(): BelongsTo
    {
        return $this->belongsTo(Funnel::class);
    }
}
