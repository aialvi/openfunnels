import type { Funnel } from '@/types/editor';
import { HtmlExporter } from './html-exporter';
import { LaravelExporter } from './laravel-exporter';
import { ReactExporter } from './react-exporter';
import { ShopifyExporter } from './shopify-exporter';
import { VueExporter } from './vue-exporter';
import { WooCommerceExporter } from './woocommerce-exporter';
import { WordPressExporter } from './wordpress-exporter';

export type ExportFormat = 'html' | 'react' | 'vue' | 'wordpress' | 'shopify' | 'woocommerce' | 'laravel';

export interface Exporter {
    export(funnel: Funnel): string | Promise<string>;
}

export type ExportOptions = {
    includeTailwind?: boolean;
    minify?: boolean;
    prefix?: string; // For CSS classes to avoid conflicts
};

class ExportSystem {
    private exporters: Map<ExportFormat, Exporter> = new Map();

    constructor() {
        this.register('html', new HtmlExporter());
        this.register('react', new ReactExporter());
        this.register('vue', new VueExporter());
        this.register('wordpress', new WordPressExporter());
        this.register('laravel', new LaravelExporter());
        this.register('shopify', new ShopifyExporter());
        this.register('woocommerce', new WooCommerceExporter());
    }

    register(format: ExportFormat, exporter: Exporter) {
        this.exporters.set(format, exporter);
    }

    async export(funnel: Funnel, format: ExportFormat, options?: ExportOptions): Promise<string> {
        void options;

        const exporter = this.exporters.get(format);
        if (!exporter) {
            throw new Error(`Exporter for format "${format}" not found.`);
        }
        return exporter.export(funnel);
    }
}

export const funnelExporter = new ExportSystem();
