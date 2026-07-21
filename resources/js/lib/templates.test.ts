import type { Funnel } from '@/types/editor';
import { describe, expect, it } from 'vitest';
import { createTemplateManifest, parseTemplateManifest, templateManifestToFunnel } from './templates';

const funnel: Funnel = {
    name: 'Portable funnel',
    description: 'A community template',
    content: {
        sections: [
            {
                id: 'section-old',
                type: 'section',
                layout: 'single',
                settings: { backgroundColor: '#fff', padding: '0', margin: '0', minHeight: 'auto', fullWidth: false },
                columns: [
                    {
                        id: 'column-old',
                        type: 'column',
                        width: 100,
                        settings: { padding: '0', backgroundColor: 'transparent', verticalAlign: 'top' },
                        blocks: [
                            {
                                id: 'block-old',
                                type: 'text',
                                content: { text: 'Hello' },
                                settings: { padding: '0', margin: '0', backgroundColor: 'transparent', borderRadius: '0' },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    settings: { backgroundColor: '#fff', maxWidth: '1200px' },
    status: 'draft',
    is_published: false,
};

describe('portable templates', () => {
    it('round trips a versioned manifest and refreshes tree identifiers', () => {
        const manifest = parseTemplateManifest(JSON.stringify(createTemplateManifest(funnel)));
        const imported = templateManifestToFunnel(manifest);

        expect(imported.name).toBe('Portable funnel');
        expect(imported.content.sections[0].id).not.toBe('section-old');
        expect(imported.content.sections[0].columns[0].blocks[0].id).not.toBe('block-old');
    });

    it('rejects unknown and malformed template files', () => {
        expect(() => parseTemplateManifest('{"kind":"other"}')).toThrow('not a supported');
        expect(() => parseTemplateManifest('not json')).toThrow('not valid JSON');
    });
});
