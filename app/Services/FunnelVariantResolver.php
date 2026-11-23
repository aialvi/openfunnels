<?php

namespace App\Services;

use App\Models\Funnel;
use App\Models\FunnelVariant;
use Illuminate\Http\Request;

class FunnelVariantResolver
{
    /**
     * Marks a visitor who was assigned to the control during an experiment. Distinct
     * from the legacy "control" value, which was also written when nothing was running.
     */
    public const CONTROL = 'assigned-control';

    /**
     * The value is null when no experiment is active, so nothing should be persisted.
     *
     * @return array{variant:FunnelVariant|null,cookie:string,value:string|null}
     */
    public function resolve(Funnel $funnel, Request $request): array
    {
        $cookie = 'of_variant_'.$funnel->id;
        $variants = $funnel->variants()->where('is_active', true)->orderBy('id')->get();

        if ($variants->isEmpty()) {
            return ['variant' => null, 'cookie' => $cookie, 'value' => null];
        }

        $assigned = $request->cookie($cookie);
        $selected = $variants->firstWhere('id', (int) $assigned);

        if (! $selected && $assigned !== self::CONTROL) {
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
            'value' => $selected ? (string) $selected->id : self::CONTROL,
        ];
    }
}
