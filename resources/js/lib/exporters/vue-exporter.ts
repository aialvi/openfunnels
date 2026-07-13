import { Block, Column, Funnel, Section } from '@/stores/funnelStore';
import { renderFormMarkup } from './form-export';
import { Exporter } from './index';

type TextContent = {
    text: string;
    textAlign: string;
    color: string;
    fontSize: string;
    fontWeight: string;
};

type ImageContent = {
    src: string;
    alt?: string;
    width: string;
    objectFit: string;
};

type ButtonContent = {
    text: string;
    url: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
};

type SpacerContent = {
    height: string;
};

type CodeContent = {
    code: string;
};

export class VueExporter implements Exporter {
    export(funnel: Funnel): string {
        const sectionsHtml = funnel.content.sections.map((section) => this.renderSection(section)).join('\n');

        return `<template>
  <main :style="mainStyle">
    ${sectionsHtml}
  </main>
</template>

<script setup>
import { computed } from 'vue';

const mainStyle = computed(() => ({
  fontFamily: '${funnel.settings.fontFamily || 'Inter, sans-serif'}',
  backgroundColor: '${funnel.settings.backgroundColor}'
}));
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>`;
    }

    private renderSection(section: Section): string {
        const style = {
            backgroundColor: section.settings.backgroundColor,
            padding: section.settings.padding,
            margin: section.settings.margin,
            minHeight: section.settings.minHeight,
            backgroundImage: section.settings.backgroundImage ? `url(${section.settings.backgroundImage})` : undefined,
            backgroundSize: section.settings.backgroundImage ? 'cover' : undefined,
            backgroundPosition: section.settings.backgroundImage ? 'center' : undefined,
        };

        const columnsHtml = section.columns.map((column) => this.renderColumn(column)).join('\n');

        return `
    <section id="${section.id}" :style='${JSON.stringify(style)}' class="w-full ${section.settings.fullWidth ? '' : 'max-w-7xl mx-auto'}">
      <div class="flex flex-wrap ${section.layout === 'single' ? '' : '-mx-2'}">
        ${columnsHtml}
      </div>
    </section>`;
    }

    private renderColumn(column: Column): string {
        const style = {
            padding: column.settings.padding,
            backgroundColor: column.settings.backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: this.mapVerticalAlign(column.settings.verticalAlign),
        };

        const widthClass = this.getWidthClass(column.width);
        const blocksHtml = column.blocks.map((block) => this.renderBlock(block)).join('\n');

        return `
        <div id="${column.id}" :style='${JSON.stringify(style)}' class="${widthClass} px-2 mb-4">
          ${blocksHtml}
        </div>`;
    }

    private renderBlock(block: Block): string {
        const style = {
            padding: block.settings.padding,
            margin: block.settings.margin,
            backgroundColor: block.settings.backgroundColor,
            borderRadius: block.settings.borderRadius,
        };

        let contentHtml = '';

        switch (block.type) {
            case 'text': {
                const textContent = block.content as Partial<TextContent>;
                contentHtml = `<div :style="{ textAlign: '${textContent.textAlign}', color: '${textContent.color}', fontSize: '${textContent.fontSize}', fontWeight: '${textContent.fontWeight}' }">${textContent.text}</div>`;
                break;
            }
            case 'image': {
                const imageContent = block.content as Partial<ImageContent>;
                contentHtml = `<img src="${imageContent.src}" alt="${imageContent.alt || ''}" :style="{ width: '${imageContent.width}', objectFit: '${imageContent.objectFit}', display: 'block', maxWidth: '100%' }" />`;
                break;
            }
            case 'button': {
                const btnContent = block.content as Partial<ButtonContent>;
                const btnStyle = {
                    display: 'inline-block',
                    padding: btnContent.size === 'small' ? '8px 16px' : btnContent.size === 'large' ? '16px 32px' : '12px 24px',
                    backgroundColor: btnContent.variant === 'secondary' ? '#4b5563' : '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    width: btnContent.fullWidth ? '100%' : 'auto',
                    textAlign: 'center',
                };
                contentHtml = `<a href="${btnContent.url}" :style='${JSON.stringify(btnStyle)}'>${btnContent.text}</a>`;
                break;
            }
            case 'form':
                contentHtml = renderFormMarkup(block.content);
                break;
            case 'spacer': {
                const spacerContent = block.content as Partial<SpacerContent>;
                contentHtml = `<div style="height: ${spacerContent.height}"></div>`;
                break;
            }
            case 'code': {
                const codeContent = block.content as Partial<CodeContent>;
                contentHtml = `<div v-html="\`${codeContent.code}\`"></div>`;
                break;
            }
            default:
                contentHtml = `<!-- Block type "${block.type}" not yet supported in export -->`;
        }

        return `
          <div id="${block.id}" :style='${JSON.stringify(style)}'>
            ${contentHtml}
          </div>`;
    }

    private mapVerticalAlign(align: string): string {
        switch (align) {
            case 'middle':
                return 'center';
            case 'bottom':
                return 'flex-end';
            default:
                return 'flex-start';
        }
    }

    private getWidthClass(width: number): string {
        if (width >= 99) return 'w-full';
        if (width >= 66) return 'w-full md:w-2/3';
        if (width >= 50) return 'w-full md:w-1/2';
        if (width >= 33) return 'w-full md:w-1/3';
        if (width >= 25) return 'w-full md:w-1/4';
        return `w-[${width}%]`;
    }
}
