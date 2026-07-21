import type { Block, Section } from '@/types/editor';
import { beforeEach, describe, expect, it } from 'vitest';
import { findBlockLocation, getSelectedBlock, useFunnelStore } from './funnelStore';

const section: Section = {
    id: 'section-1',
    type: 'section',
    layout: 'single',
    settings: {
        backgroundColor: '#fff',
        padding: '20px',
        margin: '0',
        minHeight: 'auto',
        fullWidth: false,
    },
    columns: [
        {
            id: 'column-1',
            type: 'column',
            width: 100,
            settings: {
                padding: '0',
                backgroundColor: 'transparent',
                verticalAlign: 'top',
            },
            blocks: [],
        },
    ],
};

const block: Block = {
    id: 'block-1',
    type: 'text',
    content: { text: 'Original' },
    settings: {
        padding: '0',
        margin: '0',
        backgroundColor: 'transparent',
        borderRadius: '0',
    },
};

describe('funnel store', () => {
    beforeEach(() => {
        useFunnelStore.getState().setFunnel({
            name: 'Test funnel',
            content: { sections: [structuredClone(section)] },
            settings: { backgroundColor: '#fff', maxWidth: '1200px' },
            status: 'draft',
            is_published: false,
        });
    });

    it('tracks block locations and the live selection', () => {
        const store = useFunnelStore.getState();
        store.addBlock('section-1', 'column-1', structuredClone(block));
        store.selectBlock('block-1');

        expect(findBlockLocation(useFunnelStore.getState(), 'block-1')).toEqual({
            sectionId: 'section-1',
            columnId: 'column-1',
        });
        expect(getSelectedBlock(useFunnelStore.getState())?.content.text).toBe('Original');
    });

    it('supports undo and redo for content changes', () => {
        const store = useFunnelStore.getState();
        store.addBlock('section-1', 'column-1', structuredClone(block));
        useFunnelStore.getState().undo();
        expect(useFunnelStore.getState().funnel.content.sections[0].columns[0].blocks).toHaveLength(0);

        useFunnelStore.getState().redo();
        expect(useFunnelStore.getState().funnel.content.sections[0].columns[0].blocks).toHaveLength(1);
    });
});
