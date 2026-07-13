<?php

namespace App\Http\Controllers;

use App\Models\ContactSubmission;
use App\Models\Funnel;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FunnelResponseController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Funnel $funnel)
    {
        $this->authorize('view', $funnel);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:new,contacted,qualified,won,lost'],
            'form_id' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $responses = ContactSubmission::query()
            ->where('funnel_id', $funnel->id)
            ->with('contact:id,name,email,phone,status')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->whereHas('contact', function ($contactQuery) use ($search) {
                    $contactQuery->where(function ($searchQuery) use ($search) {
                        $searchQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
                });
            })
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->whereHas(
                'contact',
                fn ($contactQuery) => $contactQuery->where('status', $status)
            ))
            ->when($filters['form_id'] ?? null, fn ($query, $formId) => $query->where('form_id', $formId))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ContactSubmission $submission) => [
                'id' => $submission->id,
                'form_id' => $submission->form_id,
                'fields' => $submission->fields ?? [],
                'source' => $submission->source,
                'url' => $submission->url,
                'ip_address' => $submission->ip_address,
                'user_agent' => $submission->user_agent,
                'created_at' => $submission->created_at->format('M j, Y g:i A'),
                'contact' => [
                    'id' => $submission->contact->id,
                    'name' => $submission->contact->name,
                    'email' => $submission->contact->email,
                    'phone' => $submission->contact->phone,
                    'status' => $submission->contact->status,
                ],
            ]);

        $submissionQuery = $funnel->contactSubmissions();

        return Inertia::render('funnel-responses', [
            'funnel' => [
                'id' => $funnel->id,
                'name' => $funnel->name,
                'slug' => $funnel->slug,
                'is_published' => $funnel->is_published,
            ],
            'responses' => $responses,
            'stats' => [
                'total_responses' => (clone $submissionQuery)->count(),
                'unique_leads' => (clone $submissionQuery)->distinct()->count('contact_id'),
                'responses_today' => (clone $submissionQuery)->whereDate('created_at', today())->count(),
            ],
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'form_id' => $filters['form_id'] ?? '',
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
            ],
            'filterOptions' => [
                'statuses' => ['new', 'contacted', 'qualified', 'won', 'lost'],
                'forms' => $funnel->contactSubmissions()
                    ->whereNotNull('form_id')
                    ->where('form_id', '!=', '')
                    ->distinct()
                    ->orderBy('form_id')
                    ->pluck('form_id'),
            ],
        ]);
    }
}
