import type { Block, Column, Funnel, Section, TemplateManifest } from '@/types/editor';

const MAX_TEMPLATE_BYTES = 2 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBlock(value: unknown): value is Block {
    return isRecord(value) && typeof value.id === 'string' && typeof value.type === 'string' && isRecord(value.content) && isRecord(value.settings);
}

function isColumn(value: unknown): value is Column {
    return (
        isRecord(value) &&
        value.type === 'column' &&
        typeof value.id === 'string' &&
        typeof value.width === 'number' &&
        Array.isArray(value.blocks) &&
        value.blocks.every(isBlock) &&
        isRecord(value.settings)
    );
}

function isSection(value: unknown): value is Section {
    return (
        isRecord(value) &&
        value.type === 'section' &&
        typeof value.id === 'string' &&
        typeof value.layout === 'string' &&
        Array.isArray(value.columns) &&
        value.columns.every(isColumn) &&
        isRecord(value.settings)
    );
}

export function createTemplateManifest(funnel: Funnel): TemplateManifest {
    return {
        kind: 'openfunnels-template',
        schemaVersion: 1,
        metadata: {
            name: funnel.name,
            description: funnel.description ?? '',
            category: 'Community',
            tags: [],
        },
        funnel: {
            content: structuredClone(funnel.content),
            settings: structuredClone(funnel.settings),
        },
    };
}

export function parseTemplateManifest(source: string): TemplateManifest {
    if (new Blob([source]).size > MAX_TEMPLATE_BYTES) {
        throw new Error('Template files must be smaller than 2 MB.');
    }

    let value: unknown;
    try {
        value = JSON.parse(source) as unknown;
    } catch {
        throw new Error('This file is not valid JSON.');
    }

    if (!isRecord(value) || value.kind !== 'openfunnels-template' || value.schemaVersion !== 1) {
        throw new Error('This is not a supported OpenFunnels template.');
    }
    if (!isRecord(value.metadata) || typeof value.metadata.name !== 'string' || typeof value.metadata.category !== 'string') {
        throw new Error('The template metadata is incomplete.');
    }
    if (!Array.isArray(value.metadata.tags) || !value.metadata.tags.every((tag) => typeof tag === 'string')) {
        throw new Error('Template tags must be text values.');
    }
    if (!isRecord(value.funnel) || !isRecord(value.funnel.content) || !Array.isArray(value.funnel.content.sections)) {
        throw new Error('The template content is incomplete.');
    }
    if (value.funnel.content.sections.length > 200 || !value.funnel.content.sections.every(isSection)) {
        throw new Error('The template contains an invalid section tree.');
    }
    if (!isRecord(value.funnel.settings)) {
        throw new Error('The template settings are invalid.');
    }

    return value as unknown as TemplateManifest;
}

function freshId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`;
}

export function templateManifestToFunnel(manifest: TemplateManifest): Funnel {
    const sections = structuredClone(manifest.funnel.content.sections);
    const refreshBlockIds = (block: Block) => {
        block.id = freshId('block');
        block.children?.forEach(refreshBlockIds);
    };

    sections.forEach((section) => {
        section.id = freshId('section');
        section.columns.forEach((column) => {
            column.id = freshId('column');
            column.blocks.forEach(refreshBlockIds);
        });
    });

    return {
        name: manifest.metadata.name,
        description: manifest.metadata.description,
        content: { sections },
        settings: structuredClone(manifest.funnel.settings),
        status: 'draft',
        is_published: false,
    };
}

export function downloadTemplateManifest(funnel: Funnel): void {
    const manifest = createTemplateManifest(funnel);
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${funnel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'funnel'}.openfunnels.json`;
    anchor.click();
    URL.revokeObjectURL(url);
}
