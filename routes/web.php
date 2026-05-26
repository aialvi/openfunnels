<?php

use App\Http\Controllers\FunnelController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$appDomain = parse_url(config('app.url'), PHP_URL_HOST) ?? 'localhost';

Route::domain($appDomain)->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    // Public funnel view — accessible without authentication.
    // Published funnels are open to all; unpublished funnels require ownership (enforced in controller).
    Route::get('/f/{funnel:slug}', [FunnelController::class, 'show'])->name('funnels.show');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        // Exclude 'show' — it is handled by the public route above.
        Route::resource('funnels', FunnelController::class)->except(['show']);
        Route::get('funnel-editor', [FunnelController::class, 'create'])->name('funnel-editor');
        Route::get('funnel-editor/{funnel}', [FunnelController::class, 'edit'])->name('funnel-editor.edit');
        Route::get('funnel/{funnel}/preview', [FunnelController::class, 'preview'])->name('funnel.preview');
        Route::post('funnels/{funnel}/publish', [FunnelController::class, 'publish'])->name('funnels.publish');
        Route::post('funnels/{funnel}/unpublish', [FunnelController::class, 'unpublish'])->name('funnels.unpublish');
        Route::post('funnels/{funnel}/duplicate', [FunnelController::class, 'duplicate'])->name('funnels.duplicate');

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

    return Inertia::render('funnel-preview', [
        'funnel' => [
            'id' => $domain->funnel->id,
            'name' => $domain->funnel->name,
            'slug' => $domain->funnel->slug,
            'description' => $domain->funnel->description,
            'content' => $domain->funnel->content,
            'settings' => $domain->funnel->settings,
            'status' => $domain->funnel->status,
            'is_published' => $domain->funnel->is_published,
        ],
    ]);
});
