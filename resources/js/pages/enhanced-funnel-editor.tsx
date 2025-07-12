import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
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
    const [sections, setSections] = useState<LayoutSection[]>([]);
    const [selectedSection, setSelectedSection] = useState<LayoutSection | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<LayoutColumn | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
    
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
        sections,
        isDirty: false // Disable auto-save, handle saving manually
    });
    
    // Name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(funnel.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Initialize funnel from props
    useState(() => {
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
            
            // Set in funnel store
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
            
            // Also set in local state
            setSections(sectionsArray);
        }
    });

    // Update handlers only for block operations (sections are updated via onSectionsChange)

    const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
        // Handle block updates
        setSelectedBlock(prev => prev ? { ...prev, ...updates } : null);
        // Layout persistence hook will handle auto-save
    }, []);

    const handleBlockAdd = useCallback((sectionId: string, columnId: string, block: ContentBlock, index?: number) => {
        setSections(prev => prev.map(section => 
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
        ));
    }, []);

    const handleBlockDelete = useCallback((sectionId: string, columnId: string, blockId: string) => {
        setSections(prev => prev.map(section => 
            section.id === sectionId 
                ? {
                    ...section,
                    columns: section.columns.map(column =>
                        column.id === columnId 
                            ? { 
                                ...column, 
                                blocks: column.blocks.filter(block => block.id !== blockId)
                            } 
                            : column
                    )
                }
                : section
        ));
        // Clear selection if the deleted block was selected
        setSelectedBlock(prev => prev?.id === blockId ? null : prev);
    }, []);

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
                                sections={sections}
                                onSectionsChange={(updatedSections) => {
                                    // Update local state
                                    setSections(updatedSections);
                                    
                                    // Update store state by using the setSections action
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
                            <div className="text-center text-gray-500 py-32">
                                <Palette className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-medium mb-2">Design Mode</h3>
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
            
            <div className="h-screen flex flex-col bg-gray-50">
                {/* Top Toolbar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href={route('funnels.index')} 
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
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
                                    className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:px-2 focus:py-1 focus:rounded"
                                />
                            ) : (
                                <div 
                                    className="text-lg font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                    onClick={handleNameEdit}
                                    title="Click to edit funnel name"
                                >
                                    {funnel.name}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Editor Mode Tabs */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setEditorMode('editor')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        editorMode === 'editor' 
                                            ? 'bg-white text-blue-600 shadow' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Layout className="w-4 h-4" />
                                    <span>Editor</span>
                                </button>
                                <button
                                    onClick={() => setEditorMode('design')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        editorMode === 'design' 
                                            ? 'bg-white text-blue-600 shadow' 
                                            : 'text-gray-600 hover:text-gray-900'
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
                                    className={`p-2 transition-colors ${
                                        canUndo() 
                                            ? 'text-gray-600 hover:text-gray-900' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    title="Undo"
                                >
                                    <Undo className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={redo}
                                    disabled={!canRedo()}
                                    className={`p-2 transition-colors ${
                                        canRedo() 
                                            ? 'text-gray-600 hover:text-gray-900' 
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    title="Redo"
                                >
                                    <Redo className="w-4 h-4" />
                                </button>
                                <button 
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
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
                                                            sections: sections.map(section => ({
                                                                id: section.id,
                                                                type: section.type,
                                                                layout: section.layout,
                                                                settings: section.settings,
                                                                columns: section.columns.map(column => ({
                                                                    id: column.id,
                                                                    type: column.type,
                                                                    width: column.width,
                                                                    settings: column.settings,
                                                                    blocks: column.blocks.map(block => ({
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
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                        funnelStore.isSaving
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : isDirty
                                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                                : 'bg-green-600 text-white hover:bg-green-700'
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
                                    <div className="text-xs text-gray-500">
                                        Last saved: {lastSaved.toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex">
                    {/* Editor Content */}
                    <div className="flex-1">
                        {renderEditorContent()}
                    </div>

                    {/* Properties Panel */}
                    {/* <PropertiesPanel
                        selectedSection={selectedSection}
                        selectedColumn={selectedColumn}
                        selectedBlock={selectedBlock}
                        selectedDevice={selectedDevice}
                        onSectionUpdate={handleSectionUpdate}
                        onColumnUpdate={handleColumnUpdate}
                        onBlockUpdate={handleBlockUpdate}
                        onDeviceChange={setSelectedDevice}
                    /> */}
                </div>
            </div>
        </DndProvider>
    );
}
