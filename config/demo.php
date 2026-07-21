<?php

return [
    'enabled' => (bool) env('DEMO_MODE', false),
    'lifetime_hours' => (int) env('DEMO_LIFETIME_HOURS', 24),
];
