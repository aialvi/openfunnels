<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => User::query()
    ->where('is_demo', true)
    ->where('demo_expires_at', '<=', now())
    ->eachById(fn (User $user) => $user->delete()))
    ->hourly()
    ->name('cleanup-expired-demo-users')
    ->withoutOverlapping();
