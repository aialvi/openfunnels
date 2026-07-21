<?php

namespace App\Services\Ai;

use App\Contracts\FunnelGenerator;
use RuntimeException;

class DisabledFunnelGenerator implements FunnelGenerator
{
    public function generate(array $brief): array
    {
        throw new RuntimeException('AI funnel generation is not configured.');
    }
}
