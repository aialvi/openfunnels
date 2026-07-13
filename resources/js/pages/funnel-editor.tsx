import PreviewModal from '@/components/PreviewModal';
import { useFunnelPersistence } from '@/hooks/useFunnelPersistence';
import { useFunnelStore, type Block, type Funnel } from '@/stores/funnelStore';
import { Head, Link } from '@inertiajs/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Eye, FileText, Image, Layers, Monitor, Plus, Redo, Save, Settings, Smartphone, Square, Tablet, Trash2, Type, Undo } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(Draggable);

interface FunnelEditorProps {
    funnel?: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        content: Block[];
        settings: Funnel['settings'];
        status: string;
        is_published: boolean;
        public_url?: string | null;
    };
}

export default function FunnelEditor({ funnel: initialFunnel }: FunnelEditorProps) {
    const {
        funnel,
        selectedBlock,
        selectedDevice,
        isDirty,
        setFunnel,
        setSelectedBlock,
        setSelectedDevice,
        addBlock,
        updateBlockContent,
        updateBlockPosition,
        deleteBlock,
        updateFunnelName,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useFunnelStore();

    // Auto-save functionality
    const { saveFunnel, isSaving } = useFunnelPersistence(initialFunnel?.id);

    // Local state for inline name editing
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(funnel.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Preview modal state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const draggableInstancesRef = useRef<Draggable[]>([]);

    // Initialize funnel from props if editing existing funnel
    useEffect(() => {
        if (initialFunnel) {
            setFunnel({
                id: initialFunnel.id,
                name: initialFunnel.name,
                description: initialFunnel.description || '',
                content: initialFunnel.content,
                settings: initialFunnel.settings,
                status: initialFunnel.status as 'draft' | 'published' | 'archived',
                is_published: initialFunnel.is_published,
                public_url: initialFunnel.public_url,
            });
        }
    }, [initialFunnel, setFunnel]);

    // Sync temp name when funnel name changes
    useEffect(() => {
        setTempName(funnel.name);
    }, [funnel.name]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + P to open preview
            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                setIsPreviewOpen(true);
            }
            // Cmd/Ctrl + S to save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveFunnel();
            }
            // Escape to close preview
            if (e.key === 'Escape' && isPreviewOpen) {
                setIsPreviewOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isPreviewOpen, saveFunnel]);

    // Initialize GSAP Draggable for blocks
    useEffect(() => {
        if (canvasRef.current) {
            // Clean up existing draggable instances
            draggableInstancesRef.current.forEach((instance) => instance.kill());
            draggableInstancesRef.current = [];

            const blocks = canvasRef.current.querySelectorAll('.draggable-block');
            const instances = Draggable.create(blocks, {
                bounds: canvasRef.current,
                edgeResistance: 0.65,
                type: 'x,y',
                onDrag: function () {
                    const blockId = this.target.dataset.blockId;
                    if (blockId) {
                        updateBlockPosition(blockId, { x: this.x, y: this.y });
                    }
                },
                onDragEnd: function () {
                    // Add to history after drag is complete
                    useFunnelStore.getState().addToHistory();
                },
            });

            draggableInstancesRef.current = instances;
        }

        return () => {
            draggableInstancesRef.current.forEach((instance) => instance.kill());
        };
    }, [funnel.content, updateBlockPosition]);

    const handleNameEdit = () => {
        setIsEditingName(true);
        setTempName(funnel.name);
        // Focus the input after state update
        setTimeout(() => {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }, 0);
    };

    const handleNameSave = async () => {
        if (tempName.trim() && tempName !== funnel.name) {
            console.log('Updating funnel name to:', tempName.trim());

            // Update the funnel name in the store
            updateFunnelName(tempName.trim());

            // The auto-save will handle saving to backend
            // or user can click Save button manually
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

    const renderBlock = (block: Block) => {
        const commonProps = {
            'data-block-id': block.id,
            className: `draggable-block absolute cursor-move border-2 min-w-[100px] min-h-[40px] ${
                selectedBlock?.id === block.id ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
            }`,
            style: {
                left: block.position.x,
                top: block.position.y,
                fontSize: (block.content.fontSize as string) || '16px',
                color: (block.content.color as string) || '#000000',
                backgroundColor: (block.content.backgroundColor as string) || 'transparent',
                padding: (block.content.padding as string) || '8px',
                borderRadius: (block.content.borderRadius as string) || '0px',
            },
            onClick: () => setSelectedBlock(block),
        };

        switch (block.type) {
            case 'text':
                return (
                    <div key={block.id} {...commonProps}>
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockContent(block.id, { text: e.target.textContent || '' })}
                            style={{ outline: 'none' }}
                        >
                            {(block.content.text as string) || 'Enter text here'}
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div key={block.id} {...commonProps}>
                        <img
                            src={(block.content.src as string) || 'https://via.placeholder.com/300x200?text=Image'}
                            alt={(block.content.alt as string) || 'Image'}
                            className="h-auto max-w-full"
                            style={{
                                borderRadius: (block.content.borderRadius as string) || '8px',
                                width: (block.content.width as string) || '300px',
                                height: (block.content.height as string) || '200px',
                            }}
                        />
                    </div>
                );
            case 'button':
                return (
                    <button key={block.id} {...commonProps} className={`${commonProps.className} px-4 py-2 font-medium`}>
                        {(block.content.text as string) || 'Click Me'}
                    </button>
                );
            case 'form':
                return (
                    <div key={block.id} {...commonProps} className={`${commonProps.className} min-w-64`}>
                        <div className="space-y-4">
                            <h3 className="font-semibold">{(block.content.title as string) || 'Subscribe to our newsletter'}</h3>
                            <input
                                type="email"
                                placeholder={(block.content.placeholder as string) || 'Enter your email'}
                                className="w-full rounded border border-gray-300 p-2"
                            />
                            <button className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
                                {(block.content.buttonText as string) || 'Subscribe'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Funnel Editor - OpenFunnels" />

            <div className="flex h-screen bg-gray-50">
                {/* Left Sidebar - Block Library */}
                <div ref={sidebarRef} className="w-64 border-r border-gray-200 bg-white p-4">
                    <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Block Library</h2>
                        <div className="space-y-3">
                            <div
                                className="flex cursor-pointer items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                onClick={() => addBlock('text')}
                            >
                                <Type className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium">Text Block</span>
                            </div>
                            <div
                                className="flex cursor-pointer items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                onClick={() => addBlock('image')}
                            >
                                <Image className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium">Image Block</span>
                            </div>
                            <div
                                className="flex cursor-pointer items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                onClick={() => addBlock('button')}
                            >
                                <Square className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium">Button Block</span>
                            </div>
                            <div
                                className="flex cursor-pointer items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                onClick={() => addBlock('form')}
                            >
                                <FileText className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium">Form Block</span>
                            </div>
                        </div>
                    </div>

                    {/* Layers Panel */}
                    <div className="mb-6">
                        <h3 className="mb-3 flex items-center text-sm font-semibold text-gray-900">
                            <Layers className="mr-2 h-4 w-4" />
                            Layers
                        </h3>
                        <div className="space-y-1">
                            {funnel.content.map((block: Block) => (
                                <div
                                    key={block.id}
                                    className={`flex cursor-pointer items-center justify-between rounded p-2 text-sm ${
                                        selectedBlock?.id === block.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => setSelectedBlock(block)}
                                >
                                    <span className="capitalize">{block.type} Block</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteBlock(block.id);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            {funnel.content.length === 0 && <p className="text-xs text-gray-500">No blocks added yet</p>}
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex flex-1 flex-col">
                    {/* Top Toolbar */}
                    <div className="border-b border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={route('dashboard')} className="text-gray-600 hover:text-gray-900">
                                    ← Back to Dashboard
                                </Link>
                                {isEditingName ? (
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={handleNameSave}
                                        onKeyDown={handleNameKeyDown}
                                        className="border-none bg-transparent text-lg font-semibold outline-none focus:rounded focus:border focus:border-blue-500 focus:bg-white focus:px-2 focus:py-1"
                                        autoFocus
                                    />
                                ) : (
                                    <div
                                        className="cursor-pointer rounded px-2 py-1 text-lg font-semibold transition-colors hover:bg-gray-100"
                                        onClick={handleNameEdit}
                                        title="Click to edit funnel name"
                                    >
                                        {funnel.name}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Device Selection */}
                                <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
                                    <button
                                        onClick={() => setSelectedDevice('desktop')}
                                        className={`rounded p-2 ${selectedDevice === 'desktop' ? 'bg-white shadow' : ''}`}
                                    >
                                        <Monitor className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedDevice('tablet')}
                                        className={`rounded p-2 ${selectedDevice === 'tablet' ? 'bg-white shadow' : ''}`}
                                    >
                                        <Tablet className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedDevice('mobile')}
                                        className={`rounded p-2 ${selectedDevice === 'mobile' ? 'bg-white shadow' : ''}`}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={undo}
                                        disabled={!canUndo()}
                                        className={`p-2 transition-colors ${
                                            canUndo() ? 'text-gray-600 hover:text-gray-900' : 'cursor-not-allowed text-gray-300'
                                        }`}
                                    >
                                        <Undo className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={redo}
                                        disabled={!canRedo()}
                                        className={`p-2 transition-colors ${
                                            canRedo() ? 'text-gray-600 hover:text-gray-900' : 'cursor-not-allowed text-gray-300'
                                        }`}
                                    >
                                        <Redo className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsPreviewOpen(true)}
                                        className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
                                        title="Preview funnel (Cmd/Ctrl + P)"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Preview</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await saveFunnel();
                                                console.log('Funnel saved successfully!');
                                            } catch (error) {
                                                console.error('Failed to save funnel:', error);
                                            }
                                        }}
                                        disabled={isSaving}
                                        className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                                            isSaving
                                                ? 'cursor-not-allowed bg-gray-400 text-gray-200'
                                                : isDirty
                                                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>{isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'Save'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 overflow-auto bg-gray-100 p-8">
                        <div className="flex justify-center">
                            <div
                                ref={canvasRef}
                                className="relative min-h-screen bg-white shadow-lg"
                                style={{
                                    width: getDeviceWidth(),
                                    maxWidth: funnel.settings.maxWidth,
                                    backgroundColor: funnel.settings.backgroundColor,
                                }}
                            >
                                {funnel.content.map(renderBlock)}

                                {/* Empty State */}
                                {funnel.content.length === 0 && (
                                    <div className="flex h-96 items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <Plus className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <p className="text-lg font-medium">Start building your funnel</p>
                                            <p className="mb-4 text-sm">Drag blocks from the left panel to get started</p>
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => setIsPreviewOpen(true)}
                                                    className="text-sm text-blue-600 underline hover:text-blue-800"
                                                >
                                                    Preview empty funnel
                                                </button>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-400">Press Cmd/Ctrl + P</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties Panel */}
                <div className="w-80 border-l border-gray-200 bg-white p-4">
                    <div className="mb-6">
                        <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                            <Settings className="mr-2 h-5 w-5" />
                            Properties
                        </h2>

                        {selectedBlock ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                                    {selectedBlock.type === 'image' ? (
                                        <input
                                            type="url"
                                            value={(selectedBlock.content.src as string) || ''}
                                            onChange={(e) => updateBlockContent(selectedBlock.id, { src: e.target.value })}
                                            placeholder="Image URL"
                                            className="w-full rounded-lg border border-gray-300 p-2"
                                        />
                                    ) : selectedBlock.type === 'form' ? (
                                        <div className="text-sm text-gray-500">Form configuration coming soon</div>
                                    ) : (
                                        <textarea
                                            value={(selectedBlock.content.text as string) || ''}
                                            onChange={(e) => updateBlockContent(selectedBlock.id, { text: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 p-2"
                                            rows={3}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Background Color</label>
                                    <input
                                        type="color"
                                        value={(selectedBlock.content.backgroundColor as string) || '#ffffff'}
                                        onChange={(e) => updateBlockContent(selectedBlock.id, { backgroundColor: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Text Color</label>
                                    <input
                                        type="color"
                                        value={(selectedBlock.content.color as string) || '#000000'}
                                        onChange={(e) => updateBlockContent(selectedBlock.id, { color: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Font Size</label>
                                    <input
                                        type="text"
                                        value={(selectedBlock.content.fontSize as string) || '16px'}
                                        onChange={(e) => updateBlockContent(selectedBlock.id, { fontSize: e.target.value })}
                                        placeholder="16px"
                                        className="w-full rounded-lg border border-gray-300 p-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Padding</label>
                                    <input
                                        type="text"
                                        value={(selectedBlock.content.padding as string) || '16px'}
                                        onChange={(e) => updateBlockContent(selectedBlock.id, { padding: e.target.value })}
                                        placeholder="16px"
                                        className="w-full rounded-lg border border-gray-300 p-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Border Radius</label>
                                    <input
                                        type="text"
                                        value={(selectedBlock.content.borderRadius as string) || '0px'}
                                        onChange={(e) => updateBlockContent(selectedBlock.id, { borderRadius: e.target.value })}
                                        placeholder="8px"
                                        className="w-full rounded-lg border border-gray-300 p-2"
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <button
                                        onClick={() => deleteBlock(selectedBlock.id)}
                                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete Block</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p>Select a block to edit its properties</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} funnel={funnel} />
        </>
    );
}
