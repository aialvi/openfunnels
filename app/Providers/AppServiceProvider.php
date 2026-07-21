<?php

namespace App\Providers;

use App\Contracts\FunnelGenerator;
use App\Services\Ai\DisabledFunnelGenerator;
use App\Services\Ai\OpenAICompatibleFunnelGenerator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(FunnelGenerator::class, function () {
            if (config('funnel-ai.driver') === 'openai-compatible' && config('funnel-ai.api_key')) {
                return new OpenAICompatibleFunnelGenerator;
            }

            return new DisabledFunnelGenerator;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
