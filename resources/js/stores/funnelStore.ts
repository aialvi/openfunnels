import type { Block, Column, Funnel, FunnelSettings, Section } from '@/types/editor';
import { current, produce } from 'immer';
import { create } from 'zustand';

// Re-export canonical types so existing `import { Block } from '@/stores/funnelStore'` still works.
export type { Block, Column, Funnel, Section } from '@/types/editor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50;

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getDefaultFunnel(): Funnel {
    return {
        name: 'Untitled Funnel',
        description: '',
        content: { sections: [] },
        settings: {
            backgroundColor: '#ffffff',
            maxWidth: '1200px',
            fontFamily: 'Inter, sans-serif',
        },
        status: 'draft',
        is_published: false,
    };
}

/** Deep-clone a funnel. Works with both plain objects and Immer drafts. */
function snapshot(funnel: Funnel): Funnel {
    // JSON round-trip is safe here because Funnel is a plain-data tree
    // (no Date, Map, Set, etc.). This avoids structuredClone issues with
    // Immer Proxy drafts.
    return JSON.parse(JSON.stringify(funnel));
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface FunnelStore {
    // ── Data ──────────────────────────────────────────────────────────────
    funnel: Funnel;

    // ── Selection (ID-based) ─────────────────────────────────────────────
    selectedSectionId: string | null;
    selectedColumnId: string | null;
    selectedBlockId: string | null;
    selectedDevice: 'desktop' | 'tablet' | 'mobile';

    // ── UI flags ─────────────────────────────────────────────────────────
    isDirty: boolean;
    isSaving: boolean;
    draggedBlock: Block | null;

    // ── History ──────────────────────────────────────────────────────────
    history: Funnel[];
    historyIndex: number;

    // ── Funnel-level actions ─────────────────────────────────────────────
    setFunnel: (funnel: Funnel) => void;
    updateFunnelName: (name: string) => void;
    updateFunnelDescription: (description: string) => void;
    updateFunnelSettings: (settings: Partial<FunnelSettings>) => void;
    setSections: (sections: Section[]) => void;

    // ── Section actions ──────────────────────────────────────────────────
    addSection: (section: Section) => void;
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    deleteSection: (sectionId: string) => void;
    duplicateSection: (sectionId: string) => void;
    moveSection: (fromIndex: number, toIndex: number) => void;

    // ── Column actions ───────────────────────────────────────────────────
    updateColumn: (sectionId: string, columnId: string, updates: Partial<Column>) => void;

    // ── Block actions ────────────────────────────────────────────────────
    addBlock: (sectionId: string, columnId: string, block: Block, index?: number) => void;
    updateBlock: (sectionId: string, columnId: string, blockId: string, updates: Partial<Block>) => void;
    deleteBlock: (sectionId: string, columnId: string, blockId: string) => void;
    duplicateBlock: (sectionId: string, columnId: string, blockId: string) => void;
    moveBlock: (sectionId: string, columnId: string, fromIndex: number, toIndex: number) => void;

    // ── Selection actions ────────────────────────────────────────────────
    selectSection: (sectionId: string | null) => void;
    selectColumn: (columnId: string | null) => void;
    selectBlock: (blockId: string | null) => void;
    selectDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
    clearSelection: () => void;

    // ── Drag and drop ────────────────────────────────────────────────────
    setDraggedBlock: (block: Block | null) => void;

    // ── History ──────────────────────────────────────────────────────────
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // ── Utility ──────────────────────────────────────────────────────────
    setSaving: (saving: boolean) => void;
    markClean: () => void;
    markDirty: () => void;
}

// ---------------------------------------------------------------------------
// Immer helper — wraps produce for use inside Zustand set()
// ---------------------------------------------------------------------------

/**
 * Helper to create an Immer-powered updater for Zustand.
 * Usage: set(immerSet(draft => { draft.funnel.name = 'new'; }))
 */
function immerSet(fn: (draft: FunnelStore) => void): (state: FunnelStore) => Partial<FunnelStore> {
    return (state) => produce(state, fn) as Partial<FunnelStore>;
}

/** Push current funnel state onto the undo stack (call inside an immer draft). */
function pushHistory(draft: FunnelStore) {
    const snap = snapshot(draft.funnel);
    // Discard any redo states beyond the current pointer.
    draft.history = draft.history.slice(0, draft.historyIndex + 1);
    draft.history.push(snap);
    // Cap at MAX_HISTORY.
    if (draft.history.length > MAX_HISTORY) {
        draft.history = draft.history.slice(-MAX_HISTORY);
    }
    draft.historyIndex = draft.history.length - 1;
    draft.isDirty = true;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useFunnelStore = create<FunnelStore>()((set, get) => ({
    // ── Initial state ────────────────────────────────────────────────
    funnel: getDefaultFunnel(),
    selectedSectionId: null,
    selectedColumnId: null,
    selectedBlockId: null,
    selectedDevice: 'desktop',
    isDirty: false,
    isSaving: false,
    history: [getDefaultFunnel()],
    historyIndex: 0,
    draggedBlock: null,

    // ── Funnel-level ─────────────────────────────────────────────────

    setFunnel: (funnel) =>
        set({
            funnel,
            history: [snapshot(funnel)],
            historyIndex: 0,
            isDirty: false,
            selectedSectionId: null,
            selectedColumnId: null,
            selectedBlockId: null,
        }),

    updateFunnelName: (name) =>
        set(
            immerSet((draft) => {
                draft.funnel.name = name;
                pushHistory(draft);
            }),
        ),

    updateFunnelDescription: (description) =>
        set(
            immerSet((draft) => {
                draft.funnel.description = description;
                pushHistory(draft);
            }),
        ),

    updateFunnelSettings: (settings) =>
        set(
            immerSet((draft) => {
                Object.assign(draft.funnel.settings, settings);
                pushHistory(draft);
            }),
        ),

    setSections: (sections) =>
        set(
            immerSet((draft) => {
                draft.funnel.content.sections = sections;
                pushHistory(draft);
            }),
        ),

    // ── Section actions ──────────────────────────────────────────────

    addSection: (section) =>
        set(
            immerSet((draft) => {
                draft.funnel.content.sections.push(section);
                draft.selectedSectionId = section.id;
                pushHistory(draft);
            }),
        ),

    updateSection: (sectionId, updates) =>
        set(
            immerSet((draft) => {
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (section) {
                    Object.assign(section, updates);
                    pushHistory(draft);
                }
            }),
        ),

    deleteSection: (sectionId) =>
        set(
            immerSet((draft) => {
                draft.funnel.content.sections = draft.funnel.content.sections.filter((s) => s.id !== sectionId);
                if (draft.selectedSectionId === sectionId) {
                    draft.selectedSectionId = null;
                    draft.selectedColumnId = null;
                    draft.selectedBlockId = null;
                }
                pushHistory(draft);
            }),
        ),

    duplicateSection: (sectionId) =>
        set(
            immerSet((draft) => {
                const idx = draft.funnel.content.sections.findIndex((s) => s.id === sectionId);
                if (idx === -1) return;

                const original = current(draft.funnel.content.sections[idx]);
                const dup: Section = JSON.parse(JSON.stringify(original)) as Section;
                dup.id = generateId('section');
                dup.columns.forEach((col) => {
                    col.id = generateId('column');
                    col.blocks.forEach((b) => {
                        b.id = generateId('block');
                    });
                });

                draft.funnel.content.sections.splice(idx + 1, 0, dup);
                draft.selectedSectionId = dup.id;
                pushHistory(draft);
            }),
        ),

    moveSection: (fromIndex, toIndex) =>
        set(
            immerSet((draft) => {
                if (fromIndex === toIndex) return;
                const sections = draft.funnel.content.sections;
                const [removed] = sections.splice(fromIndex, 1);
                sections.splice(toIndex, 0, removed);
                pushHistory(draft);
            }),
        ),

    // ── Column actions ───────────────────────────────────────────────

    updateColumn: (sectionId, columnId, updates) =>
        set(
            immerSet((draft) => {
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (!section) return;
                const column = section.columns.find((c) => c.id === columnId);
                if (!column) return;

                Object.assign(column, updates);
                pushHistory(draft);
            }),
        ),

    // ── Block actions ────────────────────────────────────────────────

    addBlock: (sectionId, columnId, block, index) =>
        set(
            immerSet((draft) => {
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (!section) return;
                const column = section.columns.find((c) => c.id === columnId);
                if (!column) return;

                if (index !== undefined) {
                    column.blocks.splice(index, 0, block);
                } else {
                    column.blocks.push(block);
                }
                draft.selectedBlockId = block.id;
                pushHistory(draft);
            }),
        ),

    updateBlock: (sectionId, columnId, blockId, updates) =>
        set(
            immerSet((draft) => {
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (!section) return;
                const column = section.columns.find((c) => c.id === columnId);
                if (!column) return;
                const block = column.blocks.find((b) => b.id === blockId);
                if (!block) return;

                Object.assign(block, updates);
                pushHistory(draft);
            }),
        ),

    deleteBlock: (sectionId, columnId, blockId) =>
        set(
            immerSet((draft) => {
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (!section) return;
                const column = section.columns.find((c) => c.id === columnId);
                if (!column) return;

                column.blocks = column.blocks.filter((b) => b.id !== blockId);
                if (draft.selectedBlockId === blockId) {
                    draft.selectedBlockId = null;
                }
                pushHistory(draft);
            }),
        ),

    duplicateBlock: (sectionId, columnId, blockId) =>
        set(
            immerSet((draft) => {
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (!section) return;
                const column = section.columns.find((c) => c.id === columnId);
                if (!column) return;
                const blockIdx = column.blocks.findIndex((b) => b.id === blockId);
                if (blockIdx === -1) return;

                const dup: Block = JSON.parse(JSON.stringify(current(column.blocks[blockIdx]))) as Block;
                dup.id = generateId('block');
                column.blocks.splice(blockIdx + 1, 0, dup);
                draft.selectedBlockId = dup.id;
                pushHistory(draft);
            }),
        ),

    moveBlock: (sectionId, columnId, fromIndex, toIndex) =>
        set(
            immerSet((draft) => {
                if (fromIndex === toIndex) return;
                const section = draft.funnel.content.sections.find((s) => s.id === sectionId);
                if (!section) return;
                const column = section.columns.find((c) => c.id === columnId);
                if (!column) return;

                const [removed] = column.blocks.splice(fromIndex, 1);
                column.blocks.splice(toIndex, 0, removed);
                pushHistory(draft);
            }),
        ),

    // ── Selection ────────────────────────────────────────────────────

    selectSection: (sectionId) =>
        set({
            selectedSectionId: sectionId,
            selectedColumnId: null,
            selectedBlockId: null,
        }),

    selectColumn: (columnId) =>
        set({
            selectedColumnId: columnId,
            selectedBlockId: null,
        }),

    selectBlock: (blockId) => set({ selectedBlockId: blockId }),

    selectDevice: (device) => set({ selectedDevice: device }),

    clearSelection: () =>
        set({
            selectedSectionId: null,
            selectedColumnId: null,
            selectedBlockId: null,
        }),

    // ── Drag and drop ────────────────────────────────────────────────

    setDraggedBlock: (block) => set({ draggedBlock: block }),

    // ── History ──────────────────────────────────────────────────────

    undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            set({
                funnel: snapshot(state.history[newIndex]),
                historyIndex: newIndex,
                selectedSectionId: null,
                selectedColumnId: null,
                selectedBlockId: null,
                isDirty: true,
            });
        }
    },

    redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            set({
                funnel: snapshot(state.history[newIndex]),
                historyIndex: newIndex,
                selectedSectionId: null,
                selectedColumnId: null,
                selectedBlockId: null,
                isDirty: true,
            });
        }
    },

    canUndo: () => get().historyIndex > 0,

    canRedo: () => get().historyIndex < get().history.length - 1,

    // ── Utility ──────────────────────────────────────────────────────

    setSaving: (saving) => set({ isSaving: saving }),

    markClean: () => set({ isDirty: false }),

    markDirty: () => set({ isDirty: true }),
}));

