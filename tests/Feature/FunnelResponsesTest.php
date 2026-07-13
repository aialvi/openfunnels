<?php

use App\Models\Contact;
use App\Models\ContactSubmission;
use App\Models\Funnel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function responseFunnelFor(User $user, string $name = 'Demo Funnel'): Funnel
{
    return $user->funnels()->create([
        'name' => $name,
        'slug' => str($name)->slug(),
        'content' => ['sections' => []],
        'settings' => [],
        'status' => 'published',
        'is_published' => true,
        'published_at' => now(),
    ]);
}

function responseContactFor(User $user, Funnel $funnel, array $overrides = []): Contact
{
    return Contact::create([
        'user_id' => $user->id,
        'funnel_id' => $funnel->id,
        'name' => $overrides['name'] ?? 'Ada Lovelace',
        'email' => $overrides['email'] ?? 'ada@example.com',
        'phone' => $overrides['phone'] ?? '+15555550123',
        'source' => 'funnel_form',
        'status' => $overrides['status'] ?? 'new',
        'last_submitted_at' => now(),
    ]);
}

test('a funnel owner can review each response and its submitted fields', function () {
    $user = User::factory()->create();
    $funnel = responseFunnelFor($user);
    $contact = responseContactFor($user, $funnel);

    ContactSubmission::create([
        'contact_id' => $contact->id,
        'funnel_id' => $funnel->id,
        'form_id' => 'pricing-form',
        'fields' => ['company' => 'Analytical Engines', 'team_size' => '12'],
        'source' => 'funnel_form',
    ]);

    ContactSubmission::create([
        'contact_id' => $contact->id,
        'funnel_id' => $funnel->id,
        'form_id' => 'pricing-form',
        'fields' => ['company' => 'Analytical Engines', 'team_size' => '20'],
        'source' => 'funnel_form',
    ]);

    $this->withoutVite();

    $this->actingAs($user)
        ->get(route('funnels.responses', $funnel))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('funnel-responses')
            ->where('funnel.id', $funnel->id)
            ->where('stats.total_responses', 2)
            ->where('stats.unique_leads', 1)
            ->has('responses.data', 2)
            ->where('responses.data.0.contact.email', 'ada@example.com')
            ->where('responses.data.0.fields.company', 'Analytical Engines'));
});

test('funnel responses support lead, status, form, and date filters', function () {
    $user = User::factory()->create();
    $funnel = responseFunnelFor($user, 'Filtered Funnel');
    $matchingContact = responseContactFor($user, $funnel, [
        'name' => 'Grace Hopper',
        'email' => 'grace@example.com',
        'status' => 'qualified',
    ]);
    $otherContact = responseContactFor($user, $funnel, [
        'name' => 'Alan Turing',
        'email' => 'alan@example.com',
        'status' => 'new',
    ]);

    ContactSubmission::create([
        'contact_id' => $matchingContact->id,
        'funnel_id' => $funnel->id,
        'form_id' => 'demo-request',
        'fields' => ['role' => 'Engineering lead'],
        'source' => 'funnel_form',
    ]);
    ContactSubmission::create([
        'contact_id' => $otherContact->id,
        'funnel_id' => $funnel->id,
        'form_id' => 'newsletter',
        'fields' => ['role' => 'Researcher'],
        'source' => 'funnel_form',
    ]);

    $this->withoutVite();

    $this->actingAs($user)
        ->get(route('funnels.responses', [
            'funnel' => $funnel,
            'search' => 'Grace',
            'status' => 'qualified',
            'form_id' => 'demo-request',
            'date_from' => now()->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('responses.data', 1)
            ->where('responses.data.0.contact.email', 'grace@example.com')
            ->where('filters.status', 'qualified')
            ->where('filters.form_id', 'demo-request'));
});

test('users cannot view another owners funnel responses', function () {
    $owner = User::factory()->create();
    $funnel = responseFunnelFor($owner, 'Private Funnel');

    $this->actingAs(User::factory()->create())
        ->get(route('funnels.responses', $funnel))
        ->assertForbidden();
});
