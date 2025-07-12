<?php

use App\Http\Controllers\FunnelController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::resource('funnels', FunnelController::class);
    Route::get('funnel-editor', [FunnelController::class, 'create'])->name('funnel-editor');
    Route::get('funnel-editor/{funnel}', [FunnelController::class, 'edit'])->name('funnel-editor.edit');
    Route::post('funnels/{funnel}/publish', [FunnelController::class, 'publish'])->name('funnels.publish');
    Route::post('funnels/{funnel}/unpublish', [FunnelController::class, 'unpublish'])->name('funnels.unpublish');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
