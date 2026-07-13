import type { Funnel } from '@/types/editor';
import type { Exporter } from './index';
import { countdownScript, escapeMarkup, portableStyles, renderPortableFunnel } from './portable-markup';

export class ShopifyExporter implements Exporter {
    export(funnel: Funnel): string {
        return `<style>${portableStyles}</style>
<main class="of-page" style="font-family:${escapeMarkup(funnel.settings.fontFamily || 'Inter, sans-serif')};background:${escapeMarkup(funnel.settings.backgroundColor)}">
${renderPortableFunnel(funnel, 'html')}
</main>
${countdownScript}

{% schema %}
{
  "name": ${JSON.stringify(funnel.name.slice(0, 25) || 'OpenFunnels page')},
  "settings": [],
  "presets": [{ "name": ${JSON.stringify(funnel.name.slice(0, 25) || 'OpenFunnels page')} }]
}
{% endschema %}`;
    }
}
