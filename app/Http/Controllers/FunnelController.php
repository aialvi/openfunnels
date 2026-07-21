<?php

namespace App\Http\Controllers;

use App\Models\Funnel;
use App\Services\FunnelPublicUrlResolver;
use App\Services\FunnelVariantResolver;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FunnelController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FunnelPublicUrlResolver $publicUrlResolver,
        private readonly FunnelVariantResolver $variantResolver,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        $funnels = $user->funnels()
            ->with(['domains' => fn ($query) => $query->where('is_verified', true)->latest()])
            ->withCount('contactSubmissions')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Compute stats from the already-loaded collection — no extra queries.
        $stats = [
            'total_funnels' => $funnels->count(),
            'total_views' => $funnels->sum('views'),
            'total_conversions' => $funnels->sum('conversions'),
            'avg_conversion_rate' => $funnels->avg('conversion_rate') ?? 0,
        ];

        $funnelData = $funnels->map(function ($funnel) {
            return [
                'id' => $funnel->id,
                'name' => $funnel->name,
                'slug' => $funnel->slug,
                'status' => $funnel->status,
                'is_published' => $funnel->is_published,
                'views' => $funnel->views,
                'conversions' => $funnel->conversions,
                'response_count' => $funnel->contact_submissions_count,
                'conversion_rate' => $funnel->conversion_rate,
                'updated_at' => $funnel->updated_at->format('M j, Y'),
                'public_url' => $this->publicUrlResolver->resolve($funnel),
            ];
        });

        return Inertia::render('funnels', [
            'funnels' => $funnelData,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('enhanced-funnel-editor');
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

        // Generate unique slug
        $baseSlug = Str::slug($request->name);
        $slug = $baseSlug;
        $counter = 1;

        while (Funnel::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $funnel = auth()->user()->funnels()->create([
            'name' => $request->name,
            'slug' => $slug,
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
    public function show(Request $request, Funnel $funnel)
    {
        // Published funnels are publicly viewable; unpublished require ownership.
        if (! $funnel->is_published) {
            abort_unless(auth()->check(), 404);
            $this->authorize('view', $funnel);
        }

        $funnel->incrementViews();

        $assignment = $this->variantResolver->resolve($funnel, $request);

        Cookie::queue(cookie($assignment['cookie'], $assignment['value'], 60 * 24 * 30, '/', null, false, false, false, 'lax'));

        return Inertia::render('funnel-preview', [
            'funnel' => $this->serializeFunnel($funnel, $assignment['variant']),
            'previewMode' => false,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Funnel $funnel)
    {
        $this->authorize('update', $funnel);

        $funnel->load(['domains' => fn ($query) => $query->orderByDesc('created_at')]);
        $funnel->load(['variants' => fn ($query) => $query->withCount([
            'events as views_count' => fn ($events) => $events->where('event_type', 'view'),
            'events as conversions_count' => fn ($events) => $events->where('event_type', 'conversion'),
        ])->orderBy('id')]);

        return Inertia::render('enhanced-funnel-editor', [
            'funnel' => [
                'id' => $funnel->id,
                'name' => $funnel->name,
                'slug' => $funnel->slug,
                'description' => $funnel->description,
                'content' => $funnel->content,
                'settings' => $funnel->settings,
                'revision' => $funnel->revision,
                'updated_at' => $funnel->updated_at?->toISOString(),
                'status' => $funnel->status,
                'is_published' => $funnel->is_published,
                'domains' => $funnel->domains->map(fn ($domain) => [
                    'id' => $domain->id,
                    'domain' => $domain->domain,
                    'is_verified' => $domain->is_verified,
                    'ssl_status' => $domain->ssl_status,
                    'created_at' => $domain->created_at?->toISOString(),
                ]),
                'public_url' => $this->publicUrlResolver->resolve($funnel),
                'variants' => $funnel->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'name' => $variant->name,
                    'weight' => $variant->weight,
                    'is_active' => $variant->is_active,
                    'views' => $variant->views_count,
                    'conversions' => $variant->conversions_count,
                ]),
            ],
            'domainMapping' => [
                'cnameTarget' => config('services.domain_mapping.cname_target'),
                'aRecordIp' => config('services.domain_mapping.a_record_ip'),
            ],
        ]);
    }

    /**
     * Preview the funnel in a clean layout.
     */
    public function preview(Funnel $funnel)
    {
        $this->authorize('view', $funnel);

        return Inertia::render('funnel-preview', [
            'funnel' => $this->serializeFunnel($funnel),
            'previewMode' => true,
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

        // Generate unique slug if name changed
        $slug = $funnel->slug;
        if ($request->name !== $funnel->name) {
            $baseSlug = Str::slug($request->name);
            $slug = $baseSlug;
            $counter = 1;

            while (Funnel::query()->where('slug', $slug)->where('id', '!=', $funnel->id)->exists()) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }
        }

        $funnel->update([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'content' => $request->content ? json_decode($request->content, true) : $funnel->content,
            'settings' => $request->settings ? json_decode($request->settings, true) : $funnel->settings,
        ]);

        return back()->with('success', 'Funnel updated successfully!');
    }

    public function autosave(Request $request, Funnel $funnel): JsonResponse
    {
        $this->authorize('update', $funnel);

        $validated = $request->validate([
            'revision' => ['required', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'array'],
            'content.sections' => ['present', 'array', 'max:200'],
            'settings' => ['present', 'array'],
        ]);

        if ((int) $funnel->revision !== (int) $validated['revision']) {
            return response()->json([
                'message' => 'This funnel was updated in another session.',
                'revision' => $funnel->revision,
                'updated_at' => $funnel->updated_at?->toISOString(),
            ], 409);
        }

        $funnel->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'content' => $validated['content'],
            'settings' => $validated['settings'],
            'revision' => $funnel->revision + 1,
        ]);

        return response()->json([
            'revision' => $funnel->revision,
            'updated_at' => $funnel->updated_at?->toISOString(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Funnel $funnel)
    {
        $this->authorize('delete', $funnel);

        $funnel->delete();

        return redirect()->route('funnels.index')
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

    /**
     * Duplicate the funnel.
     */
    public function duplicate(Funnel $funnel)
    {
        $this->authorize('create', Funnel::class);

        $newFunnel = $funnel->replicate(['slug', 'views', 'conversions', 'conversion_rate', 'created_at', 'updated_at']);
        $newFunnel->name = $funnel->name.' (Copy)';
        $newFunnel->status = 'draft';
        $newFunnel->is_published = false;
        $newFunnel->published_at = null;
        $newFunnel->slug = Str::slug($newFunnel->name).'-'.Str::random(5);
        $newFunnel->save();

        return redirect()->route('funnels.index')
            ->with('success', 'Funnel duplicated successfully!');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeFunnel(Funnel $funnel, ?\App\Models\FunnelVariant $variant = null): array
    {
        return [
            'id' => $funnel->id,
            'name' => $funnel->name,
            'slug' => $funnel->slug,
            'description' => $funnel->description,
            'content' => $variant?->content ?? $funnel->content,
            'settings' => $variant?->settings ?? $funnel->settings,
            'variant_id' => $variant?->id,
            'revision' => $funnel->revision,
            'updated_at' => $funnel->updated_at?->toISOString(),
            'status' => $funnel->status,
            'is_published' => $funnel->is_published,
            'public_url' => $this->publicUrlResolver->resolve($funnel),
        ];
    }
}
