<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FunnelAnalyticsController extends Controller
{
    public function store(Request $request, Funnel $funnel): JsonResponse
    {
        abort_unless($funnel->is_published || $request->user()?->can('update', $funnel), 404);

        $validated = $request->validate([
            'event_type' => ['required', Rule::in(['view', 'cta_click', 'form_start', 'form_step'])],
            'session_id' => ['nullable', 'uuid'],
            'form_id' => ['nullable', 'string', 'max:100'],
            'attribution' => ['nullable', 'array'],
            'attribution.*' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array', 'max:20'],
            'metadata.*' => ['nullable', 'string', 'max:500'],
        ]);

        $funnel->events()->create([
            ...$validated,
            'session_id' => isset($validated['session_id']) ? hash('sha256', $validated['session_id']) : null,
            'occurred_at' => now(),
        ]);

        return response()->json(['recorded' => true], 202);
    }
}
