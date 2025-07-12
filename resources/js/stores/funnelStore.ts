import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { z } from 'zod';

// Zod schemas for validation
export const BlockSchema = z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'button', 'form']),
    content: z.record(z.string(), z.unknown()), // Flexible content object
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});

export const FunnelSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    content: z.array(BlockSchema),
    settings: z.object({
        backgroundColor: z.string(),
        maxWidth: z.string(),
        fontFamily: z.string().optional(),
    }),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    is_published: z.boolean().default(false),
});

export type Block = z.infer<typeof BlockSchema>;
export type Funnel = z.infer<typeof FunnelSchema>;

interface FunnelStore {
    // State
    funnel: Funnel;
    selectedBlock: Block | null;
    selectedDevice: 'desktop' | 'tablet' | 'mobile';
    isDirty: boolean;
    isSaving: boolean;
    history: Funnel[];
    historyIndex: number;
    draggedBlock: Block | null;
    
    // Actions
    setFunnel: (funnel: Funnel) => void;
    updateFunnelName: (name: string) => void;
    updateFunnelDescription: (description: string) => void;
    updateFunnelSettings: (settings: Partial<Funnel['settings']>) => void;
    
    // Block actions
    addBlock: (type: Block['type'], position?: { x: number; y: number }) => void;
    updateBlock: (blockId: string, updates: Partial<Block>) => void;
    updateBlockContent: (blockId: string, content: Record<string, unknown>) => void;
    updateBlockPosition: (blockId: string, position: { x: number; y: number }) => void;
    deleteBlock: (blockId: string) => void;
    duplicateBlock: (blockId: string) => void;
    
    // Selection
    setSelectedBlock: (block: Block | null) => void;
    setSelectedDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
    
    // Drag and drop
    setDraggedBlock: (block: Block | null) => void;
    
    // History
    addToHistory: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    
    // Persistence
    markDirty: () => void;
    markClean: () => void;
    setSaving: (saving: boolean) => void;
    
    // Reset
    resetFunnel: () => void;
}

const getDefaultBlock = (type: Block['type'], position: { x: number; y: number }): Block => {
    const baseBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        position,
    };

    switch (type) {
        case 'text':
            return {
                ...baseBlock,
                content: {
                    text: 'Enter your text here',
                    fontSize: '16',
                    color: '#1f2937',
                    textAlign: 'left',
                    fontWeight: 'normal',
                    fontFamily: 'inherit',
                },
            };
        case 'image':
            return {
                ...baseBlock,
                content: {
                    src: 'https://via.placeholder.com/300x200?text=Image',
                    alt: 'Image',
                    width: '300',
                    height: '200',
                    borderRadius: '8',
                },
            };
        case 'button':
            return {
                ...baseBlock,
                content: {
                    text: 'Click Me',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '8',
                    padding: '12px 24px',
                    fontSize: '16',
                    fontWeight: '500',
                    href: '#',
                },
            };
        case 'form':
            return {
                ...baseBlock,
                content: {
                    title: 'Subscribe to our newsletter',
                    placeholder: 'Enter your email',
                    buttonText: 'Subscribe',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8',
                    padding: '24px',
                },
            };
        default:
            return baseBlock as Block;
    }
};

const getDefaultFunnel = (): Funnel => ({
    name: 'Untitled Funnel',
    description: '',
    content: [],
    settings: {
        backgroundColor: '#ffffff',
        maxWidth: '1200px',
        fontFamily: 'Inter, sans-serif',
    },
    status: 'draft',
    is_published: false,
});

