<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $contacts = $request->user()
            ->contacts()
            ->with('funnel:id,name,slug')
            ->latest('last_submitted_at')
            ->latest()
            ->paginate(25)
            ->through(fn ($contact) => [
                'id' => $contact->id,
                'email' => $contact->email,
                'name' => $contact->name,
                'phone' => $contact->phone,
                'status' => $contact->status,
                'source' => $contact->source,
                'funnel' => $contact->funnel ? [
                    'id' => $contact->funnel->id,
                    'name' => $contact->funnel->name,
                    'slug' => $contact->funnel->slug,
                ] : null,
                'submission_count' => (int) data_get($contact->metadata, 'submission_count', 1),
                'last_submitted_at' => $contact->last_submitted_at?->format('M j, Y g:i A'),
                'created_at' => $contact->created_at->format('M j, Y'),
            ]);

        return Inertia::render('contacts', [
            'contacts' => $contacts,
            'stats' => [
                'total_contacts' => $request->user()->contacts()->count(),
                'new_contacts' => $request->user()->contacts()->where('status', 'new')->count(),
                'captured_today' => $request->user()->contacts()->whereDate('created_at', today())->count(),
            ],
        ]);
    }

    public function show(Request $request, Contact $contact)
    {
        abort_unless($contact->user_id === $request->user()->id, 403);

        $contact->load([
            'funnel:id,name,slug',
            'submissions' => fn ($query) => $query->with('funnel:id,name,slug')->latest(),
        ]);

        return Inertia::render('contact-detail', [
            'contact' => [
                'id' => $contact->id,
                'email' => $contact->email,
                'name' => $contact->name,
                'phone' => $contact->phone,
                'status' => $contact->status,
                'source' => $contact->source,
                'tags' => $contact->tags ?? [],
                'metadata' => $contact->metadata ?? [],
                'notes' => data_get($contact->metadata, 'notes', []),
                'funnel' => $contact->funnel ? [
                    'id' => $contact->funnel->id,
                    'name' => $contact->funnel->name,
                    'slug' => $contact->funnel->slug,
                ] : null,
                'ip_address' => $contact->ip_address,
                'user_agent' => $contact->user_agent,
                'last_submitted_at' => $contact->last_submitted_at?->format('M j, Y g:i A'),
                'created_at' => $contact->created_at->format('M j, Y g:i A'),
                'updated_at' => $contact->updated_at->format('M j, Y g:i A'),
                'submissions' => $contact->submissions->map(fn ($submission) => [
                    'id' => $submission->id,
                    'form_id' => $submission->form_id,
                    'fields' => $submission->fields ?? [],
                    'source' => $submission->source,
                    'url' => $submission->url,
                    'ip_address' => $submission->ip_address,
                    'user_agent' => $submission->user_agent,
                    'created_at' => $submission->created_at->format('M j, Y g:i A'),
                    'funnel' => $submission->funnel ? [
                        'id' => $submission->funnel->id,
                        'name' => $submission->funnel->name,
                        'slug' => $submission->funnel->slug,
                    ] : null,
                ]),
            ],
            'statusOptions' => ['new', 'contacted', 'qualified', 'won', 'lost'],
        ]);
    }

    public function update(Request $request, Contact $contact)
    {
        abort_unless($contact->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:new,contacted,qualified,won,lost'],
        ]);

        $contact->update($validated);

        return back()->with('success', 'Contact updated.');
    }

    public function storeNote(Request $request, Contact $contact)
    {
        abort_unless($contact->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $metadata = $contact->metadata ?? [];
        $notes = data_get($metadata, 'notes', []);
        $notes[] = [
            'id' => (string) str()->uuid(),
            'body' => $validated['note'],
            'created_at' => now()->toISOString(),
        ];

        data_set($metadata, 'notes', $notes);
        $contact->update(['metadata' => $metadata]);

        return back()->with('success', 'Note added.');
    }
}
