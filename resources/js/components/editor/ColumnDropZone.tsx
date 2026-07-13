import FormFields from '@/components/funnel/FormFields';
import { getFormFields } from '@/lib/form-fields';
import type { Block as ContentBlock, Column as LayoutColumn } from '@/types/editor';
import { AlertCircle, Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { canAddChild, ContentBlockType, getAllowedChildren } from './validation/ContentValidation';

interface DropZoneProps {
    column: LayoutColumn;
    onBlockAdd: (columnId: string, block: ContentBlock) => void;
    onBlockUpdate: (columnId: string, blockId: string, updates: Partial<ContentBlock>) => void;
    onBlockDelete: (columnId: string, blockId: string) => void;
    isSelected: boolean;
    onSelect: () => void;
    selectedBlockId?: string | null;
    onSelectBlock?: (blockId: string) => void;
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
    onSelect,
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
                content: { ...block.content, text: e.target.textContent || '' },
            });
        }
    };

    const blockStyle = {
        padding: block.settings.padding,
        margin: block.settings.margin,
        backgroundColor: block.settings.backgroundColor,
        borderRadius: block.settings.borderRadius,
    };

    const wrapperClass = `relative group ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/30'}`;

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
                            fontSize: (block.content.fontSize as string) || '16px',
                            color: (block.content.color as string) || '#1f2937',
                            textAlign: ((block.content.textAlign as string) || 'left') as React.CSSProperties['textAlign'],
                            fontWeight: (block.content.fontWeight as string) || 'normal',
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
                            className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
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
                        className="h-auto max-w-full rounded"
                        style={{
                            width: (block.content.width as string) || '100%',
                            objectFit: ((block.content.objectFit as string) || 'cover') as React.CSSProperties['objectFit'],
                        }}
                    />
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
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
                        className={`rounded px-6 py-3 font-medium transition-colors ${
                            block.content.variant === 'primary'
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                        } ${block.content.fullWidth ? 'w-full' : ''}`}
                        style={{
                            fontSize: block.content.size === 'large' ? '18px' : block.content.size === 'small' ? '14px' : '16px',
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
                            className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        case 'form':
            return (
                <div
                    className={wrapperClass}
                    style={blockStyle}
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelect();
                    }}
                >
                    <div className="space-y-4 rounded-lg border border-border bg-white p-4 text-left">
                        <h3 className="font-semibold text-gray-900">{(block.content.title as string) || 'Contact us'}</h3>
                        <FormFields fields={getFormFields(block.content)} formId={`editor-${block.id}`} disabled />
                        <button type="button" className="w-full rounded bg-blue-600 p-2 text-white">
                            {(block.content.buttonText as string) || 'Submit'}
                        </button>
                    </div>
                    {isSelected && (
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        case 'spacer':
            return (
                <div
                    className={`${wrapperClass} border-2 border-dashed border-border`}
                    style={{
                        ...blockStyle,
                        height: (block.content.height as string) || '50px',
                        minHeight: '20px',
                    }}
                    onClick={onSelect}
                >
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Spacer ({String(block.content.height)})
                    </div>
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        default:
            return (
                <div className={wrapperClass} style={blockStyle} onClick={onSelect}>
                    <div className="rounded bg-muted p-4 text-center text-muted-foreground">{block.type} block (preview coming soon)</div>
                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
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
    selectedBlockId,
    onSelectBlock,
}: DropZoneProps) {
    const dropRef = useRef<HTMLDivElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const blocks = column.blocks as unknown as ContentBlock[];
    const currentBlockTypes = blocks.map((block) => block.type as ContentBlockType);

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: ItemTypes.CONTENT_BLOCK,
            canDrop: (item: { type: string; defaultContent: Record<string, unknown> }) => {
                const childType = item.type as ContentBlockType;
                const validation = canAddChild('column', childType, currentBlockTypes);

                if (!validation.allowed) {
                    setValidationError(validation.reason || 'Cannot add this content here');
                    setTimeout(() => setValidationError(null), 3000);
                    return false;
                }

                return true;
            },
            drop: (item: { type: string; defaultContent: Record<string, unknown> }) => {
                const newBlock = createBlockFromDrop(item);
                onBlockAdd(column.id, newBlock);
                return { columnId: column.id };
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [column.id, currentBlockTypes],
    );

    drop(dropRef);

    const allowedChildren = getAllowedChildren('column');

    return (
        <div
            ref={dropRef}
            className={`relative min-h-[100px] p-2 transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''} ${
                isOver && canDrop ? 'border-chart-2 bg-chart-2/10' : isOver && !canDrop ? 'border-destructive bg-destructive/10' : 'border-border'
            } border-2 border-dashed`}
            onClick={onSelect}
        >
            {/* Validation error message */}
            {validationError && (
                <div className="absolute top-2 right-2 z-10 flex items-center rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {validationError}
                </div>
            )}

            {blocks.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <Plus className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm">
                            Drop {allowedChildren.length > 3 ? `${allowedChildren.slice(0, 3).join(', ')}...` : allowedChildren.join(', ')} blocks
                            here
                        </p>
                        {isOver && canDrop && <p className="mt-1 text-xs text-green-600">Release to add block</p>}
                        {isOver && !canDrop && <p className="mt-1 text-xs text-red-600">This content is not allowed here</p>}
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
                            isSelected={selectedBlockId === block.id}
                            onSelect={() => onSelectBlock?.(block.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
