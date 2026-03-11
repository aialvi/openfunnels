import { Funnel, Section, Column, Block } from '@/stores/funnelStore';
import { Exporter } from './index';

export class WordPressExporter implements Exporter {
    export(funnel: Funnel): string {
        // WordPress posts are essentially a list of blocks.
        // We will wrap sections in Group blocks.
        return funnel.content.sections.map(section => this.renderSection(section)).join('\n\n');
    }

    private renderSection(section: Section): string {
        const columnsHtml = section.columns.map(column => this.renderColumn(column)).join('\n');

        // Using wp:group to wrap sections
        return `<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding:${section.settings.padding};background-color:${section.settings.backgroundColor}">
    <!-- wp:columns -->
    <div class="wp-block-columns">
        ${columnsHtml}
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
    }

    private renderColumn(column: Column): string {
        const blocksHtml = column.blocks.map(block => this.renderBlock(block)).join('\n');

        // Approximate width mapping for simple columns
        const widthVal = column.width < 100 ? `{"width":"${column.width}%"}` : '{}';

        return `<!-- wp:column ${widthVal} -->
<div class="wp-block-column" style="flex-basis:${column.width}%">
    ${blocksHtml}
</div>
<!-- /wp:column -->`;
    }

    private renderBlock(block: Block): string {
        switch (block.type) {
            case 'text':
                const textContent = block.content as any;
                // Simple paragraph or heading based on content? For now assume paragraph.
                // In a real implementation we might inspect fontSize to decide between h1-h6 vs p.
                return `<!-- wp:paragraph {"style":{"typography":{"fontSize":"${textContent.fontSize}"},"color":{"text":"${textContent.color}"}}} -->
<p style="color:${textContent.color};font-size:${textContent.fontSize}">${textContent.text}</p>
<!-- /wp:paragraph -->`;

            case 'image':
                const imageContent = block.content as any;
                return `<!-- wp:image -->
<figure class="wp-block-image"><img src="${imageContent.src}" alt="${imageContent.alt || ''}"/></figure>
<!-- /wp:image -->`;

            case 'button':
                const btnContent = block.content as any;
                return `<!-- wp:buttons -->
<div class="wp-block-buttons">
    <!-- wp:button {"backgroundColor":"primary","textColor":"white"} -->
    <div class="wp-block-button"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background" href="${btnContent.url}">${btnContent.text}</a></div>
    <!-- /wp:button -->
</div>
<!-- /wp:buttons -->`;

            case 'code':
                const codeContent = block.content as any;
                return `<!-- wp:html -->
${codeContent.code}
<!-- /wp:html -->`;

            default:
                return `<!-- wp:html -->
<div>[Block type ${block.type} not fully supported in WP export yet]</div>
<!-- /wp:html -->`;
        }
    }
}
