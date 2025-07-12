import { create } from 'zustand';
import { z } from 'zod';

// Zod schemas for validation
export const BlockSchema = z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'button', 'form', 'video', 'code', 'map', 'testimonial', 'calendar', 'ecommerce', 'team', 'chart', 'audio', 'countdown', 'social', 'spacer', 'container', 'grid', 'tabs', 'accordion']),
    content: z.record(z.string(), z.unknown()), // Flexible content object
    settings: z.object({
        padding: z.string(),
        margin: z.string(),
        backgroundColor: z.string(),
        borderRadius: z.string(),
        animation: z.string().optional(),
    }),
});

export const ColumnSchema = z.object({
    id: z.string(),
    type: z.literal('column'),
    width: z.number(), // percentage
    blocks: z.array(BlockSchema),
    settings: z.object({
        padding: z.string(),
        backgroundColor: z.string(),
        verticalAlign: z.enum(['top', 'middle', 'bottom']),
    }),
});

export const SectionSchema = z.object({
    id: z.string(),
    type: z.enum(['section']),
    layout: z.enum(['single', 'two-column', 'three-column', 'two-column-66-33', 'two-column-33-66', 'four-column', 'custom']),
    columns: z.array(ColumnSchema),
    settings: z.object({
        backgroundColor: z.string(),
        padding: z.string(),
        margin: z.string(),
        minHeight: z.string(),
        fullWidth: z.boolean(),
        backgroundImage: z.string().optional(),
    }),
});

export const FunnelSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    content: z.object({
        sections: z.array(SectionSchema)
    }),
    settings: z.object({
        backgroundColor: z.string(),
        maxWidth: z.string(),
        fontFamily: z.string().optional(),
    }),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    is_published: z.boolean().default(false),
});

export type Block = z.infer<typeof BlockSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Funnel = z.infer<typeof FunnelSchema>;

interface FunnelStore {
    // State
    funnel: Funnel;
    selectedSection: Section | null;
    selectedColumn: Column | null;
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
    setSections: (sections: Section[]) => void;
    
    // Section actions
    addSection: (section: Section) => void;
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    deleteSection: (sectionId: string) => void;
    duplicateSection: (sectionId: string) => void;
    moveSection: (fromIndex: number, toIndex: number) => void;
    
    // Column actions
    updateColumn: (sectionId: string, columnId: string, updates: Partial<Column>) => void;
    
    // Block actions
    addBlock: (sectionId: string, columnId: string, block: Block, index?: number) => void;
    updateBlock: (sectionId: string, columnId: string, blockId: string, updates: Partial<Block>) => void;
    deleteBlock: (sectionId: string, columnId: string, blockId: string) => void;
    duplicateBlock: (sectionId: string, columnId: string, blockId: string) => void;
    moveBlock: (sectionId: string, columnId: string, fromIndex: number, toIndex: number) => void;
    
    // Selection actions
    selectSection: (section: Section | null) => void;
    selectColumn: (column: Column | null) => void;
    selectBlock: (block: Block | null) => void;
    selectDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
    
    // Drag and drop
    setDraggedBlock: (block: Block | null) => void;
    
    // History actions
    addToHistory: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    
    // Utility actions
    setSaving: (saving: boolean) => void;
    markClean: () => void;
    markDirty: () => void;
}

const getDefaultFunnel = (): Funnel => ({
    name: 'Untitled Funnel',
    description: '',
    content: {
        sections: []
    },
    settings: {
        backgroundColor: '#ffffff',
        maxWidth: '1200px',
        fontFamily: 'Inter, sans-serif',
    },
    status: 'draft',
    is_published: false,
});

