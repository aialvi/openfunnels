<?php

use App\Models\Funnel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function publishingFunnel(User $user, bool $published): Funnel
{
    return $user->funnels()->create([
        'name' => $published ? 'Published Offer' : 'Draft Offer',
        'slug' => $published ? 'published-offer' : 'draft-offer',
        'content' => ['sections' => []],
        'settings' => ['backgroundColor' => '#ffffff', 'maxWidth' => '1200px'],
        'status' => $published ? 'published' : 'draft',
        'is_published' => $published,
        'published_at' => $published ? now() : null,
    ]);
}

test('guests can view a published funnel by slug', function () {
    $funnel = publishingFunnel(User::factory()->create(), true);
    $this->withoutVite();

    $this->get(route('funnels.show', $funnel->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('funnel-preview')
            ->where('previewMode', false)
            ->where('funnel.is_published', true));
});

test('a draft public url does not expose an authorization error to guests', function () {
    $funnel = publishingFunnel(User::factory()->create(), false);

    $this->get(route('funnels.show', $funnel->slug))->assertNotFound();
});

test('the owner can inspect a draft funnel by slug', function () {
    $user = User::factory()->create();
    $funnel = publishingFunnel($user, false);
    $this->withoutVite();

    $this->actingAs($user)->get(route('funnels.show', $funnel->slug))->assertOk();
});

test('funnels created by different users receive globally unique public slugs', function () {
    $firstUser = User::factory()->create();
    $secondUser = User::factory()->create();

    $payload = [
        'name' => 'Shared Offer',
        'content' => json_encode(['sections' => []]),
        'settings' => json_encode([]),
    ];

    $this->actingAs($firstUser)->post(route('funnels.store'), $payload)->assertRedirect();
    $this->actingAs($secondUser)->post(route('funnels.store'), $payload)->assertRedirect();

    expect($firstUser->funnels()->firstOrFail()->slug)->toBe('shared-offer')
        ->and($secondUser->funnels()->firstOrFail()->slug)->toBe('shared-offer-1');
});
