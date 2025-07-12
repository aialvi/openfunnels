import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ContentBlock } from './ContentBlockLibrary';
import { LayoutColumn } from './LayoutBuilder';

interface DropZoneProps {
    column: LayoutColumn;
    onBlockAdd: (columnId: string, block: ContentBlock) => void;
    onBlockUpdate: (columnId: string, blockId: string, updates: Partial<ContentBlock>) => void;
    onBlockDelete: (columnId: string, blockId: string) => void;
    isSelected: boolean;
    onSelect: () => void;
}

const ItemTypes = {
    CONTENT_BLOCK: 'content_block',
};

// Mock function to create a block from dropped content
function createBlockFromDrop(dropItem: { type: string; defaultContent: Record<string, unknown> }): ContentBlock {
    return {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: dropItem.type as ContentBlock['type'],
        content: dropItem.defaultContent,
        settings: {
            padding: '16px',
            margin: '0 0 16px 0',
            backgroundColor: 'transparent',
            borderRadius: '0px',
        },
    };
}

// Render different block types
function BlockRenderer({ 
    block, 
    onUpdate, 
    onDelete, 
    isSelected, 
    onSelect 
}: { 
    block: ContentBlock; 
    onUpdate: (updates: Partial<ContentBlock>) => void; 
    onDelete: () => void;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const handleContentEdit = (e: React.FocusEvent<HTMLDivElement>) => {
        if (block.type === 'text') {
            onUpdate({
                content: { ...block.content, text: e.target.textContent || '' }
            });
        }
    };

    const blockStyle = {
        padding: block.settings.padding,
        margin: block.settings.margin,
        backgroundColor: block.settings.backgroundColor,
        borderRadius: block.settings.borderRadius,
    };

    const wrapperClass = `relative group ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}`;

    switch (block.type) {
        case 'text':
            return (
                <div className={wrapperClass} style={blockStyle} onClick={onSelect}>
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={handleContentEdit}
                        className="outline-none"
                        style={{
                            fontSize: block.content.fontSize as string || '16px',
                            color: block.content.color as string || '#1f2937',
                            textAlign: (block.content.textAlign as string || 'left') as React.CSSProperties['textAlign'],
                            fontWeight: block.content.fontWeight as string || 'normal',
                        }}
                    >
                        {(block.content.text as string) || 'Enter your text here'}
                    </div>
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        case 'image':
            return (
                <div className={wrapperClass} style={blockStyle} onClick={onSelect}>
                    <img
                        src={(block.content.src as string) || 'https://via.placeholder.com/400x300'}
                        alt={(block.content.alt as string) || 'Image'}
                        className="max-w-full h-auto rounded"
                        style={{
                            width: block.content.width as string || '100%',
                            objectFit: (block.content.objectFit as string || 'cover') as React.CSSProperties['objectFit'],
                        }}
                    />
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        case 'button':
            return (
                <div className={wrapperClass} style={blockStyle} onClick={onSelect}>
                    <button
                        className={`px-6 py-3 font-medium rounded transition-colors ${
                            block.content.variant === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        } ${
                            block.content.fullWidth ? 'w-full' : ''
                        }`}
                        style={{
                            fontSize: block.content.size === 'large' ? '18px' : 
                                     block.content.size === 'small' ? '14px' : '16px',
                        }}
                    >
                        {(block.content.text as string) || 'Click Me'}
                    </button>
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        case 'spacer':
            return (
                <div 
                    className={`${wrapperClass} border-2 border-dashed border-gray-300`} 
                    style={{ 
                        ...blockStyle, 
                        height: block.content.height as string || '50px',
                        minHeight: '20px'
                    }}
                    onClick={onSelect}
                >
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        Spacer ({String(block.content.height)})
                    </div>
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        default:
            return (
                <div className={wrapperClass} style={blockStyle} onClick={onSelect}>
                    <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
                        {block.type} block (preview coming soon)
                    </div>
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    )}
                </div>
            );
    }
}

export default function ColumnDropZone({
    column,
    onBlockAdd,
    onBlockUpdate,
    onBlockDelete,
    isSelected,
    onSelect,
}: DropZoneProps) {
    const dropRef = useRef<HTMLDivElement>(null);
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CONTENT_BLOCK,
        drop: (item: { type: string; defaultContent: Record<string, unknown> }) => {
            const newBlock = createBlockFromDrop(item);
            onBlockAdd(column.id, newBlock);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    drop(dropRef);

    const blocks = (column.blocks as unknown) as ContentBlock[];

    return (
        <div
            ref={dropRef}
            className={`min-h-[100px] p-2 transition-colors ${
                isSelected ? 'bg-blue-50 border-blue-300' : ''
            } ${
                isOver && canDrop ? 'bg-green-50 border-green-300' : 'border-gray-200'
            } border-2 border-dashed`}
            onClick={onSelect}
        >
            {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-gray-400">
                    <div className="text-center">
                        <div className="text-2xl mb-2">📦</div>
                        <p className="text-sm">Drop content blocks here</p>
                        {isOver && canDrop && (
                            <p className="text-xs text-green-600 mt-1">Release to add block</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {blocks.map((block) => (
                        <BlockRenderer
                            key={block.id}
                            block={block}
                            onUpdate={(updates) => onBlockUpdate(column.id, block.id, updates)}
                            onDelete={() => onBlockDelete(column.id, block.id)}
                            isSelected={false} // You'd track selected block here
                            onSelect={() => {}} // Handle block selection
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
