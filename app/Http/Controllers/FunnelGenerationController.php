<?php

namespace App\Http\Controllers;

use App\Contracts\FunnelGenerator;
use App\Services\Ai\FunnelGenerationValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class FunnelGenerationController extends Controller
{
    public function __invoke(Request $request, FunnelGenerator $generator, FunnelGenerationValidator $validator): JsonResponse
    {
        $brief = $request->validate([
            'goal' => ['required', 'string', 'max:100'],
            'business' => ['required', 'string', 'max:500'],
            'audience' => ['required', 'string', 'max:500'],
            'offer' => ['required', 'string', 'max:1000'],
            'tone' => ['required', 'string', 'max:100'],
        ]);

        try {
            return response()->json($validator->validate($generator->generate($brief)));
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], config('funnel-ai.driver') === 'disabled' ? 503 : 502);
        }
    }
}
