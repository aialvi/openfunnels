<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Funnel;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

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
            'fields' => ['nullable', 'array'],
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
            ],
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'last_submitted_at' => now(),
        ]);

        $contact->save();
        $funnel->incrementConversions();

        return back()->with('success', 'Thanks. Your information was submitted.');
    }
}
