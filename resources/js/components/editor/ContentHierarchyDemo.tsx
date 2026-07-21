import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NestedContentBlock } from './NestedContentBlock';
import { useNestedContent } from './hooks/useNestedContent';
import { ContentBlockType, getAllowedChildren } from './validation/ContentValidation';

// Sample renderer for content blocks based on type
const renderBlockContent = (block: NestedContentBlock) => {
    const style = {
        padding: '8px',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        backgroundColor: '#fff',
    };

    switch (block.type) {
        case 'text':
            return (
                <div style={style} className="text-block">
                    {(block.content.text as string) || 'Text Block'}
                </div>
            );
        case 'image':
            return (
                <div style={style} className="image-block">
                    <img
                        src={(block.content.src as string) || 'https://via.placeholder.com/400x300'}
                        alt={(block.content.alt as string) || 'Image'}
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            );
        case 'button':
            return (
                <div style={style} className="button-block">
                    <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        {(block.content.text as string) || 'Button'}
                    </button>
                </div>
            );
        case 'container':
            return (
                <div style={{ ...style, backgroundColor: '#f9fafb' }} className="container-block">
                    <div className="mb-2 text-sm font-medium">Container</div>
                    <p className="text-xs text-gray-500">Can hold {getAllowedChildren('container').join(', ')} blocks</p>
                </div>
            );
        case 'grid':
            return (
                <div style={{ ...style, backgroundColor: '#f0f9ff' }} className="grid-block">
                    <div className="mb-2 text-sm font-medium">Grid Layout</div>
                    <p className="text-xs text-gray-500">Displays items in a grid format</p>
                </div>
            );
        case 'tabs':
            return (
                <div style={{ ...style, backgroundColor: '#f5f3ff' }} className="tabs-block">
                    <div className="mb-2 text-sm font-medium">Tabs Component</div>
                    <div className="flex border-b">
                        <div className="border-b-2 border-indigo-500 px-4 py-2 text-xs">Tab 1</div>
                        <div className="px-4 py-2 text-xs text-gray-500">Tab 2</div>
                        <div className="px-4 py-2 text-xs text-gray-500">+ Add Tab</div>
                    </div>
                </div>
            );
        case 'accordion':
            return (
                <div style={{ ...style, backgroundColor: '#fef3f2' }} className="accordion-block">
                    <div className="mb-2 text-sm font-medium">Accordion</div>
                    <div className="overflow-hidden rounded border text-xs">
                        <div className="flex justify-between bg-gray-50 p-2">
                            Section 1 <span>▼</span>
                        </div>
                        <div className="border-t p-2">Content goes here</div>
                    </div>
                </div>
            );
        default:
            return (
                <div style={style} className="generic-block">
                    <div className="text-sm capitalize">{block.type} Block</div>
                </div>
            );
    }
};

// Palette of blocks that can be dragged into the editor
const BlockPalette = () => {
    const blockTypes: { type: ContentBlockType; name: string; description: string }[] = [
        { type: 'text', name: 'Text', description: 'Simple text content' },
        { type: 'image', name: 'Image', description: 'Image content' },
        { type: 'button', name: 'Button', description: 'Interactive button' },
        { type: 'container', name: 'Container', description: 'Contains other elements' },
        { type: 'grid', name: 'Grid', description: 'Grid layout' },
        { type: 'tabs', name: 'Tabs', description: 'Tabbed content' },
        { type: 'accordion', name: 'Accordion', description: 'Expandable sections' },
    ];

    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-medium text-gray-800">Content Blocks</h3>
            <div className="space-y-2">
                {blockTypes.map((blockType) => (
                    <DraggableBlockItem key={blockType.type} type={blockType.type} name={blockType.name} description={blockType.description} />
                ))}
            </div>
        </div>
    );
};

// Draggable block item for the palette
const DraggableBlockItem = ({ type, name, description }: { type: ContentBlockType; name: string; description: string }) => {
    // In a real implementation, you'd use react-dnd useDrag hook here
    return (
        <div className="cursor-move rounded border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100" draggable data-block-type={type}>
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-gray-500">{description}</div>
            <div className="mt-1 text-xs text-gray-400">Drag to add</div>
        </div>
    );
};

