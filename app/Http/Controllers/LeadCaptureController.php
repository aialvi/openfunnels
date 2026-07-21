<?php

namespace App\Http\Controllers;

use App\Mail\NewLeadCaptured;
use App\Models\Contact;
use App\Models\Funnel;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class LeadCaptureController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Funnel $funnel)
    {
        if (! $funnel->is_published) {
            $this->authorize('update', $funnel);
        }

        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'form_id' => ['nullable', 'string', 'max:100'],
            'fields' => ['nullable', 'array', 'max:50'],
            'fields.*' => ['nullable', 'string', 'max:5000'],
            'attribution' => ['nullable', 'array'],
            'attribution.utm_source' => ['nullable', 'string', 'max:255'],
            'attribution.utm_medium' => ['nullable', 'string', 'max:255'],
            'attribution.utm_campaign' => ['nullable', 'string', 'max:255'],
            'attribution.utm_term' => ['nullable', 'string', 'max:255'],
            'attribution.utm_content' => ['nullable', 'string', 'max:255'],
            'attribution.referrer' => ['nullable', 'url', 'max:2000'],
            'session_id' => ['nullable', 'uuid'],
        ]);

        $email = strtolower($validated['email']);
        $contact = Contact::firstOrNew([
            'user_id' => $funnel->user_id,
            'email' => $email,
        ]);

        $metadata = $contact->metadata ?? [];
        $submissionCount = (int) data_get($metadata, 'submission_count', 0) + 1;

        $contact->fill([
            'funnel_id' => $funnel->id,
            'email' => $email,
            'name' => $validated['name'] ?? $contact->name,
            'phone' => $validated['phone'] ?? $contact->phone,
            'source' => 'funnel_form',
            'status' => $contact->status ?: 'new',
            'metadata' => [
                ...$metadata,
                'submission_count' => $submissionCount,
                'last_form_id' => $validated['form_id'] ?? null,
                'last_fields' => $validated['fields'] ?? [],
                'last_url' => $request->headers->get('referer'),
                'last_attribution' => $validated['attribution'] ?? [],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'last_submitted_at' => now(),
        ]);

        $contact->save();
        $submission = $contact->submissions()->create([
            'funnel_id' => $funnel->id,
            'form_id' => $validated['form_id'] ?? null,
            'fields' => $validated['fields'] ?? [],
            'attribution' => $validated['attribution'] ?? [],
            'source' => 'funnel_form',
            'url' => $request->headers->get('referer'),
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
        ]);

        $funnel->incrementConversions();
        $funnel->events()->create([
            'event_type' => 'conversion',
            'session_id' => isset($validated['session_id']) ? hash('sha256', $validated['session_id']) : null,
            'form_id' => $validated['form_id'] ?? null,
            'attribution' => $validated['attribution'] ?? [],
            'occurred_at' => now(),
        ]);
        $this->notifyLeadCaptured($contact, $funnel, $submission);

        return back()->with('success', 'Thanks. Your information was submitted.');
    }

    private function notifyLeadCaptured(Contact $contact, Funnel $funnel, \App\Models\ContactSubmission $submission): void
    {
        $recipient = config('services.lead_capture.notification_email') ?: $funnel->user->email;

        if ($recipient) {
            Mail::to($recipient)->send(new NewLeadCaptured($contact, $funnel, $submission));
        }

        $webhookUrl = config('services.lead_capture.webhook_url');

        if ($webhookUrl) {
            Http::timeout(5)->post($webhookUrl, [
                'event' => 'lead.captured',
                'contact' => [
                    'id' => $contact->id,
                    'email' => $contact->email,
                    'name' => $contact->name,
                    'phone' => $contact->phone,
                    'status' => $contact->status,
                ],
                'funnel' => [
                    'id' => $funnel->id,
                    'name' => $funnel->name,
                    'slug' => $funnel->slug,
                ],
                'submission' => [
                    'id' => $submission->id,
                    'form_id' => $submission->form_id,
                    'fields' => $submission->fields,
                    'url' => $submission->url,
                    'created_at' => $submission->created_at?->toISOString(),
                ],
            ]);
        }
    }
}
