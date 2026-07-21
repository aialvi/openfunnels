<?php

namespace App\Services\Ai;

use App\Contracts\FunnelGenerator;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAICompatibleFunnelGenerator implements FunnelGenerator
{
    public function generate(array $brief): array
    {
        $response = Http::withToken((string) config('funnel-ai.api_key'))
            ->acceptJson()
            ->timeout((int) config('funnel-ai.timeout'))
            ->post((string) config('funnel-ai.endpoint'), [
                'model' => config('funnel-ai.model'),
                'instructions' => 'You design concise, accessible, high-converting funnel pages. Return only the requested JSON. Use only text, image, button, form, testimonial, spacer, countdown, and video blocks. Include a practical required email form.',
                'input' => json_encode($brief, JSON_THROW_ON_ERROR),
                'text' => [
                    'format' => [
                        'type' => 'json_schema',
                        'name' => 'openfunnels_page',
                        'strict' => false,
                        'schema' => [
                            'type' => 'object',
                            'required' => ['content', 'settings'],
                            'properties' => [
                                'content' => [
                                    'type' => 'object',
                                    'required' => ['sections'],
                                    'properties' => ['sections' => ['type' => 'array', 'maxItems' => 20]],
                                ],
                                'settings' => ['type' => 'object'],
                            ],
                        ],
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('The configured AI provider could not generate a funnel.');
        }

        $text = collect($response->json('output', []))
            ->flatMap(fn (array $item) => $item['content'] ?? [])
            ->first(fn (array $content) => isset($content['text']))['text'] ?? null;
        if (! is_string($text)) {
            throw new RuntimeException('The AI provider returned an empty response.');
        }

        $result = json_decode($text, true);
        if (! is_array($result)) {
            throw new RuntimeException('The AI provider returned invalid JSON.');
        }

        return $result;
    }
}
