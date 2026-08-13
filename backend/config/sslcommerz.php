<?php

return [
    'store_id' => env('SSLCZ_STORE_ID', 'testbox'),
    'store_password' => env('SSLCZ_STORE_PASSWORD', 'gwprocess@ssl'),
    'is_sandbox' => env('SSLCZ_IS_SANDBOX', true),
    'api_url' => env('SSLCZ_IS_SANDBOX', true)
        ? 'https://sandbox-gw.sslcommerz.com'
        : 'https://securepay.sslcommerz.com',
];
