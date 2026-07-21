<?php

use App\Models\Funnel;
use App\Models\FunnelEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function analyticsFunnel(User $user, bool $published = true): Funnel
{
    return $user->funnels()->create([
        'name' => 'Analytics funnel',
        'slug' => 'analytics-funnel',
        'content' => ['sections' => []],
        'settings' => [],
        'status' => $published ? 'published' : 'draft',
        'is_published' => $published,
    ]);
}

test('published funnels accept privacy conscious analytics events', function () {
    $funnel = analyticsFunnel(User::factory()->create());
    $sessionId = 'd4aaac82-e654-4c8d-9c22-2cdea9cf0a17';

    $this->postJson(route('funnels.events.store', $funnel), [
        'event_type' => 'form_start',
        'session_id' => $sessionId,
        'form_id' => 'lead-form',
        'attribution' => ['utm_source' => 'community'],
    ])->assertAccepted();

    $event = FunnelEvent::firstOrFail();
    expect($event->session_id)->toBe(hash('sha256', $sessionId))
        ->and($event->attribution['utm_source'])->toBe('community');
});

test('draft funnels do not accept anonymous analytics events', function () {
    $funnel = analyticsFunnel(User::factory()->create(), false);

    $this->postJson(route('funnels.events.store', $funnel), ['event_type' => 'view'])->assertNotFound();
});

test('dashboard exposes daily and source analytics for owned funnels', function () {
    $user = User::factory()->create();
    $funnel = analyticsFunnel($user);
    $funnel->events()->create([
        'event_type' => 'conversion',
        'attribution' => ['utm_source' => 'newsletter'],
        'occurred_at' => now(),
    ]);

    $this->withoutVite();
    $this->actingAs($user)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('analytics.daily', 14)
        ->where('analytics.sources.0.source', 'newsletter')
        ->where('analytics.sources.0.conversions', 1));
});
