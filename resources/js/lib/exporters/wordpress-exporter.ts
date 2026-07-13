import type { Funnel } from '@/types/editor';
import type { Exporter } from './index';
import { countdownScript, escapeMarkup, portableStyles, renderPortableFunnel } from './portable-markup';

export class WordPressExporter implements Exporter {
    export(funnel: Funnel): string {
        return `<!-- wp:html -->
<style>${portableStyles}</style>
<main class="of-page" style="font-family:${escapeMarkup(funnel.settings.fontFamily || 'Inter, sans-serif')};background:${escapeMarkup(funnel.settings.backgroundColor)}">
${renderPortableFunnel(funnel, 'html')}
</main>
${countdownScript}
<!-- /wp:html -->`;
    }
}
