import { Funnel, Section, Column, Block } from '@/stores/funnelStore';
import { Exporter } from './index';

export class LaravelExporter implements Exporter {
    export(funnel: Funnel): string {
        const sectionsHtml = funnel.content.sections.map(section => this.renderSection(section)).join('\n');

        return `@extends('layouts.app')

@section('title', '${funnel.name}')

@push('styles')
<style>
    .funnel-page {
        font-family: ${funnel.settings.fontFamily || 'Inter, sans-serif'};
        background-color: ${funnel.settings.backgroundColor};
    }
</style>
@endpush

@section('content')
<main class="funnel-page">
${sectionsHtml}
</main>
@endsection`;
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

        const columnsHtml = section.columns.map(column => this.renderColumn(column)).join('\n');

        return `
    <section id="${section.id}" style="${this.styleToString(style)}" class="w-full ${section.settings.fullWidth ? '' : 'max-w-7xl mx-auto'}">
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
        const blocksHtml = column.blocks.map(block => this.renderBlock(block)).join('\n');

        return `
            <div id="${column.id}" style="${this.styleToString(style)}" class="${widthClass} px-2 mb-4">
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
                contentHtml = `<a href="${btnContent.url}" style="${this.styleToString(btnStyle)}">${btnContent.text}</a>`;
                break;
            case 'woocommerce-product':
                const wooContent = block.content as any;
                // Example of using a Blade component for WooCommerce product
                contentHtml = `@livewire('product-card', ['productId' => '${wooContent.productId}'])`;
                break;
            default:
                // Fallback to HTML exporter logic or simple div
                contentHtml = `<!-- Block type "${block.type}" -->`;
        }

        return `
                <div id="${block.id}" style="${this.styleToString(style)}">
                    ${contentHtml}
                </div>`;
    }

    private styleToString(style: Record<string, string | undefined>): string {
        return Object.entries(style)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${value}`)
            .join('; ');
    }

    private mapVerticalAlign(align: string): string {
        switch (align) {
            case 'middle': return 'center';
            case 'bottom': return 'flex-end';
            default: return 'flex-start';
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
