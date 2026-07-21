<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Models\FunnelVariant;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class FunnelVariantController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Funnel $funnel)
    {
        $this->authorize('update', $funnel);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'weight' => ['required', 'integer', 'min:1', 'max:100'],
            'content' => ['required', 'json'],
            'settings' => ['required', 'json'],
        ]);

        $funnel->variants()->create([
            ...$validated,
            'content' => json_decode($validated['content'], true),
            'settings' => json_decode($validated['settings'], true),
        ]);

        return back()->with('success', 'Experiment variant created.');
    }

    public function update(Request $request, Funnel $funnel, FunnelVariant $variant)
    {
        $this->authorize('update', $funnel);
        abort_unless($variant->funnel_id === $funnel->id, 404);
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'weight' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'content' => ['sometimes', 'json'],
            'settings' => ['sometimes', 'json'],
        ]);

        $nextActive = $validated['is_active'] ?? $variant->is_active;
        $nextWeight = $validated['weight'] ?? $variant->weight;
        $allocated = $funnel->variants()->whereKeyNot($variant->id)->where('is_active', true)->sum('weight');
        if ($nextActive && $allocated + $nextWeight > 100) {
            return back()->withErrors(['weight' => 'Active variant traffic cannot exceed 100%.']);
        }

        $variant->update([
            ...$validated,
            ...(isset($validated['content']) ? ['content' => json_decode($validated['content'], true)] : []),
            ...(isset($validated['settings']) ? ['settings' => json_decode($validated['settings'], true)] : []),
        ]);

        return back()->with('success', 'Experiment variant updated.');
    }

    public function destroy(Funnel $funnel, FunnelVariant $variant)
    {
        $this->authorize('update', $funnel);
        abort_unless($variant->funnel_id === $funnel->id, 404);
        $variant->delete();

        return back()->with('success', 'Experiment variant removed.');
    }
}
