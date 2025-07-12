<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class FunnelController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        $funnels = $user->funnels()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($funnel) {
                return [
                    'id' => $funnel->id,
                    'name' => $funnel->name,
                    'slug' => $funnel->slug,
                    'status' => $funnel->status,
                    'is_published' => $funnel->is_published,
                    'views' => $funnel->views,
                    'conversions' => $funnel->conversions,
                    'conversion_rate' => $funnel->conversion_rate,
                    'updated_at' => $funnel->updated_at->format('M j, Y'),
                ];
            });

        $stats = [
            'total_funnels' => $user->funnels()->count(),
            'total_views' => $user->funnels()->sum('views'),
            'total_conversions' => $user->funnels()->sum('conversions'),
            'avg_conversion_rate' => $user->funnels()->avg('conversion_rate') ?? 0,
        ];

        return Inertia::render('funnels', [
            'funnels' => $funnels,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('funnel-editor');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'content' => 'nullable|json',
            'settings' => 'nullable|json',
        ]);

        $funnel = auth()->user()->funnels()->create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'content' => $request->content ? json_decode($request->content, true) : [],
            'settings' => $request->settings ? json_decode($request->settings, true) : [],
        ]);

        return redirect()->route('funnel-editor.edit', $funnel->id)
            ->with('success', 'Funnel created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Funnel $funnel)
    {
        $this->authorize('view', $funnel);
        
        $funnel->incrementViews();

        return view('funnel.show', compact('funnel'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Funnel $funnel)
    {
        $this->authorize('update', $funnel);

        return Inertia::render('funnel-editor', [
            'funnel' => [
                'id' => $funnel->id,
                'name' => $funnel->name,
                'slug' => $funnel->slug,
                'description' => $funnel->description,
                'content' => $funnel->content,
                'settings' => $funnel->settings,
                'status' => $funnel->status,
                'is_published' => $funnel->is_published,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Funnel $funnel)
    {
        $this->authorize('update', $funnel);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'content' => 'nullable|json',
            'settings' => 'nullable|json',
        ]);

        $funnel->update([
            'name' => $request->name,
            'description' => $request->description,
            'content' => $request->content ? json_decode($request->content, true) : $funnel->content,
            'settings' => $request->settings ? json_decode($request->settings, true) : $funnel->settings,
        ]);

        return back()->with('success', 'Funnel updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Funnel $funnel)
    {
        $this->authorize('delete', $funnel);

        $funnel->delete();

        return redirect()->route('funnels')
            ->with('success', 'Funnel deleted successfully!');
    }

    /**
     * Publish the funnel.
     */
    public function publish(Funnel $funnel)
    {
        $this->authorize('update', $funnel);

        $funnel->publish();

        return back()->with('success', 'Funnel published successfully!');
    }

    /**
     * Unpublish the funnel.
     */
    public function unpublish(Funnel $funnel)
    {
        $this->authorize('update', $funnel);

        $funnel->unpublish();

        return back()->with('success', 'Funnel unpublished successfully!');
    }
}
