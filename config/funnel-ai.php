<?php

return [
    'driver' => env('FUNNEL_AI_DRIVER', 'disabled'),
    'endpoint' => env('FUNNEL_AI_ENDPOINT', 'https://api.openai.com/v1/responses'),
    'api_key' => env('FUNNEL_AI_API_KEY'),
    'model' => env('FUNNEL_AI_MODEL', 'gpt-5.6-luna'),
    'timeout' => (int) env('FUNNEL_AI_TIMEOUT', 45),
];