export const useFunnelStore = create<FunnelStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            funnel: getDefaultFunnel(),
            selectedBlock: null,
            selectedDevice: 'desktop',
            isDirty: false,
            isSaving: false,
            history: [getDefaultFunnel()],
            historyIndex: 0,
            draggedBlock: null,

            // Funnel actions
            setFunnel: (funnel) => 
                set({ 
                    funnel, 
                    history: [funnel], 
                    historyIndex: 0, 
                    isDirty: false 
                }),

            updateFunnelName: (name) =>
                set((state) => {
                    const updatedFunnel = { ...state.funnel, name };
                    return { funnel: updatedFunnel, isDirty: true };
                }),

            updateFunnelDescription: (description) =>
                set((state) => {
                    const updatedFunnel = { ...state.funnel, description };
                    return { funnel: updatedFunnel, isDirty: true };
                }),

            updateFunnelSettings: (settings) =>
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        settings: { ...state.funnel.settings, ...settings },
                    };
                    return { funnel: updatedFunnel, isDirty: true };
                }),

            // Block actions
            addBlock: (type, position = { x: 100, y: 100 }) => {
                const newBlock = getDefaultBlock(type, position);
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: [...state.funnel.content, newBlock],
                    };
                    return { 
                        funnel: updatedFunnel, 
                        selectedBlock: newBlock, 
                        isDirty: true 
                    };
                });
                get().addToHistory();
            },

            updateBlock: (blockId, updates) =>
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: state.funnel.content.map((block) =>
                            block.id === blockId ? { ...block, ...updates } : block
                        ),
                    };
                    const updatedSelectedBlock = 
                        state.selectedBlock?.id === blockId 
                            ? { ...state.selectedBlock, ...updates }
                            : state.selectedBlock;
                    
                    return { 
                        funnel: updatedFunnel, 
                        selectedBlock: updatedSelectedBlock,
                        isDirty: true 
                    };
                }),

            updateBlockContent: (blockId, content) =>
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: state.funnel.content.map((block) =>
                            block.id === blockId 
                                ? { ...block, content: { ...block.content, ...content } }
                                : block
                        ),
                    };
                    const updatedSelectedBlock = 
                        state.selectedBlock?.id === blockId 
                            ? { 
                                ...state.selectedBlock, 
                                content: { ...state.selectedBlock.content, ...content } 
                            }
                            : state.selectedBlock;
                    
                    return { 
                        funnel: updatedFunnel, 
                        selectedBlock: updatedSelectedBlock,
                        isDirty: true 
                    };
                }),

            updateBlockPosition: (blockId, position) =>
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: state.funnel.content.map((block) =>
                            block.id === blockId ? { ...block, position } : block
                        ),
                    };
                    const updatedSelectedBlock = 
                        state.selectedBlock?.id === blockId 
                            ? { ...state.selectedBlock, position }
                            : state.selectedBlock;
                    
                    return { 
                        funnel: updatedFunnel, 
                        selectedBlock: updatedSelectedBlock,
                        isDirty: true 
                    };
                }),

            deleteBlock: (blockId) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: state.funnel.content.filter((block) => block.id !== blockId),
                    };
                    const updatedSelectedBlock = 
                        state.selectedBlock?.id === blockId ? null : state.selectedBlock;
                    
                    return { 
                        funnel: updatedFunnel, 
                        selectedBlock: updatedSelectedBlock,
                        isDirty: true 
                    };
                });
                get().addToHistory();
            },

            duplicateBlock: (blockId) => {
                const block = get().funnel.content.find((b) => b.id === blockId);
                if (block) {
                    const duplicatedBlock = {
                        ...block,
                        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        position: {
                            x: block.position.x + 20,
                            y: block.position.y + 20,
                        },
                    };
                    set((state) => {
                        const updatedFunnel = {
                            ...state.funnel,
                            content: [...state.funnel.content, duplicatedBlock],
                        };
                        return { 
                            funnel: updatedFunnel, 
                            selectedBlock: duplicatedBlock,
                            isDirty: true 
                        };
                    });
                    get().addToHistory();
                }
            },

            // Selection actions
            setSelectedBlock: (block) => set({ selectedBlock: block }),
            setSelectedDevice: (device) => set({ selectedDevice: device }),

            // Drag and drop
            setDraggedBlock: (block) => set({ draggedBlock: block }),

            // History actions
            addToHistory: () =>
                set((state) => {
                    const newHistory = state.history.slice(0, state.historyIndex + 1);
                    newHistory.push({ ...state.funnel });
                    return {
                        history: newHistory.slice(-50), // Keep last 50 states
                        historyIndex: Math.min(newHistory.length - 1, 49),
                    };
                }),

            undo: () => {
                const state = get();
                if (state.canUndo()) {
                    const newIndex = state.historyIndex - 1;
                    set({
                        funnel: state.history[newIndex],
                        historyIndex: newIndex,
                        selectedBlock: null,
                        isDirty: true,
                    });
                }
            },

            redo: () => {
                const state = get();
                if (state.canRedo()) {
                    const newIndex = state.historyIndex + 1;
                    set({
                        funnel: state.history[newIndex],
                        historyIndex: newIndex,
                        selectedBlock: null,
                        isDirty: true,
                    });
                }
            },

            canUndo: () => {
                const state = get();
                return state.historyIndex > 0;
            },

            canRedo: () => {
                const state = get();
                return state.historyIndex < state.history.length - 1;
            },

            // Persistence actions
            markDirty: () => set({ isDirty: true }),
            markClean: () => set({ isDirty: false }),
            setSaving: (saving) => set({ isSaving: saving }),

            // Reset
            resetFunnel: () => {
                const defaultFunnel = getDefaultFunnel();
                set({
                    funnel: defaultFunnel,
                    selectedBlock: null,
                    selectedDevice: 'desktop',
                    isDirty: false,
                    history: [defaultFunnel],
                    historyIndex: 0,
                });
            },
        }),
        { name: 'funnel-store' }
    )
);
