<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\FunnelAnalyticsController;
use App\Http\Controllers\FunnelController;
use App\Http\Controllers\FunnelGenerationController;
use App\Http\Controllers\FunnelResponseController;
use App\Http\Controllers\FunnelVariantController;
use App\Http\Controllers\LeadCaptureController;
use App\Models\FunnelEvent;
use App\Services\FunnelPublicUrlResolver;
use App\Services\FunnelVariantResolver;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$appDomain = parse_url(config('app.url'), PHP_URL_HOST) ?? 'localhost';

Route::post('funnels/{funnel}/leads', [LeadCaptureController::class, 'store'])->name('funnels.leads.store');
Route::post('funnels/{funnel}/events', [FunnelAnalyticsController::class, 'store'])
    ->middleware('throttle:120,1')
    ->name('funnels.events.store');

Route::domain($appDomain)->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    // Public funnel view — accessible without authentication.
    // Published funnels are open to all; unpublished funnels require ownership (enforced in controller).
    Route::get('/f/{funnel:slug}', [FunnelController::class, 'show'])->name('funnels.show');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            $user = auth()->user();
            $funnels = $user->funnels();

            $events = FunnelEvent::query()
                ->whereIn('funnel_id', (clone $funnels)->select('id'))
                ->where('occurred_at', '>=', now()->subDays(13)->startOfDay())
                ->get(['event_type', 'attribution', 'occurred_at']);
            $daily = collect(range(13, 0))->map(function (int $daysAgo) use ($events) {
                $date = now()->subDays($daysAgo)->toDateString();
                $dayEvents = $events->filter(fn (FunnelEvent $event) => $event->occurred_at->toDateString() === $date);

                return [
                    'date' => $date,
                    'views' => $dayEvents->where('event_type', 'view')->count(),
                    'conversions' => $dayEvents->where('event_type', 'conversion')->count(),
                ];
            });
            $sources = $events
                ->filter(fn (FunnelEvent $event) => $event->event_type === 'conversion')
                ->countBy(fn (FunnelEvent $event) => data_get($event->attribution, 'utm_source', 'Direct'))
                ->sortDesc()
                ->take(5)
                ->map(fn (int $conversions, string $source) => compact('source', 'conversions'))
                ->values();

            return Inertia::render('dashboard', [
                'stats' => [
                    'total_funnels' => (clone $funnels)->count(),
                    'total_views' => (clone $funnels)->sum('views'),
                    'total_conversions' => (clone $funnels)->sum('conversions'),
                    'total_contacts' => $user->contacts()->count(),
                ],
                'recentContacts' => $user->contacts()
                    ->with('funnel:id,name')
                    ->latest('last_submitted_at')
                    ->limit(5)
                    ->get()
                    ->map(fn ($contact) => [
                        'id' => $contact->id,
                        'email' => $contact->email,
                        'name' => $contact->name,
                        'funnel' => $contact->funnel?->name,
                        'last_submitted_at' => $contact->last_submitted_at?->diffForHumans(),
                    ]),
                'analytics' => [
                    'daily' => $daily,
                    'sources' => $sources,
                ],
            ]);
        })->name('dashboard');

        // Exclude 'show' — it is handled by the public route above.
        Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
        Route::get('contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
        Route::patch('contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
        Route::post('contacts/{contact}/notes', [ContactController::class, 'storeNote'])->name('contacts.notes.store');
        Route::resource('funnels', FunnelController::class)->except(['show']);
        Route::put('funnels/{funnel}/autosave', [FunnelController::class, 'autosave'])->name('funnels.autosave');
        Route::get('funnels/{funnel}/responses', [FunnelResponseController::class, 'index'])->name('funnels.responses');
        Route::get('funnel-editor', [FunnelController::class, 'create'])->name('funnel-editor');
        Route::post('funnels/generate', FunnelGenerationController::class)->middleware('throttle:10,1')->name('funnels.generate');
        Route::get('funnel-editor/{funnel}', [FunnelController::class, 'edit'])->name('funnel-editor.edit');
        Route::get('funnel/{funnel}/preview', [FunnelController::class, 'preview'])->name('funnel.preview');
        Route::post('funnels/{funnel}/publish', [FunnelController::class, 'publish'])->name('funnels.publish');
        Route::post('funnels/{funnel}/unpublish', [FunnelController::class, 'unpublish'])->name('funnels.unpublish');
        Route::post('funnels/{funnel}/duplicate', [FunnelController::class, 'duplicate'])->name('funnels.duplicate');
        Route::post('funnels/{funnel}/variants', [FunnelVariantController::class, 'store'])->name('funnels.variants.store');
        Route::patch('funnels/{funnel}/variants/{variant}', [FunnelVariantController::class, 'update'])->name('funnels.variants.update');
        Route::delete('funnels/{funnel}/variants/{variant}', [FunnelVariantController::class, 'destroy'])->name('funnels.variants.destroy');

        // Domain Mapping routes
        Route::post('funnels/{funnel}/domains', [\App\Http\Controllers\DomainController::class, 'store'])->name('domains.store');
        Route::post('funnels/{funnel}/domains/{domain}/verify', [\App\Http\Controllers\DomainController::class, 'verify'])->name('domains.verify');
        Route::delete('domains/{domain}', [\App\Http\Controllers\DomainController::class, 'destroy'])->name('domains.destroy');
    });

    require __DIR__.'/settings.php';
    require __DIR__.'/auth.php';
});

// Custom Domain Fallback Route
Route::fallback(function (\Illuminate\Http\Request $request) {
    $host = $request->getHost();

    $domain = \App\Models\Domain::with('funnel')
        ->where('domain', $host)
        ->where('is_verified', true)
        ->first();

    if (! $domain || ! $domain->funnel || ! $domain->funnel->is_published) {
        abort(404, 'Funnel not found or domain not mapped.');
    }

    $domain->funnel->incrementViews();

    $assignment = app(FunnelVariantResolver::class)->resolve($domain->funnel, $request);
    $variant = $assignment['variant'];
    \Illuminate\Support\Facades\Cookie::queue(
        cookie($assignment['cookie'], $assignment['value'], 60 * 24 * 30, '/', null, false, false, false, 'lax'),
    );

    return Inertia::render('funnel-preview', [
        'funnel' => [
            'id' => $domain->funnel->id,
            'name' => $domain->funnel->name,
            'slug' => $domain->funnel->slug,
            'description' => $domain->funnel->description,
            'content' => $variant?->content ?? $domain->funnel->content,
            'settings' => $variant?->settings ?? $domain->funnel->settings,
            'variant_id' => $variant?->id,
            'status' => $domain->funnel->status,
            'is_published' => $domain->funnel->is_published,
            'public_url' => app(FunnelPublicUrlResolver::class)->resolve($domain->funnel),
        ],
        'previewMode' => false,
    ]);
});
