import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { canAddChild, ContentBlockType, getAllowedChildren, ParentType } from './validation/ContentValidation';
import { ContentBlock } from './ContentBlockLibrary';
import { AlertCircle, Plus } from 'lucide-react';

interface DroppedItem {
  type: string;
  defaultContent: Record<string, unknown>;
  [key: string]: unknown;
}

interface ContentContainerProps {
  type: ParentType;
  children?: React.ReactNode;
  id: string;
  onDrop: (item: DroppedItem, parentId: string) => void;
  onSelect: () => void;
  isSelected: boolean;
  blocks: ContentBlock[];
  renderBlock: (block: ContentBlock, index: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dropDisabled?: boolean;
}

const ItemTypes = {
  CONTENT_BLOCK: 'content_block',
};

export function ContentContainer({
  type,
  children,
  id,
  onDrop,
  onSelect,
  isSelected,
  blocks = [],
  renderBlock,
  className = '',
  style = {},
  dropDisabled = false,
}: ContentContainerProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const blockTypes = blocks.map(block => block.type as ContentBlockType);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CONTENT_BLOCK,
    canDrop: (item: DroppedItem) => {
      if (dropDisabled) return false;
      
      const childType = item.type as ContentBlockType;
      const validation = canAddChild(type, childType, blockTypes);
      
      if (!validation.allowed) {
        setValidationError(validation.reason || 'Cannot add this content here');
        setTimeout(() => setValidationError(null), 3000);
        return false;
      }
      
      return true;
    },
    drop: (item: DroppedItem) => {
      onDrop(item, id);
      return { id };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [type, blocks, id, dropDisabled, blockTypes]);

  const allowedChildren = getAllowedChildren(type);

  const dropRef = React.useRef<HTMLDivElement>(null);
  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={`relative content-container ${className} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isOver && canDrop ? 'bg-green-50 border-green-300' : ''} ${
        isOver && !canDrop ? 'bg-red-50 border-red-300' : ''
      }`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Content type label */}
      {isSelected && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          {type}
        </div>
      )}

      {/* Validation error message */}
      {validationError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-3 py-2 rounded text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {validationError}
        </div>
      )}

      {/* Display content blocks */}
      {blocks.length > 0 ? (
        <div className="content-blocks space-y-2">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">
              {allowedChildren.length > 0
                ? `Drop ${allowedChildren.join(', ')} blocks here`
                : 'No content blocks allowed here'}
            </p>
            {isOver && canDrop && (
              <p className="text-xs text-green-600 mt-1">Release to add block</p>
            )}
            {isOver && !canDrop && (
              <p className="text-xs text-red-600 mt-1">This content is not allowed here</p>
            )}
          </div>
        </div>
      )}

      {/* Optional child content (not blocks) */}
      {children}
    </div>
  );
}

export default ContentContainer;
