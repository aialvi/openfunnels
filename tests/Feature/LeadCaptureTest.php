<?php

use App\Mail\NewLeadCaptured;
use App\Models\Funnel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

function createLeadCaptureFunnelFor(User $user, array $overrides = []): Funnel
{
    return $user->funnels()->create([
        'name' => $overrides['name'] ?? 'Lead Capture Funnel',
        'slug' => $overrides['slug'] ?? 'lead-capture-funnel',
        'description' => $overrides['description'] ?? null,
        'content' => $overrides['content'] ?? ['sections' => []],
        'settings' => $overrides['settings'] ?? ['backgroundColor' => '#ffffff', 'maxWidth' => '1200px'],
        'status' => $overrides['status'] ?? 'published',
        'is_published' => $overrides['is_published'] ?? true,
        'views' => $overrides['views'] ?? 0,
        'conversions' => $overrides['conversions'] ?? 0,
        'conversion_rate' => $overrides['conversion_rate'] ?? 0,
        'published_at' => $overrides['published_at'] ?? now(),
    ]);
}

test('published funnel form submissions create contacts and increment conversions', function () {
    Mail::fake();

    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user);

    $this->post(route('funnels.leads.store', $funnel), [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'phone' => '+15555550123',
        'form_id' => 'block-form-1',
    ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('contacts', [
        'user_id' => $user->id,
        'funnel_id' => $funnel->id,
        'email' => 'ada@example.com',
        'name' => 'Ada Lovelace',
        'phone' => '+15555550123',
        'source' => 'funnel_form',
        'status' => 'new',
    ]);
    $this->assertDatabaseHas('contact_submissions', [
        'funnel_id' => $funnel->id,
        'form_id' => 'block-form-1',
    ]);

    Mail::assertSent(NewLeadCaptured::class);

    $funnel->refresh();

    expect($funnel->conversions)->toBe(1);
    expect((float) $funnel->conversion_rate)->toBe(0.0);
});

test('lead capture can send a webhook payload', function () {
    Mail::fake();
    Http::fake();
    config(['services.lead_capture.webhook_url' => 'https://hooks.example.test/leads']);

    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user);

    $this->post(route('funnels.leads.store', $funnel), [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'form_id' => 'demo-form',
        'fields' => ['email' => 'ada@example.com'],
    ])->assertRedirect();

    Http::assertSent(fn ($request) => $request->url() === 'https://hooks.example.test/leads'
        && $request['event'] === 'lead.captured'
        && $request['contact']['email'] === 'ada@example.com'
        && $request['funnel']['id'] === $funnel->id);
});

test('repeat submissions update the existing contact for the account', function () {
    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user);

    $this->post(route('funnels.leads.store', $funnel), [
        'email' => 'ada@example.com',
        'form_id' => 'first-form',
    ])->assertRedirect();

    $this->post(route('funnels.leads.store', $funnel), [
        'name' => 'Ada',
        'email' => 'ADA@example.com',
        'form_id' => 'second-form',
    ])->assertRedirect();

    expect($user->contacts()->where('email', 'ada@example.com')->count())->toBe(1);

    $contact = $user->contacts()->where('email', 'ada@example.com')->first();

    expect($contact->name)->toBe('Ada');
    expect(data_get($contact->metadata, 'submission_count'))->toBe(2);
    expect($funnel->fresh()->conversions)->toBe(2);
});

test('configurable form fields are preserved on each submission', function () {
    Mail::fake();

    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user);

    $this->post(route('funnels.leads.store', $funnel), [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'form_id' => 'qualification-form',
        'fields' => [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'company_size' => '11-50',
            'project_details' => 'We need a configurable lead funnel.',
            'utm_campaign' => 'summer-launch',
        ],
    ])->assertRedirect();

    $submission = $user->contacts()->firstOrFail()->submissions()->firstOrFail();

    expect($submission->form_id)->toBe('qualification-form')
        ->and($submission->fields)->toMatchArray([
            'company_size' => '11-50',
            'project_details' => 'We need a configurable lead funnel.',
            'utm_campaign' => 'summer-launch',
        ]);
});

test('configurable form field payloads are bounded', function () {
    $funnel = createLeadCaptureFunnelFor(User::factory()->create());

    $this->post(route('funnels.leads.store', $funnel), [
        'email' => 'ada@example.com',
        'fields' => ['notes' => str_repeat('a', 5001)],
    ])->assertSessionHasErrors('fields.notes');

    $this->assertDatabaseMissing('contacts', ['email' => 'ada@example.com']);
});

test('guests cannot submit leads to unpublished funnels', function () {
    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user, [
        'status' => 'draft',
        'is_published' => false,
        'published_at' => null,
    ]);

    $this->post(route('funnels.leads.store', $funnel), [
        'email' => 'lead@example.com',
    ])->assertForbidden();

    $this->assertDatabaseMissing('contacts', [
        'email' => 'lead@example.com',
    ]);
});

test('contacts page lists captured leads for the authenticated user', function () {
    Mail::fake();

    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user);

    $this->post(route('funnels.leads.store', $funnel), [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
    ])->assertRedirect();

    $this->withoutVite();

    $this->actingAs($user)
        ->get(route('contacts.index'))
        ->assertOk()
        ->assertSee('Ada Lovelace')
        ->assertSee('ada@example.com');
});

test('contact detail shows submissions and supports notes and status updates', function () {
    Mail::fake();

    $user = User::factory()->create();
    $funnel = createLeadCaptureFunnelFor($user);

    $this->post(route('funnels.leads.store', $funnel), [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'form_id' => 'demo-form',
        'fields' => ['email' => 'ada@example.com', 'plan' => 'pro'],
    ])->assertRedirect();

    $contact = $user->contacts()->where('email', 'ada@example.com')->firstOrFail();

    $this->withoutVite();

    $this->actingAs($user)
        ->get(route('contacts.show', $contact))
        ->assertOk()
        ->assertSee('Ada Lovelace')
        ->assertSee('demo-form')
        ->assertSee('pro');

    $this->actingAs($user)
        ->patch(route('contacts.update', $contact), ['status' => 'qualified'])
        ->assertRedirect();

    $this->actingAs($user)
        ->post(route('contacts.notes.store', $contact), ['note' => 'Follow up tomorrow.'])
        ->assertRedirect();

    $contact->refresh();

    expect($contact->status)->toBe('qualified');
    expect(data_get($contact->metadata, 'notes.0.body'))->toBe('Follow up tomorrow.');
});
