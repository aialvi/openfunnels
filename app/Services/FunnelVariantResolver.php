<?php

namespace App\Services;

use App\Models\Funnel;
use App\Models\FunnelVariant;
use Illuminate\Http\Request;

class FunnelVariantResolver
{
    /** @return array{variant:FunnelVariant|null,cookie:string,value:string} */
    public function resolve(Funnel $funnel, Request $request): array
    {
        $cookie = 'of_variant_'.$funnel->id;
        $variants = $funnel->variants()->where('is_active', true)->orderBy('id')->get();
        $selected = $variants->firstWhere('id', (int) $request->cookie($cookie));

        if (! $selected && $variants->isNotEmpty()) {
            $roll = random_int(1, 100);
            $cursor = 0;
            foreach ($variants as $variant) {
                $cursor += $variant->weight;
                if ($roll <= min(100, $cursor)) {
                    $selected = $variant;
                    break;
                }
            }
        }

        return [
            'variant' => $selected,
            'cookie' => $cookie,
            'value' => $selected ? (string) $selected->id : 'control',
        ];
    }
}
