<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DemoController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        abort_unless(config('demo.enabled'), 404);

        if ($request->user() && ! $request->user()->is_demo) {
            return redirect()->route('dashboard');
        }
        if ($request->user()?->is_demo && $request->user()->demo_expires_at?->isFuture()) {
            return redirect()->route('funnel-editor.edit', $request->user()->funnels()->firstOrFail());
        }

        $user = User::create([
            'name' => 'Guest Creator',
            'email' => 'demo+'.Str::uuid().'@openfunnels.local',
            'password' => Str::random(48),
            'email_verified_at' => now(),
            'is_demo' => true,
            'demo_expires_at' => now()->addHours((int) config('demo.lifetime_hours')),
        ]);
        $funnel = $user->funnels()->create([
            'name' => 'SaaS Growth Audit',
            'slug' => 'demo-growth-audit-'.Str::lower(Str::random(10)),
            'description' => 'An editable demo funnel with a practical lead form.',
            'content' => $this->content(),
            'settings' => ['backgroundColor' => '#09090b', 'maxWidth' => '1200px', 'fontFamily' => 'Inter, sans-serif'],
        ]);
        $contact = $user->contacts()->create([
            'funnel_id' => $funnel->id,
            'email' => 'alex@example.com',
            'name' => 'Alex Morgan',
            'source' => 'funnel_form',
            'status' => 'qualified',
            'metadata' => ['submission_count' => 1, 'last_attribution' => ['utm_source' => 'community']],
            'last_submitted_at' => now()->subHour(),
        ]);
        $contact->submissions()->create([
            'funnel_id' => $funnel->id,
            'form_id' => 'audit-form',
            'fields' => ['email' => 'alex@example.com', 'company' => 'Acme Labs'],
            'attribution' => ['utm_source' => 'community'],
            'source' => 'funnel_form',
        ]);
        foreach (range(6, 0) as $daysAgo) {
            $funnel->events()->create([
                'event_type' => 'view',
                'session_id' => hash('sha256', 'demo-'.$daysAgo),
                'occurred_at' => now()->subDays($daysAgo),
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('funnel-editor.edit', $funnel);
    }

    private function content(): array
    {
        return ['sections' => [[
            'id' => 'demo-hero', 'type' => 'section', 'layout' => 'single',
            'settings' => ['backgroundColor' => '#111827', 'padding' => '80px 24px', 'margin' => '0', 'minHeight' => 'auto', 'fullWidth' => true],
            'columns' => [[
                'id' => 'demo-column', 'type' => 'column', 'width' => 100,
                'settings' => ['padding' => '16px', 'backgroundColor' => 'transparent', 'verticalAlign' => 'top'],
                'blocks' => [
                    ['id' => 'demo-title', 'type' => 'text', 'content' => ['text' => 'Find the leaks in your SaaS funnel', 'fontSize' => '48px', 'color' => '#ffffff', 'textAlign' => 'center', 'fontWeight' => '700'], 'settings' => ['padding' => '8px', 'margin' => '0', 'backgroundColor' => 'transparent', 'borderRadius' => '0']],
                    ['id' => 'audit-form', 'type' => 'form', 'content' => ['title' => 'Get your free growth audit', 'buttonText' => 'Request my audit', 'fields' => [
                        ['id' => 'name', 'name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => false],
                        ['id' => 'email', 'name' => 'email', 'label' => 'Work email', 'type' => 'email', 'required' => true],
                    ]], 'settings' => ['padding' => '24px', 'margin' => '32px auto 0', 'backgroundColor' => '#ffffff', 'borderRadius' => '12px']],
                ],
            ]],
        ]]];
    }
}
