import type { Funnel } from '@/types/editor';
import type { Exporter } from './index';
import { countdownScript, escapeMarkup, portableStyles, renderPortableFunnel } from './portable-markup';

export class WooCommerceExporter implements Exporter {
    export(funnel: Funnel): string {
        const templateName = escapeMarkup(funnel.name).replace(/\*\//g, '* /');
        return `<?php
/**
 * OpenFunnels page template for a WooCommerce-compatible WordPress theme.
 * Copy to your child theme and select it as the page template.
 *
 * Template Name: ${templateName}
 */
defined('ABSPATH') || exit;
get_header();
?>
<style>${portableStyles}</style>
<main class="of-page" style="font-family:${escapeMarkup(funnel.settings.fontFamily || 'Inter, sans-serif')};background:${escapeMarkup(funnel.settings.backgroundColor)}">
${renderPortableFunnel(funnel, 'html')}
</main>
${countdownScript}
<?php get_footer(); ?>`;
    }
}
