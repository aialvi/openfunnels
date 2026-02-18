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
    ArrowLeft
} from 'lucide-react';
import LayoutBuilder, { LayoutSection, LayoutColumn } from '@/components/editor/LayoutBuilder';
import ContentBlockLibrary, { ContentBlock } from '@/components/editor/ContentBlockLibrary';
import PropertiesPanel from '@/components/editor/PropertiesPanel';

// ... (existing imports)
import { useFunnelStore, type Funnel } from '@/stores/funnelStore';
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

    // Layout builder state
    const [selectedSection, setSelectedSection] = useState<LayoutSection | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<LayoutColumn | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Content block library state
    const [blockSearchQuery, setBlockSearchQuery] = useState('');
    const [blockCategory, setBlockCategory] = useState('All');

    // Funnel store
    // Get store references
    const funnelStore = useFunnelStore();
    const {
        funnel,
        isDirty,
        setFunnel,
        updateFunnelName,
        undo,
        redo,
        canUndo,
        canRedo,
        markClean,
        setSaving,
    } = funnelStore;

    // Auto-save functionality (disabled since we handle saving manually)
    const {
        lastSaved
    } = useLayoutPersistence({
        funnelId: initialFunnel?.id,
        sections: funnel.content.sections as LayoutSection[],
        isDirty: false // Disable auto-save, handle saving manually
    });

    // Name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(funnel.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Initialize funnel from props — runs once on mount.
    useEffect(() => {
        if (initialFunnel) {
            // Parse content object from JSON if needed
            let contentObj;
            try {
                contentObj = typeof initialFunnel.content === 'string'
                    ? JSON.parse(initialFunnel.content as string)
                    : initialFunnel.content;
            } catch (e) {
                console.error('Error parsing content JSON:', e);
                contentObj = { sections: [] };
            }

            // Ensure we have a proper sections array
            const sectionsArray = contentObj?.sections || [];

            // Set in funnel store (single source of truth)
            setFunnel({
                id: initialFunnel.id,
                name: initialFunnel.name,
                description: initialFunnel.description || '',
                content: {
                    sections: sectionsArray
                },
                settings: initialFunnel.settings,
                status: initialFunnel.status as 'draft' | 'published' | 'archived',
                is_published: initialFunnel.is_published,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update handlers only for block operations (sections are updated via onSectionsChange)

    const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
        // Handle block updates
        setSelectedBlock(prev => prev ? { ...prev, ...updates } : null);
        // Layout persistence hook will handle auto-save
    }, []);

    const handleBlockAdd = useCallback((sectionId: string, columnId: string, block: ContentBlock, index?: number) => {
        // Delegate to the store — single source of truth.
        funnelStore.addBlock(sectionId, columnId, block as import('@/stores/funnelStore').Block, index);
    }, [funnelStore]);

    const handleBlockDelete = useCallback((sectionId: string, columnId: string, blockId: string) => {
        // Delegate to the store — single source of truth.
        funnelStore.deleteBlock(sectionId, columnId, blockId);
        // Clear selection if the deleted block was selected
        setSelectedBlock(prev => prev?.id === blockId ? null : prev);
    }, [funnelStore]);

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
                                sections={funnel.content.sections as LayoutSection[]}
                                onSectionsChange={(updatedSections) => {
                                    // Single write path: store is the source of truth.
                                    funnelStore.setSections?.(updatedSections);
                                }}
                                selectedSection={selectedSection}
                                onSelectSection={setSelectedSection}
                                selectedColumn={selectedColumn}
                                onSelectColumn={setSelectedColumn}
                                selectedBlock={selectedBlock}
                                onSelectBlock={setSelectedBlock}
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
                                    className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 text-foreground"
                                    title="Preview funnel"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setSaving(true);

                                            // Create a unified save that combines funnel data and layout
                                            if (initialFunnel?.id) {
                                                await new Promise<void>((resolve, reject) => {
                                                    router.patch(`/funnels/${initialFunnel.id}`, {
                                                        name: funnel.name,
                                                        description: funnel.description,
                                                        content: JSON.stringify({
                                                            sections: funnel.content.sections.map((section: import('@/stores/funnelStore').Section) => ({
                                                                id: section.id,
                                                                type: section.type,
                                                                layout: section.layout,
                                                                settings: section.settings,
                                                                columns: section.columns.map((column: import('@/stores/funnelStore').Column) => ({
                                                                    id: column.id,
                                                                    type: column.type,
                                                                    width: column.width,
                                                                    settings: column.settings,
                                                                    blocks: column.blocks.map((block: import('@/stores/funnelStore').Block) => ({
                                                                        id: block.id,
                                                                        type: block.type,
                                                                        content: block.content,
                                                                        settings: block.settings
                                                                    }))
                                                                }))
                                                            }))
                                                        }),
                                                        settings: JSON.stringify(funnel.settings)
                                                    }, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                        onSuccess: () => {
                                                            console.log('Funnel and layout saved successfully');
                                                            markClean(); // Mark store as clean
                                                            resolve();
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Failed to save:', errors);
                                                            reject(new Error('Failed to save funnel and layout'));
                                                        }
                                                    });
                                                });
                                            }
                                        } catch (error) {
                                            console.error('Failed to save:', error);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={funnelStore.isSaving}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${funnelStore.isSaving
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : isDirty
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'bg-chart-2 text-white hover:bg-chart-2/90'
                                        }`}
                                    title={isDirty ? "Save changes" : "All changes saved"}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {funnelStore.isSaving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
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
                    {/* Properties Panel */}
                    <PropertiesPanel // @ts-ignore
                        selectedSection={selectedSection}
                        selectedColumn={selectedColumn}
                        selectedBlock={selectedBlock}
                        selectedDevice={selectedDevice}
                        onSectionUpdate={(sectionId, updates) => {
                            const newSections = funnel.content.sections.map((s: any) =>
                                s.id === sectionId ? { ...s, ...updates } : s
                            );
                            funnelStore.setSections?.(newSections);
                        }}
                        onColumnUpdate={(sectionId, columnId, updates) => {
                            const newSections = funnel.content.sections.map((s: any) =>
                                s.id === sectionId ? {
                                    ...s,
                                    columns: s.columns.map((c: any) =>
                                        c.id === columnId ? { ...c, ...updates } : c
                                    )
                                } : s
                            );
                            funnelStore.setSections?.(newSections);
                        }}
                        onBlockUpdate={handleBlockUpdate}
                        onDeviceChange={setSelectedDevice}
                    />
                </div>
            </div>
        </DndProvider>
    );
}