// ---------------------------------------------------------------------------
// Derived selectors — always read the LIVE object from the data tree.
// Usage: const selectedSection = useFunnelStore(getSelectedSection);
// ---------------------------------------------------------------------------

export function getSelectedSection(state: FunnelStore): Section | null {
    if (!state.selectedSectionId) return null;
    return state.funnel.content.sections.find((s) => s.id === state.selectedSectionId) ?? null;
}

export function getSelectedColumn(state: FunnelStore): Column | null {
    const section = getSelectedSection(state);
    if (!section || !state.selectedColumnId) return null;
    return section.columns.find((c) => c.id === state.selectedColumnId) ?? null;
}

export function getSelectedBlock(state: FunnelStore): Block | null {
    if (!state.selectedBlockId) return null;
    // Walk the whole tree — the block could be in any section/column.
    for (const section of state.funnel.content.sections) {
        for (const column of section.columns) {
            const block = column.blocks.find((b) => b.id === state.selectedBlockId);
            if (block) return block;
        }
    }
    return null;
}

/**
 * Given a blockId, find which sectionId and columnId it belongs to.
 * Useful when a component only knows the block but needs parent context
 * to call store actions like updateBlock(sectionId, columnId, blockId, ...).
 */
export function findBlockLocation(state: FunnelStore, blockId: string): { sectionId: string; columnId: string } | null {
    for (const section of state.funnel.content.sections) {
        for (const column of section.columns) {
            if (column.blocks.some((b) => b.id === blockId)) {
                return { sectionId: section.id, columnId: column.id };
            }
        }
    }
    return null;
}

/**
 * Given a columnId, find which sectionId it belongs to.
 */
export function findColumnSection(state: FunnelStore, columnId: string): string | null {
    for (const section of state.funnel.content.sections) {
        if (section.columns.some((c) => c.id === columnId)) {
            return section.id;
        }
    }
    return null;
}
