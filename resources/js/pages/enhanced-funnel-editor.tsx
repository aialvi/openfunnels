import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
    Save, 
    Eye, 
    Undo,
    Redo,
    Layout,
    Blocks,
    Palette,
    ArrowLeft
} from 'lucide-react';
import LayoutBuilder, { LayoutSection, LayoutColumn } from '@/components/editor/LayoutBuilder';
import ContentBlockLibrary, { ContentBlock } from '@/components/editor/ContentBlockLibrary';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import { useFunnelStore, type Funnel } from '@/stores/funnelStore';
import { useFunnelPersistence } from '@/hooks/useFunnelPersistence';

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

type EditorMode = 'layout' | 'content' | 'design';

export default function EnhancedFunnelEditor({ funnel: initialFunnel }: EnhancedFunnelEditorProps) {
    // Editor state
    const [editorMode, setEditorMode] = useState<EditorMode>('layout');
    const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    
    // Layout builder state
    const [sections, setSections] = useState<LayoutSection[]>([]);
    const [selectedSection, setSelectedSection] = useState<LayoutSection | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<LayoutColumn | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
    
    // Content block library state
    const [blockSearchQuery, setBlockSearchQuery] = useState('');
    const [blockCategory, setBlockCategory] = useState('All');
    
    // Funnel store
    const {
        funnel,
        isDirty,
        setFunnel,
        updateFunnelName,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useFunnelStore();

    // Auto-save functionality
    const { saveFunnel, isSaving } = useFunnelPersistence(initialFunnel?.id);
    
    // Name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(funnel.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Initialize funnel from props
    useState(() => {
        if (initialFunnel) {
            setFunnel({
                id: initialFunnel.id,
                name: initialFunnel.name,
                description: initialFunnel.description || '',
                content: Array.isArray(initialFunnel.content) ? initialFunnel.content : [],
                settings: initialFunnel.settings,
                status: initialFunnel.status as 'draft' | 'published' | 'archived',
                is_published: initialFunnel.is_published,
            });
            
            // Convert existing content to sections if needed
            if (initialFunnel.content && Array.isArray(initialFunnel.content)) {
                // This would convert old block-based content to new section-based layout
                // For now, start with empty sections
                setSections([]);
            }
        }
    });

    // Update handlers
    const handleSectionUpdate = useCallback((sectionId: string, updates: Partial<LayoutSection>) => {
        setSections(prev => prev.map(section => 
            section.id === sectionId ? { ...section, ...updates } : section
        ));
    }, []);

    const handleColumnUpdate = useCallback((sectionId: string, columnId: string, updates: Partial<LayoutColumn>) => {
        setSections(prev => prev.map(section => 
            section.id === sectionId 
                ? {
                    ...section,
                    columns: section.columns.map(column =>
                        column.id === columnId ? { ...column, ...updates } : column
                    )
                }
                : section
        ));
    }, []);

    const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
        // Handle block updates
        setSelectedBlock(prev => prev ? { ...prev, ...updates } : null);
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

    // Device width helper
    const getDeviceWidth = () => {
        switch (selectedDevice) {
            case 'mobile':
                return '375px';
            case 'tablet':
                return '768px';
            case 'desktop':
            default:
                return '100%';
        }
    };

    // Render editor mode content
    const renderEditorContent = () => {
        switch (editorMode) {
            case 'layout':
                return (
                    <LayoutBuilder
                        sections={sections}
                        onSectionsChange={setSections}
                        selectedSection={selectedSection}
                        onSelectSection={setSelectedSection}
                    />
                );
            
            case 'content':
                return (
                    <div className="flex h-full">
                        {/* Canvas with sections */}
                        <div className="flex-1 p-4">
                            <div 
                                className="bg-white shadow-lg mx-auto"
                                style={{ 
                                    width: getDeviceWidth(),
                                    maxWidth: funnel.settings.maxWidth,
                                    backgroundColor: funnel.settings.backgroundColor 
                                }}
                            >
                                {sections.length === 0 ? (
                                    <div className="flex items-center justify-center h-96 text-gray-500">
                                        <div className="text-center">
                                            <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <h3 className="text-xl font-medium mb-2">No Layout Yet</h3>
                                            <p className="text-sm mb-4">Switch to Layout mode to create your page structure first</p>
                                            <button
                                                onClick={() => setEditorMode('layout')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Go to Layout Mode
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sections.map((section) => (
                                            <div
                                                key={section.id}
                                                className="border border-gray-200"
                                                style={{
                                                    backgroundColor: section.settings.backgroundColor,
                                                    padding: section.settings.padding,
                                                    margin: section.settings.margin,
                                                    minHeight: section.settings.minHeight,
                                                }}
                                            >
                                                <div className="flex h-full">
                                                    {section.columns.map((column) => (
                                                        <div
                                                            key={column.id}
                                                            className="border border-dashed border-gray-300 min-h-[100px] relative"
                                                            style={{
                                                                width: `${column.width}%`,
                                                                padding: column.settings.padding,
                                                                backgroundColor: column.settings.backgroundColor,
                                                            }}
                                                            onClick={() => setSelectedColumn(column)}
                                                        >
                                                            {column.blocks.length === 0 ? (
                                                                <div className="text-gray-400 text-center p-8">
                                                                    <Blocks className="w-8 h-8 mx-auto mb-2" />
                                                                    <p className="text-sm">Drop content blocks here</p>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    {/* Render actual blocks here */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Block Library */}
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
                                    onClick={() => setEditorMode('layout')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        editorMode === 'layout' 
                                            ? 'bg-white text-blue-600 shadow' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Layout className="w-4 h-4" />
                                    <span>Layout</span>
                                </button>
                                <button
                                    onClick={() => setEditorMode('content')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        editorMode === 'content' 
                                            ? 'bg-white text-blue-600 shadow' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Blocks className="w-4 h-4" />
                                    <span>Content</span>
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
                                            await saveFunnel();
                                        } catch (error) {
                                            console.error('Failed to save funnel:', error);
                                        }
                                    }}
                                    disabled={isSaving}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                        isSaving 
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : isDirty
                                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {isSaving 
                                            ? 'Saving...' 
                                            : isDirty 
                                                ? 'Save Changes' 
                                                : 'Save'
                                        }
                                    </span>
                                </button>
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
                    <PropertiesPanel
                        selectedSection={selectedSection}
                        selectedColumn={selectedColumn}
                        selectedBlock={selectedBlock}
                        selectedDevice={selectedDevice}
                        onSectionUpdate={handleSectionUpdate}
                        onColumnUpdate={handleColumnUpdate}
                        onBlockUpdate={handleBlockUpdate}
                        onDeviceChange={setSelectedDevice}
                    />
                </div>
            </div>
        </DndProvider>
    );
}
