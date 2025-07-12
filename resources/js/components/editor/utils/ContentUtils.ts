/**
 * Content Management Utilities
 */
import { NestedContentBlock } from '../NestedContentBlock';
import { canAddChild, ContentBlockType } from '../validation/ContentValidation';

/**
 * Find a block by ID in a nested structure
 */
export function findBlockById(
  blocks: NestedContentBlock[],
  blockId: string
): { block: NestedContentBlock | null; parent: NestedContentBlock | null; path: string[] } {
  let result: { block: NestedContentBlock | null; parent: NestedContentBlock | null; path: string[] } = {
    block: null,
    parent: null,
    path: []
  };

  function search(items: NestedContentBlock[], parentBlock: NestedContentBlock | null, currentPath: string[]): boolean {
    for (const item of items) {
      const newPath = [...currentPath, item.id];
      
      if (item.id === blockId) {
        result = { block: item, parent: parentBlock, path: newPath };
        return true;
      }

      if (item.children && item.children.length > 0) {
        if (search(item.children, item, newPath)) {
          return true;
        }
      }
    }
    return false;
  }

  search(blocks, null, []);
  return result;
}

/**
 * Add a block to the parent block
 */
export function addBlockToParent(
  blocks: NestedContentBlock[],
  parentId: string,
  newBlock: NestedContentBlock
): NestedContentBlock[] {
  return blocks.map(block => {
    if (block.id === parentId) {
      // Add the new block as a child
      const updatedChildren = [...(block.children || []), newBlock];
      return { ...block, children: updatedChildren };
    } 
    
    // Recursively check children
    if (block.children && block.children.length > 0) {
      return {
        ...block,
        children: addBlockToParent(block.children, parentId, newBlock)
      };
    }
    
    return block;
  });
}

/**
 * Update a block by ID
 */
export function updateBlockById(
  blocks: NestedContentBlock[],
  blockId: string,
  updates: Partial<NestedContentBlock>
): NestedContentBlock[] {
  return blocks.map(block => {
    if (block.id === blockId) {
      // Update this block
      return { ...block, ...updates };
    } 
    
    // Recursively check children
    if (block.children && block.children.length > 0) {
      return {
        ...block,
        children: updateBlockById(block.children, blockId, updates)
      };
    }
    
    return block;
  });
}

/**
 * Delete a block by ID
 */
export function deleteBlockById(
  blocks: NestedContentBlock[],
  blockId: string
): NestedContentBlock[] {
  return blocks
    .filter(block => block.id !== blockId)
    .map(block => {
      // Recursively check children
      if (block.children && block.children.length > 0) {
        return {
          ...block,
          children: deleteBlockById(block.children, blockId)
        };
      }
      return block;
    });
}

/**
 * Move a block from one parent to another
 */
export function moveBlock(
  blocks: NestedContentBlock[],
  blockId: string,
  sourceParentId: string | null,
  targetParentId: string
): NestedContentBlock[] {
  // First find the block to move
  const { block: blockToMove } = findBlockById(blocks, blockId);
  
  if (!blockToMove) {
    return blocks;
  }
  
  // Check if the target parent can accept this type of block
  const targetParent = findBlockById(blocks, targetParentId).block;
  
  if (!targetParent) {
    return blocks;
  }
  
  const canAdd = canAddChild(
    targetParent.type as ContentBlockType,
    blockToMove.type as ContentBlockType,
    (targetParent.children || []).map((child: NestedContentBlock) => child.type as ContentBlockType)
  );
  
  if (!canAdd.allowed) {
    console.warn(`Cannot move ${blockToMove.type} to ${targetParent.type}: ${canAdd.reason}`);
    return blocks;
  }
  
  // Remove from source
  const blocksWithoutMoved = sourceParentId
    ? blocks.map(block => {
        if (block.id === sourceParentId && block.children) {
          return {
            ...block,
            children: block.children.filter((child: NestedContentBlock) => child.id !== blockId)
          };
        }
        
        if (block.children && block.children.length > 0) {
          return {
            ...block,
            children: deleteBlockById(block.children, blockId)
          };
        }
        
        return block;
      })
    : blocks.filter(block => block.id !== blockId);
  
  // Add to target
  return addBlockToParent(blocksWithoutMoved, targetParentId, blockToMove);
}

/**
 * Duplicate a block and its children
 */
export function duplicateBlock(
  blocks: NestedContentBlock[],
  blockId: string
): { blocks: NestedContentBlock[]; newBlockId: string } {
  const { block: blockToDuplicate } = findBlockById(blocks, blockId);
  
  if (!blockToDuplicate) {
    return { blocks, newBlockId: '' };
  }
  
  // Create a deep copy with new IDs
  const duplicatedBlock = createDuplicate(blockToDuplicate);
  const newBlockId = duplicatedBlock.id;
  
  // Find the parent to add the duplicate to
  const { parent } = findBlockById(blocks, blockId);
  
  if (!parent) {
    // Top-level block, just add it to the array
    return { blocks: [...blocks, duplicatedBlock], newBlockId };
  }
  
  // Add to parent
  const updatedBlocks = addBlockToParent(blocks, parent.id, duplicatedBlock);
  return { blocks: updatedBlocks, newBlockId };
}

/**
 * Helper to create a duplicate of a block with new IDs
 */
function createDuplicate(block: NestedContentBlock): NestedContentBlock {
  const newId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const duplicatedBlock: NestedContentBlock = {
    ...block,
    id: newId,
    children: block.children
      ? block.children.map((child: NestedContentBlock) => createDuplicate(child))
      : undefined
  };
  
  return duplicatedBlock;
}

/**
 * Validate the entire block structure
 */
export function validateBlockStructure(blocks: NestedContentBlock[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  function validateBlock(block: NestedContentBlock, parentType: ContentBlockType | null = null) {
    // Validate parent-child relationship if there's a parent
    if (parentType) {
      const blockType = block.type as ContentBlockType;
      const validation = canAddChild(
        parentType as ContentBlockType,
        blockType,
        [] // We're not checking max children here
      );
      
      if (!validation.allowed) {
        errors.push(`Invalid child type: ${blockType} cannot be a child of ${parentType}. ${validation.reason || ''}`);
      }
    }
    
    // Validate children recursively
    if (block.children && block.children.length > 0) {
      const blockType = block.type as ContentBlockType;
      
      // Validate each child
      block.children.forEach((child: NestedContentBlock) => {
        validateBlock(child, blockType);
      });
    }
  }
  
  // Start validation from top-level blocks
  blocks.forEach(block => validateBlock(block));
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
