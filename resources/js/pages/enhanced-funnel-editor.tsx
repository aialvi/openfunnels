import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Save,
    Eye,
    Undo,
    Redo,
    Layout,
    Palette,
    ArrowLeft,
    Download
} from 'lucide-react';
import ExportModal from '@/components/editor/ExportModal';
import LayoutBuilder from '@/components/editor/LayoutBuilder';
import ContentBlockLibrary from '@/components/editor/ContentBlockLibrary';
import PropertiesPanel from '@/components/editor/PropertiesPanel';

import {
    useFunnelStore,
    getSelectedSection,
    getSelectedColumn,
    getSelectedBlock,
    findBlockLocation,
    findColumnSection,
} from '@/stores/funnelStore';
import type { Funnel, Section, Block } from '@/types/editor';
import { useLayoutPersistence } from '@/hooks/useLayoutPersistence';

interface EnhancedFunnelEditorProps {
    funnel?: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        content: Record<string, unknown>;
        settings: Funnel['settings'];
        status: string;
        is_published: boolean;
    };
}

type EditorMode = 'editor' | 'design';

export default function EnhancedFunnelEditor({ funnel: initialFunnel }: EnhancedFunnelEditorProps) {
    // Editor state
    const [editorMode, setEditorMode] = useState<EditorMode>('editor');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Content block library state
    const [blockSearchQuery, setBlockSearchQuery] = useState('');
    const [blockCategory, setBlockCategory] = useState('All');

    // ── Store ─────────────────────────────────────────────────────────
    const funnel = useFunnelStore((s) => s.funnel);
    const isDirty = useFunnelStore((s) => s.isDirty);
    const isSaving = useFunnelStore((s) => s.isSaving);
    const selectedDevice = useFunnelStore((s) => s.selectedDevice);

    // Derived selections — always fresh from the live tree.
    const selectedSection = useFunnelStore(getSelectedSection);
    const selectedColumn = useFunnelStore(getSelectedColumn);
    const selectedBlock = useFunnelStore(getSelectedBlock);

    // Actions (stable references, won't cause re-renders)
    const setFunnel = useFunnelStore((s) => s.setFunnel);
    const updateFunnelName = useFunnelStore((s) => s.updateFunnelName);
    const undo = useFunnelStore((s) => s.undo);
    const redo = useFunnelStore((s) => s.redo);
    const canUndo = useFunnelStore((s) => s.canUndo);
    const canRedo = useFunnelStore((s) => s.canRedo);
    const markClean = useFunnelStore((s) => s.markClean);
    const setSaving = useFunnelStore((s) => s.setSaving);
    const selectSection = useFunnelStore((s) => s.selectSection);
    const selectColumn = useFunnelStore((s) => s.selectColumn);
    const selectBlock = useFunnelStore((s) => s.selectBlock);
    const selectDevice = useFunnelStore((s) => s.selectDevice);
    const setSections = useFunnelStore((s) => s.setSections);
    const addBlockAction = useFunnelStore((s) => s.addBlock);
    const updateBlockAction = useFunnelStore((s) => s.updateBlock);
    const deleteBlockAction = useFunnelStore((s) => s.deleteBlock);
    const updateSectionAction = useFunnelStore((s) => s.updateSection);
    const updateColumnAction = useFunnelStore((s) => s.updateColumn);

    // Auto-save functionality (disabled since we handle saving manually)
    const {
        lastSaved
    } = useLayoutPersistence({
        funnelId: initialFunnel?.id,
        sections: funnel.content.sections,
        isDirty: false // Disable auto-save, handle saving manually
    });

    // Name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(funnel.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Initialize funnel from props — runs once on mount.
    useEffect(() => {
        if (initialFunnel) {
            let contentObj;
            try {
                contentObj = typeof initialFunnel.content === 'string'
                    ? JSON.parse(initialFunnel.content as string)
                    : initialFunnel.content;
            } catch (e) {
                console.error('Error parsing content JSON:', e);
                contentObj = { sections: [] };
            }

            const sectionsArray = contentObj?.sections || [];

            setFunnel({
                id: initialFunnel.id,
                name: initialFunnel.name,
                description: initialFunnel.description || '',
                content: { sections: sectionsArray },
                settings: initialFunnel.settings,
                status: initialFunnel.status as 'draft' | 'published' | 'archived',
                is_published: initialFunnel.is_published,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────

    const handleBlockAdd = useCallback((sectionId: string, columnId: string, block: Block, index?: number) => {
        addBlockAction(sectionId, columnId, block, index);
    }, [addBlockAction]);

    const handleBlockUpdate = useCallback((blockId: string, updates: Partial<Block>) => {
        // Find the block location in the tree and write updates to the store.
        const state = useFunnelStore.getState();
        const loc = findBlockLocation(state, blockId);
        if (loc) {
            updateBlockAction(loc.sectionId, loc.columnId, blockId, updates);
        }
    }, [updateBlockAction]);

    const handleBlockDelete = useCallback((sectionId: string, columnId: string, blockId: string) => {
        deleteBlockAction(sectionId, columnId, blockId);
    }, [deleteBlockAction]);

    // Name editing handlers
    const handleNameEdit = () => {
        setIsEditingName(true);
        setTempName(funnel.name);
        setTimeout(() => {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }, 0);
    };

    const handleNameSave = () => {
        if (tempName.trim() && tempName !== funnel.name) {
            updateFunnelName(tempName.trim());
        }
        setIsEditingName(false);
    };

    const handleNameCancel = () => {
        setTempName(funnel.name);
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            handleNameCancel();
        }
    };

    // Render editor mode content
    const renderEditorContent = () => {
        switch (editorMode) {
            case 'editor':
                return (
                    <div className="flex h-full">
                        {/* Main Canvas with LayoutBuilder */}
                        <div className="flex-1">
                            <LayoutBuilder
                                sections={funnel.content.sections}
                                onSectionsChange={(updatedSections) => {
                                    setSections(updatedSections);
                                }}
                                selectedSectionId={selectedSection?.id ?? null}
                                onSelectSection={(sectionId) => selectSection(sectionId)}
                                selectedColumnId={selectedColumn?.id ?? null}
                                onSelectColumn={(columnId) => selectColumn(columnId)}
                                selectedBlockId={selectedBlock?.id ?? null}
                                onSelectBlock={(blockId) => selectBlock(blockId)}
                                onBlockAdd={handleBlockAdd}
                                onBlockUpdate={handleBlockUpdate}
                                onBlockDelete={handleBlockDelete}
                            />
                        </div>

                        {/* Content Block Library Sidebar */}
                        <ContentBlockLibrary
                            searchQuery={blockSearchQuery}
                            onSearchChange={setBlockSearchQuery}
                            selectedCategory={blockCategory}
                            onCategoryChange={setBlockCategory}
                        />
                    </div>
                );

            case 'design':
                return (
                    <div className="flex h-full">
                        <div className="flex-1 p-4">
                            <div className="text-center text-muted-foreground py-32">
                                <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                <h3 className="text-xl font-medium mb-2 text-foreground">Design Mode</h3>
                                <p className="text-sm">Advanced styling and animation controls coming soon</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Head title={`Edit: ${funnel.name} - OpenFunnels`} />

            <div className="h-screen flex flex-col bg-background">
                {/* Top Toolbar */}
                <div className="bg-card border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('funnels.index')}
                                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Funnels</span>
                            </Link>

                            {isEditingName ? (
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={handleNameKeyDown}
                                    className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-muted focus:border focus:border-primary focus:px-2 focus:py-1 focus:rounded text-foreground"
                                />
                            ) : (
                                <div
                                    className="text-lg font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors text-foreground"
                                    onClick={handleNameEdit}
                                    title="Click to edit funnel name"
                                >
                                    {funnel.name}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Editor Mode Tabs */}
                            <div className="flex items-center bg-muted rounded-lg p-1">
                                <button
                                    onClick={() => setEditorMode('editor')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${editorMode === 'editor'
                                        ? 'bg-background text-primary shadow'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Layout className="w-4 h-4" />
                                    <span>Editor</span>
                                </button>
                                <button
                                    onClick={() => setEditorMode('design')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${editorMode === 'design'
                                        ? 'bg-background text-primary shadow'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Palette className="w-4 h-4" />
                                    <span>Design</span>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={undo}
                                    disabled={!canUndo()}
                                    className={`p-2 transition-colors ${canUndo()
                                        ? 'text-muted-foreground hover:text-foreground'
                                        : 'text-muted-foreground/50 cursor-not-allowed'
                                        }`}
                                    title="Undo"
                                >
                                    <Undo className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={!canRedo()}
                                    className={`p-2 transition-colors ${canRedo()
                                        ? 'text-muted-foreground hover:text-foreground'
                                        : 'text-muted-foreground/50 cursor-not-allowed'
                                        }`}
                                    title="Redo"
                                >
                                    <Redo className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (initialFunnel?.id) {
                                            window.open(`/funnel/${initialFunnel.id}/preview`, '_blank');
                                        }
                                    }}
                                    disabled={!initialFunnel?.id}
                                    className={`flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg text-foreground transition-colors ${!initialFunnel?.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/80'
                                        }`}
                                    title={initialFunnel?.id ? "Preview funnel" : "Save the funnel first to preview"}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 text-foreground"
                                    title="Export funnel code"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setSaving(true);

                                            await new Promise<void>((resolve, reject) => {
                                                const currentFunnel = useFunnelStore.getState().funnel;
                                                const payload = {
                                                    name: currentFunnel.name,
                                                    description: currentFunnel.description,
                                                    content: JSON.stringify({
                                                        sections: currentFunnel.content.sections.map((section: Section) => ({
                                                            id: section.id,
                                                            type: section.type,
                                                            layout: section.layout,
                                                            settings: section.settings,
                                                            columns: section.columns.map((column) => ({
                                                                id: column.id,
                                                                type: column.type,
                                                                width: column.width,
                                                                settings: column.settings,
                                                                blocks: column.blocks.map((block) => ({
                                                                    id: block.id,
                                                                    type: block.type,
                                                                    content: block.content,
                                                                    settings: block.settings
                                                                }))
                                                            }))
                                                        }))
                                                    }),
                                                    settings: JSON.stringify(currentFunnel.settings)
                                                };

                                                if (initialFunnel?.id) {
                                                    router.put(`/funnels/${initialFunnel.id}`, payload, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                        onSuccess: () => {
                                                            markClean();
                                                            resolve();
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Failed to update:', errors);
                                                            reject(new Error('Failed to update funnel'));
                                                        }
                                                    });
                                                } else {
                                                    router.post(`/funnels`, payload, {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            markClean();
                                                            resolve();
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Failed to create:', errors);
                                                            reject(new Error('Failed to create funnel'));
                                                        }
                                                    });
                                                }
                                            });
                                        } catch (error) {
                                            console.error('Save error:', error);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={isSaving}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isSaving
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : isDirty
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'bg-chart-2 text-white hover:bg-chart-2/90'
                                        }`}
                                    title={isDirty ? "Save changes" : "All changes saved"}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {isSaving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
                                    </span>
                                </button>

                                {/* Save Status */}
                                {lastSaved && (
                                    <div className="text-xs text-muted-foreground">
                                        Last saved: {lastSaved.toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Content */}
                    <div className="flex-1">
                        {renderEditorContent()}
                    </div>

                    {/* Properties Panel */}
                    <PropertiesPanel
                        selectedSection={selectedSection}
                        selectedColumn={selectedColumn}
                        selectedBlock={selectedBlock}
                        selectedDevice={selectedDevice}
                        onSectionUpdate={(sectionId, updates) => {
                            updateSectionAction(sectionId, updates);
                        }}
                        onColumnUpdate={(sectionId, columnId, updates) => {
                            updateColumnAction(sectionId, columnId, updates);
                        }}
                        onBlockUpdate={handleBlockUpdate}
                        onDeviceChange={selectDevice}
                    />
                </div>
            </div>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                funnel={funnel}
            />
        </DndProvider>
    );
}
