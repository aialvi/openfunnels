<?php

use App\Contracts\FunnelGenerator;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function generationBrief(): array
{
    return [
        'goal' => 'Lead capture',
        'business' => 'An independent design studio',
        'audience' => 'SaaS founders',
        'offer' => 'A free landing-page review',
        'tone' => 'Clear and confident',
    ];
}

test('authenticated users can generate validated canonical funnel content', function () {
    $this->app->instance(FunnelGenerator::class, new class implements FunnelGenerator
    {
        public function generate(array $brief): array
        {
            return [
                'content' => [
                    'sections' => [[
                        'layout' => 'single',
                        'columns' => [[
                            'blocks' => [[
                                'type' => 'text',
                                'content' => ['text' => 'A focused headline'],
                            ]],
                        ]],
                    ]],
                ],
                'settings' => ['backgroundColor' => '#ffffff', 'maxWidth' => '1100px'],
            ];
        }
    });

    $this->actingAs(User::factory()->create())
        ->postJson(route('funnels.generate'), generationBrief())
        ->assertOk()
        ->assertJsonPath('content.sections.0.type', 'section')
        ->assertJsonPath('content.sections.0.columns.0.blocks.0.type', 'text')
        ->assertJsonPath('settings.maxWidth', '1100px');
});

test('generation is disabled cleanly when no provider is configured', function () {
    config(['funnel-ai.driver' => 'disabled']);

    $this->actingAs(User::factory()->create())
        ->postJson(route('funnels.generate'), generationBrief())
        ->assertServiceUnavailable()
        ->assertJsonPath('message', 'AI funnel generation is not configured.');
});

test('generation endpoint requires authentication', function () {
    $this->postJson(route('funnels.generate'), generationBrief())->assertUnauthorized();
});
