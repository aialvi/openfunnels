import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ContentBlock } from './ContentBlockLibrary';
import { ContentBlockType, getAllowedChildren, validateMinChildren } from './validation/ContentValidation';
import ContentContainer from './ContentContainer';
import { Copy, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

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
  onUpdate,
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
  const childCount = block.children?.length || 0;
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
    ((block.children || []) as ContentBlock[]).map(child => child.type as ContentBlockType)
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
      className={`
        relative group nested-content-block
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}
      `}
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
        <div className="absolute top-2 right-2 flex space-x-1 bg-white rounded shadow p-1 z-10">
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Duplicate Block"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete Block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="More Options"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Block type label */}
      {isSelected && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          {block.type}
        </div>
      )}
      
      {/* Block content */}
      {renderBlockContent(block)}
      
      {/* Child content container - only show if this block can have children */}
      {canHaveChildren && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <ContentContainer
            type={block.type as ContentBlockType}
            id={block.id}
            onDrop={handleChildAdd}
            onSelect={onSelect}
            isSelected={isSelected}
            blocks={block.children || []}
            renderBlock={renderNestedBlock}
            className="min-h-[60px] border border-dashed border-gray-300 p-2 rounded"
            dropDisabled={!onAddChild}
          />
          
          {/* Warning for minimum children requirement */}
          {!childrenValidation.valid && (
            <div className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded">
              ⚠️ {childrenValidation.reason}
            </div>
          )}
          
          {/* Add child manually button */}
          {onAddChild && getAllowedChildren(block.type as ContentBlockType).length > 0 && (
            <button
              className="w-full mt-2 p-2 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                // This would typically open a menu of allowed children
                // For now, it's just a placeholder
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Child Content
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NestedContentBlock;
