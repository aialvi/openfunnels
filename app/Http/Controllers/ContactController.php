<?php

namespace App\Http\Controllers;

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
}
