<?php

namespace App\Services\Ai;

use Illuminate\Support\Str;
use InvalidArgumentException;

class FunnelGenerationValidator
{
    private const ALLOWED_BLOCKS = ['text', 'image', 'button', 'form', 'testimonial', 'spacer', 'countdown', 'video'];

    /** @return array{content:array<string,mixed>,settings:array<string,mixed>} */
    public function validate(array $result): array
    {
        $sections = data_get($result, 'content.sections');
        if (! is_array($sections) || $sections === [] || count($sections) > 20) {
            throw new InvalidArgumentException('Generated funnels must contain between 1 and 20 sections.');
        }

        $normalized = array_map(fn (array $section) => $this->section($section), $sections);
        $settings = is_array($result['settings'] ?? null) ? $result['settings'] : [];

        return [
            'content' => ['sections' => $normalized],
            'settings' => [
                'backgroundColor' => $this->string($settings['backgroundColor'] ?? '#ffffff', 32),
                'maxWidth' => $this->string($settings['maxWidth'] ?? '1200px', 32),
                'fontFamily' => $this->string($settings['fontFamily'] ?? 'Inter, sans-serif', 100),
            ],
        ];
    }

    private function section(array $section): array
    {
        $columns = $section['columns'] ?? null;
        if (! is_array($columns) || $columns === [] || count($columns) > 4) {
            throw new InvalidArgumentException('Each generated section must contain between 1 and 4 columns.');
        }

        return [
            'id' => 'section-'.Str::uuid(),
            'type' => 'section',
            'layout' => in_array($section['layout'] ?? '', ['single', 'two-column', 'three-column', 'four-column'], true)
                ? $section['layout'] : 'single',
            'columns' => array_map(fn (array $column) => $this->column($column, count($columns)), $columns),
            'settings' => [
                'backgroundColor' => $this->string(data_get($section, 'settings.backgroundColor', 'transparent'), 32),
                'padding' => $this->string(data_get($section, 'settings.padding', '64px 24px'), 64),
                'margin' => $this->string(data_get($section, 'settings.margin', '0'), 64),
                'minHeight' => $this->string(data_get($section, 'settings.minHeight', 'auto'), 32),
                'fullWidth' => (bool) data_get($section, 'settings.fullWidth', false),
            ],
        ];
    }

    private function column(array $column, int $columnCount): array
    {
        $blocks = $column['blocks'] ?? [];
        if (! is_array($blocks) || count($blocks) > 20) {
            throw new InvalidArgumentException('Generated columns may contain at most 20 blocks.');
        }

        return [
            'id' => 'column-'.Str::uuid(),
            'type' => 'column',
            'width' => 100 / $columnCount,
            'blocks' => array_map(fn (array $block) => $this->block($block), $blocks),
            'settings' => ['padding' => '16px', 'backgroundColor' => 'transparent', 'verticalAlign' => 'top'],
        ];
    }

    private function block(array $block): array
    {
        $type = in_array($block['type'] ?? '', self::ALLOWED_BLOCKS, true) ? $block['type'] : 'text';
        $content = is_array($block['content'] ?? null) ? $block['content'] : [];
        array_walk_recursive($content, function (&$value): void {
            if (is_string($value)) {
                $value = $this->string($value, 5000);
            }
        });

        return [
            'id' => 'block-'.Str::uuid(),
            'type' => $type,
            'content' => $content,
            'settings' => ['padding' => '8px', 'margin' => '0', 'backgroundColor' => 'transparent', 'borderRadius' => '0'],
        ];
    }

    private function string(mixed $value, int $max): string
    {
        return Str::limit(is_scalar($value) ? (string) $value : '', $max, '');
    }
}
