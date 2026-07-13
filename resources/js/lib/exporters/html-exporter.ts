import type { Funnel } from '@/types/editor';
import type { Exporter } from './index';
import { countdownScript, escapeMarkup, portableStyles, renderPortableFunnel } from './portable-markup';

export class HtmlExporter implements Exporter {
    export(funnel: Funnel): string {
        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeMarkup(funnel.name)}</title>
    <meta name="description" content="${escapeMarkup(funnel.description || '')}">
    <style>${portableStyles}</style>
</head>
<body class="of-page" style="font-family:${escapeMarkup(funnel.settings.fontFamily || 'Inter, sans-serif')};background:${escapeMarkup(funnel.settings.backgroundColor)}">
<main>${renderPortableFunnel(funnel, 'html')}</main>
${countdownScript}
</body>
</html>`;
    }
}
