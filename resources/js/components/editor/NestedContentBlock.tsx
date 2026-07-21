import type { Block as ContentBlock } from '@/types/editor';
import { Copy, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import ContentContainer from './ContentContainer';
import { ContentBlockType, getAllowedChildren, validateMinChildren } from './validation/ContentValidation';

// Extended ContentBlock type with children support
export interface NestedContentBlock extends ContentBlock {
    children?: NestedContentBlock[];
}

interface DroppedItem {
    id?: string;
    type: string;
    defaultContent: Record<string, unknown>;
}

interface NestedContentBlockProps {
    block: NestedContentBlock;
    onUpdate: (updates: Partial<NestedContentBlock>) => void;
    onDelete: () => void;
    onDuplicate?: () => void;
    onSelect: () => void;
    isSelected: boolean;
    onAddChild?: (parentId: string, childBlock: NestedContentBlock) => void;
    onDeleteChild?: (parentId: string, childId: string) => void;
    onUpdateChild?: (parentId: string, childId: string, updates: Partial<NestedContentBlock>) => void;
    renderBlockContent: (block: NestedContentBlock) => React.ReactNode;
}

const ItemTypes = {
    CONTENT_BLOCK: 'content_block',
};

export function NestedContentBlock({
    block,
    onDelete,
    onDuplicate,
    onSelect,
    isSelected,
    onAddChild,
    onDeleteChild,
    onUpdateChild,
    renderBlockContent,
}: NestedContentBlockProps) {
    const [showControls, setShowControls] = useState(false);

    // Check if block has children and if it can have children based on validation rules
    const canHaveChildren = getAllowedChildren(block.type as ContentBlockType).length > 0;

    // Set up drag functionality
    const dragRef = React.useRef<HTMLDivElement>(null);
    const [{ isDragging }, dragSource] = useDrag(() => ({
        type: ItemTypes.CONTENT_BLOCK,
        item: {
            id: block.id,
            type: block.type,
            defaultContent: block.content,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));
    dragSource(dragRef);

    const handleChildAdd = (item: DroppedItem, parentId: string) => {
        if (onAddChild && parentId === block.id) {
            // Create new child block from dropped item
            const newChildBlock: NestedContentBlock = {
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: item.type as ContentBlock['type'],
                content: item.defaultContent || {},
                settings: {
                    padding: '16px',
                    margin: '0 0 16px 0',
                    backgroundColor: 'transparent',
                    borderRadius: '0px',
                },
            };

            onAddChild(parentId, newChildBlock);
        }
    };

    const handleChildDelete = (childId: string) => {
        if (onDeleteChild) {
            onDeleteChild(block.id, childId);
        }
    };

    const handleChildUpdate = (childId: string, updates: Partial<ContentBlock>) => {
        if (onUpdateChild) {
            onUpdateChild(block.id, childId, updates);
        }
    };

    const renderNestedBlock = (childBlock: NestedContentBlock) => {
        return (
            <NestedContentBlock
                key={childBlock.id}
                block={childBlock}
                onUpdate={(updates) => handleChildUpdate(childBlock.id, updates)}
                onDelete={() => handleChildDelete(childBlock.id)}
                onSelect={() => onSelect()}
                isSelected={false} // Would need to track nested selection
                renderBlockContent={renderBlockContent}
            />
        );
    };

    // Check if the block can have children but doesn't meet minimum requirements
    const childrenValidation = validateMinChildren(
        block.type as ContentBlockType,
        ((block.children || []) as ContentBlock[]).map((child) => child.type as ContentBlockType),
    );

    const blockStyle = {
        padding: block.settings.padding,
        margin: block.settings.margin,
        backgroundColor: block.settings.backgroundColor,
        borderRadius: block.settings.borderRadius,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={dragRef}
            className={`group nested-content-block relative ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-border'} `}
            style={blockStyle}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
                setShowControls(true);
            }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => !isSelected && setShowControls(false)}
        >
            {/* Block Controls */}
            {showControls && (
                <div className="absolute top-2 right-2 z-10 flex space-x-1 rounded border border-border bg-card p-1 shadow">
                    {onDuplicate && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate();
                            }}
                            className="rounded p-1 text-foreground hover:bg-muted"
                            title="Duplicate Block"
                        >
                            <Copy className="h-3 w-3" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="rounded p-1 text-destructive hover:bg-destructive/10"
                        title="Delete Block"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                    <button className="rounded p-1 text-foreground hover:bg-muted" title="More Options">
                        <MoreHorizontal className="h-3 w-3" />
                    </button>
                </div>
            )}

            {/* Block type label */}
            {isSelected && (
                <div className="absolute top-2 left-2 z-10 rounded bg-primary px-2 py-1 text-xs text-primary-foreground">{block.type}</div>
            )}

            {/* Block content */}
            {renderBlockContent(block)}

            {/* Child content container - only show if this block can have children */}
            {canHaveChildren && (
                <div className="mt-3 border-t border-border pt-3">
                    <ContentContainer
                        type={block.type as ContentBlockType}
                        id={block.id}
                        onDrop={handleChildAdd}
                        onSelect={onSelect}
                        isSelected={isSelected}
                        blocks={block.children || []}
                        renderBlock={renderNestedBlock}
                        className="min-h-[60px] rounded border border-dashed border-border p-2"
                        dropDisabled={!onAddChild}
                    />

                    {/* Warning for minimum children requirement */}
                    {!childrenValidation.valid && (
                        <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-600">⚠️ {childrenValidation.reason}</div>
                    )}

                    {/* Add child manually button */}
                    {onAddChild && getAllowedChildren(block.type as ContentBlockType).length > 0 && (
                        <button
                            className="mt-2 flex w-full items-center justify-center rounded p-2 text-xs text-muted-foreground transition-colors hover:bg-muted"
                            onClick={(e) => {
                                e.stopPropagation();
                                // This would typically open a menu of allowed children
                                // For now, it's just a placeholder
                            }}
                        >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Child Content
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default NestedContentBlock;
