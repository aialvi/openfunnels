<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Funnel extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'content',
        'settings',
        'is_published',
        'status',
        'views',
        'conversions',
        'conversion_rate',
        'published_at',
    ];

    protected $casts = [
        'content' => 'array',
        'settings' => 'array',
        'is_published' => 'boolean',
        'views' => 'integer',
        'conversions' => 'integer',
        'conversion_rate' => 'decimal:2',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($funnel) {
            if (empty($funnel->slug)) {
                $funnel->slug = Str::slug($funnel->name);
            }
        });

        static::updating(function ($funnel) {
            if ($funnel->isDirty('name') && empty($funnel->slug)) {
                $funnel->slug = Str::slug($funnel->name);
            }
            
            // Update conversion rate when views or conversions change
            if ($funnel->isDirty(['views', 'conversions']) && $funnel->views > 0) {
                $funnel->conversion_rate = ($funnel->conversions / $funnel->views) * 100;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function incrementViews(): void
    {
        $this->increment('views');
        $this->updateConversionRate();
    }

    public function incrementConversions(): void
    {
        $this->increment('conversions');
        $this->updateConversionRate();
    }

    private function updateConversionRate(): void
    {
        if ($this->views > 0) {
            $this->update([
                'conversion_rate' => ($this->conversions / $this->views) * 100
            ]);
        }
    }

    public function publish(): void
    {
        $this->update([
            'is_published' => true,
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function unpublish(): void
    {
        $this->update([
            'is_published' => false,
            'status' => 'draft',
            'published_at' => null,
        ]);
    }
}
