<?php

use App\Models\Funnel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function experimentFunnel(User $user): Funnel
{
    return $user->funnels()->create([
        'name' => 'Experiment funnel',
        'slug' => 'experiment-funnel',
        'content' => ['sections' => []],
        'settings' => ['backgroundColor' => '#ffffff', 'maxWidth' => '1200px'],
        'status' => 'published',
        'is_published' => true,
    ]);
}

test('owners can create and activate snapshot variants', function () {
    $user = User::factory()->create();
    $funnel = experimentFunnel($user);

    $this->actingAs($user)->post(route('funnels.variants.store', $funnel), [
        'name' => 'Short headline',
        'weight' => 40,
        'content' => json_encode(['sections' => []]),
        'settings' => json_encode(['backgroundColor' => '#111111']),
    ])->assertRedirect();

    $variant = $funnel->variants()->firstOrFail();
    $this->actingAs($user)
        ->patch(route('funnels.variants.update', [$funnel, $variant]), ['is_active' => true])
        ->assertRedirect();

    expect($variant->fresh()->is_active)->toBeTrue();
});

test('active traffic allocation cannot exceed one hundred percent', function () {
    $user = User::factory()->create();
    $funnel = experimentFunnel($user);
    $funnel->variants()->create([
        'name' => 'Variant B',
        'content' => ['sections' => []],
        'settings' => [],
        'weight' => 70,
        'is_active' => true,
    ]);
    $variant = $funnel->variants()->create([
        'name' => 'Variant C',
        'content' => ['sections' => []],
        'settings' => [],
        'weight' => 40,
    ]);

    $this->actingAs($user)
        ->patch(route('funnels.variants.update', [$funnel, $variant]), ['is_active' => true])
        ->assertSessionHasErrors('weight');

    expect($variant->fresh()->is_active)->toBeFalse();
});

test('public assignment renders the selected variant and attributes submissions', function () {
    $funnel = experimentFunnel(User::factory()->create());
    $variant = $funnel->variants()->create([
        'name' => 'Variant B',
        'content' => ['sections' => []],
        'settings' => ['backgroundColor' => '#111111', 'maxWidth' => '900px'],
        'weight' => 100,
        'is_active' => true,
    ]);

    $this->withoutVite();
    $this->get(route('funnels.show', $funnel->slug))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('funnel-preview')
        ->where('funnel.variant_id', $variant->id)
        ->where('funnel.settings.backgroundColor', '#111111'));

    $this->post(route('funnels.leads.store', $funnel), [
        'email' => 'variant@example.com',
        'variant_id' => $variant->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('contact_submissions', ['funnel_id' => $funnel->id, 'variant_id' => $variant->id]);
    $this->assertDatabaseHas('funnel_events', ['funnel_id' => $funnel->id, 'variant_id' => $variant->id, 'event_type' => 'conversion']);
});
