<?php

use App\Http\Controllers\FunnelController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
