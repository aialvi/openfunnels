<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('average conversion rate is weighted by views', function () {
    $user = User::factory()->create();
    $user->funnels()->create(['name' => 'Busy', 'slug' => 'busy', 'views' => 900, 'conversions' => 90, 'conversion_rate' => 10]);
    $user->funnels()->create(['name' => 'Small', 'slug' => 'small', 'views' => 100, 'conversions' => 0, 'conversion_rate' => 0]);
    $user->funnels()->create(['name' => 'Draft', 'slug' => 'draft']);

    $this->actingAs($user)
        ->get(route('funnels.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('stats.avg_conversion_rate', 9));
});

test('average conversion rate is zero without views', function () {
    $user = User::factory()->create();
    $user->funnels()->create(['name' => 'Draft', 'slug' => 'draft']);

    $this->actingAs($user)
        ->get(route('funnels.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('stats.avg_conversion_rate', 0));
});