export const useFunnelStore = create<FunnelStore>()(
    // Temporarily disable devtools to prevent storage issues
    // devtools(
        (set, get) => ({
            // Initial state
            funnel: getDefaultFunnel(),
            selectedSection: null,
            selectedColumn: null,
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

            // Section actions
            addSection: (section) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: [...state.funnel.content.sections, section]
                        }
                    };
                    return { 
                        funnel: updatedFunnel, 
                        selectedSection: section, 
                        isDirty: true 
                    };
                });
                // Add to history after state update
                setTimeout(() => get().addToHistory(), 0);
            },

            updateSection: (sectionId, updates) =>
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.map(section =>
                                section.id === sectionId ? { ...section, ...updates } : section
                            )
                        }
                    };
                    
                    const updatedSelectedSection = 
                        state.selectedSection?.id === sectionId
                            ? { ...state.selectedSection, ...updates }
                            : state.selectedSection;
                    
                    return { 
                        funnel: updatedFunnel, 
                        selectedSection: updatedSelectedSection,
                        isDirty: true 
                    };
                }),

            deleteSection: (sectionId) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.filter(section => 
                                section.id !== sectionId
                            )
                        }
                    };
                    
                    return { 
                        funnel: updatedFunnel,
                        selectedSection: state.selectedSection?.id === sectionId 
                            ? null 
                            : state.selectedSection,
                        isDirty: true 
                    };
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            duplicateSection: (sectionId) => {
                const sections = get().funnel.content.sections;
                const section = sections.find(s => s.id === sectionId);
                
                if (section) {
                    // Deep clone section with new IDs
                    const newId = `section-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                    const duplicatedSection = {
                        ...section,
                        id: newId,
                        columns: section.columns.map(column => ({
                            ...column,
                            id: `column-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                            blocks: column.blocks.map(block => ({
                                ...block,
                                id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
                            }))
                        }))
                    };
                    
                    // Find the index of the original section
                    const sectionIndex = sections.findIndex(s => s.id === sectionId);
                    
                    set((state) => {
                        const updatedSections = [...state.funnel.content.sections];
                        updatedSections.splice(sectionIndex + 1, 0, duplicatedSection);
                        
                        return {
                            funnel: {
                                ...state.funnel,
                                content: {
                                    sections: updatedSections
                                }
                            },
                            selectedSection: duplicatedSection,
                            isDirty: true
                        };
                    });
                    
                    setTimeout(() => get().addToHistory?.(), 0);
                }
            },

            moveSection: (fromIndex, toIndex) => {
                if (fromIndex === toIndex) return;
                
                set((state) => {
                    const sections = [...state.funnel.content.sections];
                    const [removed] = sections.splice(fromIndex, 1);
                    sections.splice(toIndex, 0, removed);
                    
                    return {
                        funnel: {
                            ...state.funnel,
                            content: {
                                sections
                            }
                        },
                        isDirty: true
                    };
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            // Column actions
            updateColumn: (sectionId, columnId, updates) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.map(section =>
                                section.id === sectionId
                                    ? {
                                        ...section,
                                        columns: section.columns.map(column =>
                                            column.id === columnId
                                                ? { ...column, ...updates }
                                                : column
                                        )
                                    }
                                    : section
                            )
                        }
                    };
                    
                    const updatedSelectedColumn = 
                        state.selectedColumn?.id === columnId
                            ? { ...state.selectedColumn, ...updates }
                            : state.selectedColumn;
                    
                    return {
                        funnel: updatedFunnel,
                        selectedColumn: updatedSelectedColumn,
                        isDirty: true
                    };
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            // Block actions
            addBlock: (sectionId, columnId, block, index) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.map(section =>
                                section.id === sectionId
                                    ? {
                                        ...section,
                                        columns: section.columns.map(column =>
                                            column.id === columnId
                                                ? {
                                                    ...column,
                                                    blocks: index !== undefined
                                                        ? [
                                                            ...column.blocks.slice(0, index),
                                                            block,
                                                            ...column.blocks.slice(index)
                                                        ]
                                                        : [...column.blocks, block]
                                                }
                                                : column
                                        )
                                    }
                                    : section
                            )
                        }
                    };
                    
                    return {
                        funnel: updatedFunnel,
                        selectedBlock: block,
                        isDirty: true
                    };
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            updateBlock: (sectionId, columnId, blockId, updates) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.map(section =>
                                section.id === sectionId
                                    ? {
                                        ...section,
                                        columns: section.columns.map(column =>
                                            column.id === columnId
                                                ? {
                                                    ...column,
                                                    blocks: column.blocks.map(block =>
                                                        block.id === blockId
                                                            ? { ...block, ...updates }
                                                            : block
                                                    )
                                                }
                                                : column
                                        )
                                    }
                                    : section
                            )
                        }
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
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            deleteBlock: (sectionId, columnId, blockId) => {
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.map(section =>
                                section.id === sectionId
                                    ? {
                                        ...section,
                                        columns: section.columns.map(column =>
                                            column.id === columnId
                                                ? {
                                                    ...column,
                                                    blocks: column.blocks.filter(block =>
                                                        block.id !== blockId
                                                    )
                                                }
                                                : column
                                        )
                                    }
                                    : section
                            )
                        }
                    };
                    
                    return {
                        funnel: updatedFunnel,
                        selectedBlock: state.selectedBlock?.id === blockId
                            ? null
                            : state.selectedBlock,
                        isDirty: true
                    };
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            duplicateBlock: (sectionId, columnId, blockId) => {
                const sections = get().funnel.content.sections;
                const section = sections.find(s => s.id === sectionId);
                
                if (section) {
                    const column = section.columns.find(c => c.id === columnId);
                    if (column) {
                        const block = column.blocks.find(b => b.id === blockId);
                        if (block) {
                            const duplicatedBlock = {
                                ...block,
                                id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
                            };
                            
                            const blockIndex = column.blocks.findIndex(b => b.id === blockId);
                            
                            set((state) => {
                                const updatedFunnel = {
                                    ...state.funnel,
                                    content: {
                                        sections: state.funnel.content.sections.map(section =>
                                            section.id === sectionId
                                                ? {
                                                    ...section,
                                                    columns: section.columns.map(column =>
                                                        column.id === columnId
                                                            ? {
                                                                ...column,
                                                                blocks: [
                                                                    ...column.blocks.slice(0, blockIndex + 1),
                                                                    duplicatedBlock,
                                                                    ...column.blocks.slice(blockIndex + 1)
                                                                ]
                                                            }
                                                            : column
                                                    )
                                                }
                                                : section
                                        )
                                    }
                                };
                                
                                return {
                                    funnel: updatedFunnel,
                                    selectedBlock: duplicatedBlock,
                                    isDirty: true
                                };
                            });
                            
                            setTimeout(() => get().addToHistory?.(), 0);
                        }
                    }
                }
            },

            moveBlock: (sectionId, columnId, fromIndex, toIndex) => {
                if (fromIndex === toIndex) return;
                
                set((state) => {
                    const updatedFunnel = {
                        ...state.funnel,
                        content: {
                            sections: state.funnel.content.sections.map(section =>
                                section.id === sectionId
                                    ? {
                                        ...section,
                                        columns: section.columns.map(column =>
                                            column.id === columnId
                                                ? (() => {
                                                    const blocks = [...column.blocks];
                                                    const [removed] = blocks.splice(fromIndex, 1);
                                                    blocks.splice(toIndex, 0, removed);
                                                    return {
                                                        ...column,
                                                        blocks
                                                    };
                                                })()
                                                : column
                                        )
                                    }
                                    : section
                            )
                        }
                    };
                    
                    return {
                        funnel: updatedFunnel,
                        isDirty: true
                    };
                });
                
                setTimeout(() => get().addToHistory?.(), 0);
            },

            // Selection actions
            selectSection: (section) => set({ selectedSection: section }),
            selectColumn: (column) => set({ selectedColumn: column }),
            selectBlock: (block) => set({ selectedBlock: block }),
            selectDevice: (device) => set({ selectedDevice: device }),

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
                if (state.historyIndex > 0) {
                    const newIndex = state.historyIndex - 1;
                    set({
                        funnel: state.history[newIndex],
                        historyIndex: newIndex,
                        selectedSection: null,
                        selectedColumn: null,
                        selectedBlock: null,
                        isDirty: true,
                    });
                }
            },

            redo: () => {
                const state = get();
                if (state.historyIndex < state.history.length - 1) {
                    const newIndex = state.historyIndex + 1;
                    set({
                        funnel: state.history[newIndex],
                        historyIndex: newIndex,
                        selectedSection: null,
                        selectedColumn: null,
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

            // Utility function for sections
            setSections: (sections) => {
                set((state) => ({
                    funnel: {
                        ...state.funnel,
                        content: { sections }
                    },
                    isDirty: true,
                }));
                
                setTimeout(() => get().addToHistory(), 0);
            },
        })
        // { 
        //     name: 'funnel-store',
        //     serialize: false, // Disable serialization to prevent storage issues
        //     trace: false, // Disable trace to reduce overhead
        // }
    // )
);
