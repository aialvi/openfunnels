<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictDemoAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user?->is_demo) {
            return $next($request);
        }

        if ($user->demo_expires_at?->isPast()) {
            auth()->logout();
            $request->session()->invalidate();

            return redirect()->route('home')->withErrors(['demo' => 'This demo session expired. Start a fresh sandbox to continue.']);
        }

        $blocked = [
            'domains.store', 'domains.verify', 'domains.destroy',
            'funnels.publish', 'funnels.unpublish', 'funnels.generate',
            'profile.update', 'profile.destroy', 'password.update',
        ];

        if ($request->routeIs($blocked)) {
            abort(403, 'This action is disabled in the guest sandbox.');
        }

        return $next($request);
    }
}
