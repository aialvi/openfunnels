import { Funnel, Section, Column, Block } from '@/stores/funnelStore';
import { Exporter } from './index';

export class HtmlExporter implements Exporter {
    export(funnel: Funnel): string {
        const sectionsHtml = funnel.content.sections.map(section => this.renderSection(section)).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${funnel.name}</title>
    <meta name="description" content="${funnel.description || ''}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: ${funnel.settings.fontFamily || 'Inter, sans-serif'}; background-color: ${funnel.settings.backgroundColor}; }
    </style>
</head>
<body>
    <main>
${sectionsHtml}
    </main>
</body>
</html>`;
    }

    private renderSection(section: Section): string {
        const style = `
            background-color: ${section.settings.backgroundColor};
            padding: ${section.settings.padding};
            margin: ${section.settings.margin};
            min-height: ${section.settings.minHeight};
            ${section.settings.backgroundImage ? `background-image: url(${section.settings.backgroundImage}); background-size: cover; background-position: center;` : ''}
        `;

        const columnsHtml = section.columns.map(column => this.renderColumn(column)).join('\n');

        return `
        <section id="${section.id}" style="${this.minifyStyle(style)}" class="w-full ${section.settings.fullWidth ? '' : 'max-w-7xl mx-auto'}">
            <div class="flex flex-wrap ${section.layout === 'single' ? '' : '-mx-2'}">
${columnsHtml}
            </div>
        </section>`;
    }

    private renderColumn(column: Column): string {
        const style = `
            padding: ${column.settings.padding};
            background-color: ${column.settings.backgroundColor};
            display: flex;
            flex-direction: column;
            justify-content: ${this.mapVerticalAlign(column.settings.verticalAlign)};
        `;

        const widthClass = this.getWidthClass(column.width);
        const blocksHtml = column.blocks.map(block => this.renderBlock(block)).join('\n');

        return `
                <div id="${column.id}" style="${this.minifyStyle(style)}" class="${widthClass} px-2 mb-4">
${blocksHtml}
                </div>`;
    }

    private renderBlock(block: Block): string {
        const style = `
            padding: ${block.settings.padding};
            margin: ${block.settings.margin};
            background-color: ${block.settings.backgroundColor};
            border-radius: ${block.settings.borderRadius};
        `;

        let contentHtml = '';

        switch (block.type) {
            case 'text':
                const textContent = block.content as any;
                contentHtml = `<div style="text-align: ${textContent.textAlign}; color: ${textContent.color}; font-size: ${textContent.fontSize}; font-weight: ${textContent.fontWeight};">${textContent.text}</div>`;
                break;
            case 'image':
                const imageContent = block.content as any;
                contentHtml = `<img src="${imageContent.src}" alt="${imageContent.alt || ''}" style="width: ${imageContent.width}; object-fit: ${imageContent.objectFit}; display: block; max-width: 100%;" />`;
                break;
            case 'button':
                const btnContent = block.content as any;
                const btnStyle = `
                    display: inline-block;
                    padding: ${btnContent.size === 'small' ? '8px 16px' : btnContent.size === 'large' ? '16px 32px' : '12px 24px'};
                    background-color: ${btnContent.variant === 'secondary' ? '#4b5563' : '#3b82f6'};
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    width: ${btnContent.fullWidth ? '100%' : 'auto'};
                    text-align: center;
                `;
                contentHtml = `<a href="${btnContent.url}" style="${this.minifyStyle(btnStyle)}">${btnContent.text}</a>`;
                break;
            case 'spacer':
                const spacerContent = block.content as any;
                contentHtml = `<div style="height: ${spacerContent.height};"></div>`;
                break;
            case 'code':
                const codeContent = block.content as any;
                contentHtml = `${codeContent.code}`;
                break;
            default:
                contentHtml = `<!-- Block type "${block.type}" not yet supported in export -->`;
        }

        return `
                    <div id="${block.id}" style="${this.minifyStyle(style)}">
                        ${contentHtml}
                    </div>`;
    }

    private minifyStyle(style: string): string {
        return style.replace(/\s+/g, ' ').trim();
    }

    private mapVerticalAlign(align: string): string {
        switch (align) {
            case 'middle': return 'center';
            case 'bottom': return 'flex-end';
            default: return 'flex-start';
        }
    }

    private getWidthClass(width: number): string {
        // Simple mapping for demonstration. In a real scenario, we might use arbitrary values or flex-basis.
        if (width >= 99) return 'w-full';
        if (width >= 66) return 'w-full md:w-2/3';
        if (width >= 50) return 'w-full md:w-1/2';
        if (width >= 33) return 'w-full md:w-1/3';
        if (width >= 25) return 'w-full md:w-1/4';
        return `w-[${width}%]`;
    }
}
