<?php

namespace App\Services;

use App\Models\Funnel;

class FunnelPublicUrlResolver
{
    public function resolve(Funnel $funnel): ?string
    {
        if (! $funnel->is_published) {
            return null;
        }

        $domain = $funnel->relationLoaded('domains')
            ? $funnel->domains->firstWhere('is_verified', true)
            : $funnel->domains()->where('is_verified', true)->latest()->first();

        if ($domain) {
            $scheme = config('publishing.custom_domain_scheme', 'https');

            return sprintf('%s://%s', $scheme, $domain->domain);
        }

        return route('funnels.show', ['funnel' => $funnel->slug]);
    }
}
