<?php

use App\Models\Funnel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function autosaveFunnel(User $user): Funnel
{
    return $user->funnels()->create([
        'name' => 'Original funnel',
        'slug' => 'original-funnel',
        'content' => ['sections' => []],
        'settings' => ['backgroundColor' => '#ffffff', 'maxWidth' => '1200px'],
    ]);
}

test('owners can autosave with optimistic revision updates', function () {
    $user = User::factory()->create();
    $funnel = autosaveFunnel($user);

    $this->actingAs($user)
        ->putJson(route('funnels.autosave', $funnel), [
            'revision' => 1,
            'name' => 'Updated funnel',
            'description' => 'Recovered safely',
            'content' => ['sections' => []],
            'settings' => ['backgroundColor' => '#111111', 'maxWidth' => '960px'],
        ])
        ->assertOk()
        ->assertJsonPath('revision', 2);

    expect($funnel->fresh())
        ->name->toBe('Updated funnel')
        ->revision->toBe(2);
});

test('stale autosaves return a conflict without overwriting content', function () {
    $user = User::factory()->create();
    $funnel = autosaveFunnel($user);
    $funnel->update(['revision' => 2, 'name' => 'Server copy']);

    $this->actingAs($user)
        ->putJson(route('funnels.autosave', $funnel), [
            'revision' => 1,
            'name' => 'Stale browser copy',
            'content' => ['sections' => []],
            'settings' => [],
        ])
        ->assertConflict()
        ->assertJsonPath('revision', 2);

    expect($funnel->fresh()->name)->toBe('Server copy');
});

test('users cannot autosave another users funnel', function () {
    $funnel = autosaveFunnel(User::factory()->create());

    $this->actingAs(User::factory()->create())
        ->putJson(route('funnels.autosave', $funnel), [
            'revision' => 1,
            'name' => 'Unauthorized update',
            'content' => ['sections' => []],
            'settings' => [],
        ])
        ->assertForbidden();
});
