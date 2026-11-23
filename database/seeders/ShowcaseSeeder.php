<?php

namespace Database\Seeders;

use App\Models\AutomationEvent;
use App\Models\AutomationRun;
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\FunnelEvent;
use App\Models\User;
use App\Services\Automation\WorkflowPublisher;
use App\Services\Automation\WorkflowRecipes;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Fictional workspace for README captures and the demo video.
 *
 * Re-running replaces only the showcase account. Everything is dated relative
 * to now, and the shape of the data is deterministic.
 */
class ShowcaseSeeder extends Seeder
{
    public const EMAIL = 'showcase@example.com';

    public const PASSWORD = 'showcase-password';

    public function run(WorkflowRecipes $recipes, WorkflowPublisher $publisher): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('The showcase seeder only runs in local and testing environments.');
        }

        mt_srand(20);
        User::where('email', self::EMAIL)->first()?->delete();

        $user = User::create([
            'name' => 'Jamie Rivera',
            'email' => self::EMAIL,
            'password' => Hash::make(self::PASSWORD),
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        $funnels = $this->funnels($user);
        $contacts = $this->contacts($user, $funnels);
        $this->views($funnels);
        $this->experiment($funnels[0]);
        $this->opportunities($user, $contacts);
        $this->automations($user, $contacts, $recipes, $publisher);
    }

    /** @return list<Funnel> */
    private function funnels(User $user): array
    {
        $definitions = [
            ['Growth Workshop', 'growth-workshop', 'Live workshop registration with a qualifying form.', true, 21],
            ['Free Funnel Checklist', 'free-funnel-checklist', 'Lead magnet with email delivery.', true, 16],
            ['Book a Strategy Call', 'book-a-strategy-call', 'Consultation requests for qualified teams.', true, 12],
            ['Early Access Waitlist', 'early-access-waitlist', 'Pre-launch waitlist for the next cohort.', false, 2],
        ];

        return array_map(fn (array $row) => $user->funnels()->create([
            'name' => $row[0],
            'slug' => "showcase-{$row[1]}",
            'description' => $row[2],
            'content' => $this->page($row[0]),
            'settings' => ['backgroundColor' => '#ffffff', 'maxWidth' => '1200px', 'fontFamily' => 'Inter, sans-serif'],
            'is_published' => $row[3],
            'status' => $row[3] ? 'published' : 'draft',
            'published_at' => $row[3] ? now()->subDays($row[4]) : null,
            'created_at' => now()->subDays($row[4] + 2),
        ]), $definitions);
    }

    /**
     * @param  list<Funnel>  $funnels
     * @return list<Contact>
     */
    private function contacts(User $user, array $funnels): array
    {
        $first = ['Ava', 'Noah', 'Priya', 'Liam', 'Sofia', 'Mateo', 'Hana', 'Omar', 'Chloe', 'Ethan', 'Zara', 'Lucas', 'Maya', 'Felix', 'Nadia', 'Theo'];
        $last = ['Bennett', 'Carter', 'Nair', 'Okafor', 'Rossi', 'Alvarez', 'Sato', 'Haddad', 'Dubois', 'Walsh', 'Khan', 'Meyer', 'Torres'];
        $companies = ['Northwind Studio', 'Brightloop', 'Harbor & Pine', 'Fieldnote', 'Cobalt Health', 'Juniper Labs', 'Atlas Freight', 'Papertrail'];
        $sources = ['google', 'newsletter', 'linkedin', 'google', 'partner', null, 'newsletter', 'google'];
        $statuses = ['new', 'new', 'contacted', 'qualified', 'contacted', 'won', 'qualified', 'new', 'lost'];
        $contacts = [];

        for ($i = 0; $i < 96; $i++) {
            $funnel = $funnels[[0, 0, 1, 0, 2, 1][$i % 6]];
            // Newest first, denser toward today so the trend rises.
            $at = now()->subMinutes(14 + (int) (19000 * ($i / 96) ** 1.5) + mt_rand(0, 40));
            $name = $first[$i % 16].' '.$last[($i * 5 + intdiv($i, 16)) % 13];
            $company = $companies[($i * 3) % 8];
            $email = Str::of($name)->lower()->replace(' ', '.').($i >= 60 ? $i : '').'@example.com';
            $attribution = $sources[$i % 8] ? ['utm_source' => $sources[$i % 8], 'utm_medium' => 'referral'] : [];

            $contact = $user->contacts()->create([
                'funnel_id' => $funnel->id,
                'email' => (string) $email,
                'name' => $name,
                'source' => 'funnel_form',
                'status' => $i < 3 ? 'new' : $statuses[$i % 9],
                'metadata' => ['submission_count' => 1, 'last_attribution' => $attribution],
                'last_submitted_at' => $at,
            ]);
            $contact->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
            $submission = $contact->submissions()->make([
                'funnel_id' => $funnel->id,
                'form_id' => 'workshop-form',
                'fields' => ['name' => $name, 'email' => (string) $email, 'company' => $company],
                'attribution' => $attribution,
                'source' => 'funnel_form',
            ]);
            $submission->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
            $funnel->events()->create([
                'event_type' => 'conversion',
                'session_id' => hash('sha256', "showcase-conversion-$i"),
                'form_id' => 'workshop-form',
                'attribution' => $attribution,
                'occurred_at' => $at,
            ]);
            $contacts[] = $contact;
        }

        return $contacts;
    }

    /** @param list<Funnel> $funnels */
    private function views(array $funnels): void
    {
        foreach ([0 => 1.0, 1 => 0.55, 2 => 0.35] as $index => $share) {
            $rows = [];
            for ($day = 13; $day >= 0; $day--) {
                $count = (int) round((30 + (13 - $day) * 5 + mt_rand(-8, 10)) * $share);
                for ($n = 0; $n < $count; $n++) {
                    $at = now()->subDays($day)->startOfDay()->addMinutes(mt_rand(0, $day === 0 ? max(1, (int) now()->startOfDay()->diffInMinutes(now())) : 1439));
                    $rows[] = [
                        'funnel_id' => $funnels[$index]->id,
                        'event_type' => 'view',
                        'session_id' => hash('sha256', "showcase-$index-$day-$n"),
                        'occurred_at' => $at,
                        'created_at' => $at,
                        'updated_at' => $at,
                    ];
                }
            }
            foreach (array_chunk($rows, 100) as $chunk) {
                FunnelEvent::insert($chunk);
            }
        }

        foreach ($funnels as $funnel) {
            $views = $funnel->events()->where('event_type', 'view')->count();
            $conversions = $funnel->events()->where('event_type', 'conversion')->count();
            $funnel->update([
                'views' => $views,
                'conversions' => $conversions,
                'conversion_rate' => $views ? round($conversions / $views * 100, 2) : 0,
            ]);
        }
    }

    private function experiment(Funnel $funnel): void
    {
        $content = $funnel->content;
        $content['sections'][0]['columns'][0]['blocks'][1]['content']['text'] = 'Fill your calendar with qualified calls';
        $variant = $funnel->variants()->create([
            'name' => 'Outcome headline',
            'content' => $content,
            'settings' => $funnel->settings,
            'weight' => 50,
            'is_active' => true,
        ]);

        // Attribute half the traffic, and slightly more of the conversions, to the variant.
        $views = $funnel->events()->where('event_type', 'view')->orderBy('id')->pluck('id');
        $conversions = $funnel->events()->where('event_type', 'conversion')->orderBy('id')->pluck('id');
        $ids = $views->filter(fn ($id, $index) => $index % 2 === 0)->merge($conversions->take(27));
        foreach ($ids->chunk(200) as $chunk) {
            $funnel->events()->whereIn('id', $chunk)->update(['variant_id' => $variant->id]);
        }
    }

    /** @param list<Contact> $contacts */
    private function opportunities(User $user, array $contacts): void
    {
        $pipeline = $user->pipelines()->create(['name' => 'Growth Sales', 'currency' => 'USD']);
        $pipeline->stages()->createMany([
            ['name' => 'New Lead', 'position' => 0, 'probability' => 10],
            ['name' => 'Contacted', 'position' => 1, 'probability' => 25],
            ['name' => 'Qualified', 'position' => 2, 'probability' => 50],
            ['name' => 'Proposal', 'position' => 3, 'probability' => 75],
        ]);
        $stages = $pipeline->stages()->get();
        $deals = [
            [0, 'Northwind Studio workshop', 1800], [0, 'Brightloop onboarding', 2400], [0, 'Papertrail audit', 950],
            [1, 'Cobalt Health landing pages', 5200], [1, 'Fieldnote retainer', 3600],
            [2, 'Atlas Freight lead program', 8400], [2, 'Harbor & Pine launch', 4750], [2, 'Juniper Labs waitlist', 2900],
            [3, 'Lumen Dental rollout', 12500], [3, 'Oakline Realty funnels', 6800],
            [3, 'Verity Coaching cohort', 7200, 'won'], [3, 'Summit Cycles relaunch', 9800, 'won'], [1, 'Delta Print refresh', 2100, 'lost'],
        ];

        foreach ($deals as $index => $deal) {
            $status = $deal[3] ?? 'open';
            $opportunity = $user->opportunities()->create([
                'pipeline_id' => $pipeline->id,
                'pipeline_stage_id' => $stages[$deal[0]]->id,
                'contact_id' => $contacts[$index + 3]->id,
                'funnel_id' => $contacts[$index + 3]->funnel_id,
                'title' => $deal[1],
                'value_cents' => $deal[2] * 100,
                'status' => $status,
                'source' => 'funnel_form',
                'expected_close_date' => now()->addDays(6 + $index * 3)->toDateString(),
                'stage_changed_at' => now()->subDays(1 + $index % 4),
                'closed_at' => $status === 'open' ? null : now()->subDays(2),
            ]);
            $opportunity->recordActivity('created', ['source' => 'showcase', 'stage_name' => $stages[$deal[0]]->name], $user->id);
        }
    }

    /** @param list<Contact> $contacts */
    private function automations(User $user, array $contacts, WorkflowRecipes $recipes, WorkflowPublisher $publisher): void
    {
        foreach (['won-thank-you', 'qualified-follow-up', 'new-lead-welcome', 'high-value-alert'] as $key) {
            $recipe = $recipes->get($key);
            $workflow = $user->automationWorkflows()->create([
                'name' => $recipe['name'],
                'description' => $recipe['description'],
                'status' => 'draft',
                'enrollment_policy' => 'every_event',
                'draft_definition' => $recipe['definition'],
                'revision' => 1,
            ]);
            $version = $publisher->publish($workflow);

            if ($key !== 'new-lead-welcome') {
                continue;
            }

            foreach (array_slice($contacts, 0, 48) as $index => $contact) {
                $submission = $contact->submissions()->first();
                $done = $contact->last_submitted_at->lt(now()->subDay());
                $at = $contact->last_submitted_at;
                $event = AutomationEvent::create([
                    'user_id' => $user->id,
                    'event_type' => 'funnel.form_submitted',
                    'contact_id' => $contact->id,
                    'funnel_id' => $contact->funnel_id,
                    'submission_id' => $submission->id,
                    'payload' => ['is_new_contact' => true],
                    'status' => 'processed',
                    'available_at' => $at,
                    'processed_at' => $at,
                ]);
                $nodes = collect($version->definition['nodes'])->keyBy('type');
                $run = AutomationRun::create([
                    'user_id' => $user->id,
                    'workflow_id' => $workflow->id,
                    'workflow_version_id' => $version->id,
                    'automation_event_id' => $event->id,
                    'contact_id' => $contact->id,
                    'funnel_id' => $contact->funnel_id,
                    'submission_id' => $submission->id,
                    'status' => $done ? 'completed' : 'waiting',
                    'current_node_id' => $done ? null : $nodes['wait']['id'],
                    'context' => ['contact' => ['id' => $contact->id, 'name' => $contact->name, 'email' => $contact->email]],
                    'started_at' => $at,
                    'next_resume_at' => $done ? null : $at->copy()->addDay(),
                    'finished_at' => $done ? $at->copy()->addDay() : null,
                ]);
                $run->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
                $run->steps()->create([
                    'node_id' => $nodes['send_email']['id'],
                    'node_type' => 'send_email',
                    'status' => 'completed',
                    'attempt' => 1,
                    'started_at' => $at,
                    'finished_at' => $at->copy()->addSecond(),
                    'output_summary' => ['next_node_id' => $nodes['send_email']['next_node_id']],
                    'idempotency_key' => hash('sha256', "{$run->id}:{$nodes['send_email']['id']}"),
                ]);
            }
        }
    }

    private function page(string $name): array
    {
        $copy = [
            'Growth Workshop' => ['Live workshop', 'Turn cold traffic into booked calls', 'A practical 45-minute session on offers, forms, and follow-up.', 'Reserve your seat', 'Save my seat'],
            'Free Funnel Checklist' => ['Free checklist', 'Seven fixes for a leaky funnel', 'The short list we run through before every launch.', 'Get the checklist', 'Send it to me'],
            'Book a Strategy Call' => ['Strategy call', 'Plan your next launch with us', 'Thirty minutes, one clear next step, no slides.', 'Request a call', 'Find a time'],
            'Early Access Waitlist' => ['Early access', 'Be first into the next cohort', 'Join the waitlist and help shape what ships.', 'Join the waitlist', 'Count me in'],
        ][$name];
        $text = fn (string $id, string $value, string $size, string $color, string $weight = '400', string $align = 'left') => [
            'id' => $id, 'type' => 'text',
            'content' => ['text' => $value, 'fontSize' => $size, 'color' => $color, 'fontWeight' => $weight, 'textAlign' => $align, 'lineHeight' => (int) $size > 30 ? '1.12' : '1.5'],
            'settings' => ['padding' => '8px', 'margin' => '0px', 'backgroundColor' => 'transparent', 'borderRadius' => '0px'],
        ];
        $column = fn (string $id, float $width, array $blocks) => [
            'id' => $id, 'type' => 'column', 'width' => $width, 'blocks' => $blocks,
            'settings' => ['padding' => '12px', 'backgroundColor' => 'transparent', 'verticalAlign' => 'middle'],
        ];
        $section = fn (string $id, string $layout, array $columns, string $background, string $padding) => [
            'id' => $id, 'type' => 'section', 'layout' => $layout, 'columns' => $columns,
            'settings' => ['backgroundColor' => $background, 'padding' => $padding, 'margin' => '0px', 'minHeight' => 'auto', 'fullWidth' => false],
        ];

        return ['sections' => [
            $section('hero', 'two-column', [
                $column('hero-copy', 55, [
                    $text('hero-eyebrow', $copy[0], '15px', '#ea580c', '700'),
                    $text('hero-headline', $copy[1], '46px', '#111827', '800'),
                    $text('hero-subhead', $copy[2], '19px', '#4b5563'),
                ]),
                $column('hero-form', 45, [[
                    'id' => 'workshop-form', 'type' => 'form',
                    'content' => ['title' => $copy[3], 'buttonText' => $copy[4], 'successMessage' => "You're in. Check your inbox for the details.", 'fields' => [
                        ['id' => 'name', 'name' => 'name', 'label' => 'Name', 'type' => 'text', 'placeholder' => 'Full name', 'required' => false],
                        ['id' => 'email', 'name' => 'email', 'label' => 'Work email', 'type' => 'email', 'placeholder' => 'you@company.com', 'required' => true],
                        ['id' => 'company', 'name' => 'company', 'label' => 'Company', 'type' => 'text', 'placeholder' => 'Company name', 'required' => false],
                    ]],
                    'settings' => ['padding' => '28px', 'margin' => '0px', 'backgroundColor' => '#fff7ed', 'borderRadius' => '14px'],
                ]]),
            ], '#ffffff', '72px 48px'),
            $section('outcomes', 'three-column', [
                $column('outcome-1', 33.33, [$text('outcome-1-text', 'Sharpen the offer', '20px', '#ffffff', '700', 'center')]),
                $column('outcome-2', 33.33, [$text('outcome-2-text', 'Capture better leads', '20px', '#ffffff', '700', 'center')]),
                $column('outcome-3', 33.33, [$text('outcome-3-text', 'Follow up on time', '20px', '#ffffff', '700', 'center')]),
            ], '#111827', '40px 48px'),
        ]];
    }
}
