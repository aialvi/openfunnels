import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { 
    Type, 
    Image, 
    Square, 
    FileText, 
    Plus, 
    Save, 
    Eye, 
    Settings, 
    Layers,
    Smartphone,
    Tablet,
    Monitor,
    Undo,
    Redo,
    Trash2
} from 'lucide-react';

gsap.registerPlugin(Draggable);

interface Block {
    id: string;
    type: 'text' | 'image' | 'button' | 'form';
    content: string;
    styles: {
        fontSize?: string;
        color?: string;
        backgroundColor?: string;
        padding?: string;
        margin?: string;
        borderRadius?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
    position: {
        x: number;
        y: number;
    };
}

interface Funnel {
    id: string;
    name: string;
    blocks: Block[];
    settings: {
        backgroundColor: string;
        maxWidth: string;
    };
}

export default function FunnelEditor() {
    const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [funnel, setFunnel] = useState<Funnel>({
        id: '1',
        name: 'My First Funnel',
        blocks: [],
        settings: {
            backgroundColor: '#ffffff',
            maxWidth: '1200px'
        }
    });
    
    const canvasRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize GSAP Draggable for blocks
        if (canvasRef.current) {
            const blocks = canvasRef.current.querySelectorAll('.draggable-block');
            Draggable.create(blocks, {
                bounds: canvasRef.current,
                edgeResistance: 0.65,
                type: 'x,y',
                onDrag: function() {
                    // Update block position in state
                    const blockId = this.target.dataset.blockId;
                    if (blockId) {
                        setFunnel(prev => ({
                            ...prev,
                            blocks: prev.blocks.map(block => 
                                block.id === blockId 
                                    ? { ...block, position: { x: this.x, y: this.y } }
                                    : block
                            )
                        }));
                    }
                }
            });
        }
    }, [funnel.blocks]);

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: `block-${Date.now()}`,
            type,
            content: getDefaultContent(type),
            styles: getDefaultStyles(type),
            position: {
                x: Math.random() * 300,
                y: Math.random() * 200
            }
        };

        setFunnel(prev => ({
            ...prev,
            blocks: [...prev.blocks, newBlock]
        }));
    };

    const getDefaultContent = (type: Block['type']): string => {
        switch (type) {
            case 'text':
                return 'Enter your text here';
            case 'image':
                return 'https://via.placeholder.com/300x200';
            case 'button':
                return 'Click Me';
            case 'form':
                return 'Email Form';
            default:
                return '';
        }
    };

    const getDefaultStyles = (type: Block['type']) => {
        switch (type) {
            case 'text':
                return {
                    fontSize: '16px',
                    color: '#333333',
                    padding: '16px',
                    textAlign: 'left' as const
                };
            case 'button':
                return {
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textAlign: 'center' as const
                };
            case 'image':
                return {
                    borderRadius: '8px'
                };
            case 'form':
                return {
                    backgroundColor: '#f9fafb',
                    padding: '24px',
                    borderRadius: '8px'
                };
            default:
                return {};
        }
    };

    const updateBlockContent = (blockId: string, content: string) => {
        setFunnel(prev => ({
            ...prev,
            blocks: prev.blocks.map(block => 
                block.id === blockId ? { ...block, content } : block
            )
        }));
    };

    const updateBlockStyles = (blockId: string, styles: Partial<Block['styles']>) => {
        setFunnel(prev => ({
            ...prev,
            blocks: prev.blocks.map(block => 
                block.id === blockId 
                    ? { ...block, styles: { ...block.styles, ...styles } }
                    : block
            )
        }));
    };

    const deleteBlock = (blockId: string) => {
        setFunnel(prev => ({
            ...prev,
            blocks: prev.blocks.filter(block => block.id !== blockId)
        }));
        setSelectedBlock(null);
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
            key: block.id,
            'data-block-id': block.id,
            className: `draggable-block absolute cursor-move border-2 ${
                selectedBlock?.id === block.id ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
            }`,
            style: {
                left: block.position.x,
                top: block.position.y,
                ...block.styles
            },
            onClick: () => setSelectedBlock(block)
        };

        switch (block.type) {
            case 'text':
                return (
                    <div {...commonProps}>
                        <div 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockContent(block.id, e.target.textContent || '')}
                            style={{ outline: 'none' }}
                        >
                            {block.content}
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div {...commonProps}>
                        <img 
                            src={block.content} 
                            alt="Block content" 
                            className="max-w-full h-auto"
                            style={{ borderRadius: block.styles.borderRadius }}
                        />
                    </div>
                );
            case 'button':
                return (
                    <button {...commonProps} className={`${commonProps.className} px-4 py-2 font-medium`}>
                        {block.content}
                    </button>
                );
            case 'form':
                return (
                    <div {...commonProps} className={`${commonProps.className} min-w-64`}>
                        <div className="space-y-4">
                            <h3 className="font-semibold">Subscribe to our newsletter</h3>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                                Subscribe
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
            
            <div className="h-screen flex bg-gray-50">
                {/* Left Sidebar - Block Library */}
                <div ref={sidebarRef} className="w-64 bg-white border-r border-gray-200 p-4">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Block Library</h2>
                        <div className="space-y-3">
                            <div 
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => addBlock('text')}
                            >
                                <Type className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Text Block</span>
                            </div>
                            <div 
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => addBlock('image')}
                            >
                                <Image className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Image Block</span>
                            </div>
                            <div 
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => addBlock('button')}
                            >
                                <Square className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Button Block</span>
                            </div>
                            <div 
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => addBlock('form')}
                            >
                                <FileText className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Form Block</span>
                            </div>
                        </div>
                    </div>

                    {/* Layers Panel */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Layers className="w-4 h-4 mr-2" />
                            Layers
                        </h3>
                        <div className="space-y-1">
                            {funnel.blocks.map(block => (
                                <div 
                                    key={block.id}
                                    className={`p-2 text-sm rounded cursor-pointer flex items-center justify-between ${
                                        selectedBlock?.id === block.id 
                                            ? 'bg-blue-100 text-blue-900' 
                                            : 'hover:bg-gray-100'
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
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {funnel.blocks.length === 0 && (
                                <p className="text-xs text-gray-500">No blocks added yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Toolbar */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={route('dashboard')} className="text-gray-600 hover:text-gray-900">
                                    ← Back to Dashboard
                                </Link>
                                <div className="text-lg font-semibold">{funnel.name}</div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {/* Device Selection */}
                                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={() => setSelectedDevice('desktop')}
                                        className={`p-2 rounded ${selectedDevice === 'desktop' ? 'bg-white shadow' : ''}`}
                                    >
                                        <Monitor className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedDevice('tablet')}
                                        className={`p-2 rounded ${selectedDevice === 'tablet' ? 'bg-white shadow' : ''}`}
                                    >
                                        <Tablet className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedDevice('mobile')}
                                        className={`p-2 rounded ${selectedDevice === 'mobile' ? 'bg-white shadow' : ''}`}
                                    >
                                        <Smartphone className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-gray-600 hover:text-gray-900">
                                        <Undo className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-gray-900">
                                        <Redo className="w-4 h-4" />
                                    </button>
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
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
                                className="bg-white shadow-lg relative min-h-screen"
                                style={{ 
                                    width: getDeviceWidth(),
                                    maxWidth: funnel.settings.maxWidth,
                                    backgroundColor: funnel.settings.backgroundColor 
                                }}
                            >
                                {funnel.blocks.map(renderBlock)}
                                
                                {/* Empty State */}
                                {funnel.blocks.length === 0 && (
                                    <div className="flex items-center justify-center h-96 text-gray-500">
                                        <div className="text-center">
                                            <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium">Start building your funnel</p>
                                            <p className="text-sm">Drag blocks from the left panel to get started</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties Panel */}
                <div className="w-80 bg-white border-l border-gray-200 p-4">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Settings className="w-5 h-5 mr-2" />
                            Properties
                        </h2>
                        
                        {selectedBlock ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    {selectedBlock.type === 'image' ? (
                                        <input 
                                            type="url"
                                            value={selectedBlock.content}
                                            onChange={(e) => updateBlockContent(selectedBlock.id, e.target.value)}
                                            placeholder="Image URL"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                        />
                                    ) : selectedBlock.type === 'form' ? (
                                        <div className="text-sm text-gray-500">Form configuration coming soon</div>
                                    ) : (
                                        <textarea 
                                            value={selectedBlock.content}
                                            onChange={(e) => updateBlockContent(selectedBlock.id, e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            rows={3}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Background Color
                                    </label>
                                    <input 
                                        type="color"
                                        value={selectedBlock.styles.backgroundColor || '#ffffff'}
                                        onChange={(e) => updateBlockStyles(selectedBlock.id, { backgroundColor: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Text Color
                                    </label>
                                    <input 
                                        type="color"
                                        value={selectedBlock.styles.color || '#000000'}
                                        onChange={(e) => updateBlockStyles(selectedBlock.id, { color: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Font Size
                                    </label>
                                    <input 
                                        type="text"
                                        value={selectedBlock.styles.fontSize || '16px'}
                                        onChange={(e) => updateBlockStyles(selectedBlock.id, { fontSize: e.target.value })}
                                        placeholder="16px"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Padding
                                    </label>
                                    <input 
                                        type="text"
                                        value={selectedBlock.styles.padding || '16px'}
                                        onChange={(e) => updateBlockStyles(selectedBlock.id, { padding: e.target.value })}
                                        placeholder="16px"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Border Radius
                                    </label>
                                    <input 
                                        type="text"
                                        value={selectedBlock.styles.borderRadius || '0px'}
                                        onChange={(e) => updateBlockStyles(selectedBlock.id, { borderRadius: e.target.value })}
                                        placeholder="8px"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <button 
                                        onClick={() => deleteBlock(selectedBlock.id)}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Block</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>Select a block to edit its properties</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
