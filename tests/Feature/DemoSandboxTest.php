<?php

use App\Mail\NewLeadCaptured;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['demo.enabled' => true, 'demo.lifetime_hours' => 24]);
});

test('guests can enter an isolated seeded editor sandbox', function () {
    $this->get(route('demo'))->assertRedirect();

    $user = User::where('is_demo', true)->firstOrFail();
    expect(auth()->id())->toBe($user->id)
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->funnels)->toHaveCount(1)
        ->and($user->contacts)->toHaveCount(1)
        ->and($user->demo_expires_at?->isFuture())->toBeTrue();
});

test('demo accounts cannot publish or call outbound integrations', function () {
    Mail::fake();
    Http::fake();
    config(['services.lead_capture.webhook_url' => 'https://hooks.example.test/leads']);
    $this->get(route('demo'));

    $user = User::where('is_demo', true)->firstOrFail();
    $funnel = $user->funnels()->firstOrFail();

    $this->post(route('funnels.publish', $funnel))->assertForbidden();
    $this->post(route('funnels.generate'), [])->assertForbidden();
    $this->post(route('funnels.leads.store', $funnel), ['email' => 'guest@example.com'])->assertRedirect();

    Mail::assertNotSent(NewLeadCaptured::class);
    Http::assertNothingSent();
});

test('disabled demo mode returns not found', function () {
    config(['demo.enabled' => false]);
    $this->get(route('demo'))->assertNotFound();
});
