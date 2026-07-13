<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Public funnel URLs
    |--------------------------------------------------------------------------
    |
    | Verified custom domains normally use HTTPS. Self-hosters terminating TLS
    | elsewhere can override this for local or private-network installations.
    |
    */
    'custom_domain_scheme' => env('FUNNEL_CUSTOM_DOMAIN_SCHEME', 'https'),
];
