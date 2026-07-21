<?php

namespace Tests;

class DomainMappingDnsFake
{
    /**
     * @var array<string, array<int, array<int, array<string, string>>>>
     */
    public static array $records = [];

    public static function records(string $hostname, int $type): array|false
    {
        return self::$records[$hostname][$type] ?? false;
    }
}