// Example hierarchy demo component
export default function ContentHierarchyDemo() {
    // Sample initial blocks
    const initialBlocks: NestedContentBlock[] = [
        {
            id: 'block-1',
            type: 'container',
            content: { title: 'Main Container' },
            settings: {
                padding: '16px',
                margin: '0 0 16px 0',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
            },
            children: [
                {
                    id: 'block-1-1',
                    type: 'text',
                    content: { text: 'This is a text block inside a container' },
                    settings: {
                        padding: '8px',
                        margin: '0 0 8px 0',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                    },
                },
            ],
        },
        {
            id: 'block-2',
            type: 'tabs',
            content: { tabTitles: ['Tab 1', 'Tab 2'] },
            settings: {
                padding: '16px',
                margin: '0 0 16px 0',
                backgroundColor: '#f5f3ff',
                borderRadius: '8px',
            },
            children: [
                {
                    id: 'block-2-1',
                    type: 'text',
                    content: { text: 'This is content for Tab 1' },
                    settings: {
                        padding: '8px',
                        margin: '0',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                    },
                },
            ],
        },
    ];

    // Use our custom hook for managing nested content
    const { blocks, selectedBlockId, selectedBlock, selectBlock, addBlock, addChildBlock, updateBlock, deleteBlock, validateBlocks } =
        useNestedContent(initialBlocks);

    // Track validation results
    const [validationResults, setValidationResults] = useState<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } | null>(null);

    // Handle adding a demo block
    const handleAddDemoBlock = (type: ContentBlockType) => {
        const newBlock: NestedContentBlock = {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            content: { text: `New ${type} block` },
            settings: {
                padding: '16px',
                margin: '0 0 16px 0',
                backgroundColor: 'transparent',
                borderRadius: '4px',
            },
        };

        addBlock(newBlock);
    };

    // Render a block in the preview
    const renderBlock = (block: NestedContentBlock) => {
        return (
            <NestedContentBlock
                key={block.id}
                block={block}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onSelect={() => selectBlock(block.id)}
                isSelected={selectedBlockId === block.id}
                onAddChild={addChildBlock}
                renderBlockContent={renderBlockContent}
            />
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="mx-auto max-w-6xl p-6">
                <h1 className="mb-6 text-2xl font-bold">Interactive Content Hierarchy Demo</h1>

                <div className="flex gap-6">
                    {/* Left side - Content editor */}
                    <div className="flex-1">
                        <div className="mb-4 rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-medium">Content Preview</h2>

                            <div className="space-y-4">{blocks.map(renderBlock)}</div>

                            {blocks.length === 0 && (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
                                    <p>No content blocks added yet</p>
                                    <p className="mt-2 text-sm">Use the buttons below to add content</p>
                                </div>
                            )}
                        </div>

                        {/* Demo controls */}
                        <div className="rounded-lg border bg-gray-50 p-4">
                            <h3 className="mb-2 font-medium text-gray-800">Quick Add Demo Blocks</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleAddDemoBlock('text')}
                                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                >
                                    Add Text
                                </button>
                                <button
                                    onClick={() => handleAddDemoBlock('container')}
                                    className="rounded bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700"
                                >
                                    Add Container
                                </button>
                                <button
                                    onClick={() => handleAddDemoBlock('tabs')}
                                    className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                >
                                    Add Tabs
                                </button>
                                <button
                                    onClick={() => handleAddDemoBlock('accordion')}
                                    className="rounded bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700"
                                >
                                    Add Accordion
                                </button>
                                <button
                                    onClick={() => setValidationResults(validateBlocks())}
                                    className="rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                                >
                                    Validate Structure
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Block palette and properties */}
                    <div className="w-80">
                        <BlockPalette />

                        {/* Selected block info */}
                        {selectedBlock && (
                            <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
                                <h3 className="mb-2 font-medium text-gray-800">Selected Block</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Type:</span> {selectedBlock.type}
                                    </div>
                                    <div>
                                        <span className="text-gray-500">ID:</span> {selectedBlock.id}
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Children:</span> {selectedBlock.children?.length || 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validation results */}
                        {validationResults && (
                            <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
                                <h3 className="mb-2 flex items-center font-medium text-gray-800">
                                    {validationResults.isValid ? (
                                        <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                    ) : (
                                        <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                                    )}
                                    Validation Results
                                </h3>

                                {validationResults.isValid ? (
                                    <div className="text-sm text-green-600">Content structure is valid!</div>
                                ) : (
                                    <div className="space-y-2">
                                        {validationResults.errors.map((error, i) => (
                                            <div key={i} className="flex text-sm text-red-600">
                                                <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0" />
                                                <span>{error}</span>
                                            </div>
                                        ))}

                                        {validationResults.warnings.map((warning, i) => (
                                            <div key={i} className="flex text-sm text-amber-600">
                                                <Info className="mr-1 h-4 w-4 flex-shrink-0" />
                                                <span>{warning}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
