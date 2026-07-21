<?php

namespace App\Contracts;

interface FunnelGenerator
{
    /**
     * @param  array{goal:string,business:string,audience:string,offer:string,tone:string}  $brief
     * @return array{content:array<string,mixed>,settings:array<string,mixed>}
     */
    public function generate(array $brief): array;
}
