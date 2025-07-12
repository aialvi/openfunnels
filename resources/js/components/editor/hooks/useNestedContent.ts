import { useState, useCallback } from 'react';
import { NestedContentBlock } from '../NestedContentBlock';
import { 
  addBlockToParent, 
  updateBlockById, 
  deleteBlockById, 
  moveBlock, 
  duplicateBlock, 
  validateBlockStructure 
} from '../utils/ContentUtils';
import { ContentBlockType } from '../validation/ContentValidation';

export interface UseNestedContentReturn {
  blocks: NestedContentBlock[];
  selectedBlockId: string | null;
  selectedBlock: NestedContentBlock | null;
  
  // Block actions
  setBlocks: (blocks: NestedContentBlock[]) => void;
  selectBlock: (blockId: string | null) => void;
  addBlock: (block: NestedContentBlock) => void;
  addChildBlock: (parentId: string, block: NestedContentBlock) => void;
  updateBlock: (blockId: string, updates: Partial<NestedContentBlock>) => void;
  updateBlockChild: (parentId: string, childId: string, updates: Partial<NestedContentBlock>) => void;
  deleteBlock: (blockId: string) => void;
  deleteBlockChild: (parentId: string, childId: string) => void;
  moveBlockTo: (blockId: string, sourceParentId: string | null, targetParentId: string) => void;
  duplicateSelectedBlock: () => void;
  
  // Validation
  validateBlocks: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  // Helper functions
  getBlockTypeCount: (type: ContentBlockType) => number;
  hasBlocksOfType: (type: ContentBlockType) => boolean;
}

export function useNestedContent(initialBlocks: NestedContentBlock[] = []): UseNestedContentReturn {
  const [blocks, setBlocks] = useState<NestedContentBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Get the currently selected block
  const selectedBlock = selectedBlockId 
    ? blocks.find(block => block.id === selectedBlockId) || null 
    : null;
  
  // Select a block by ID
  const selectBlock = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
  }, []);
  
  // Add a new top-level block
  const addBlock = useCallback((block: NestedContentBlock) => {
    setBlocks(prevBlocks => [...prevBlocks, block]);
  }, []);
  
  // Add a child block to a parent
  const addChildBlock = useCallback((parentId: string, block: NestedContentBlock) => {
    setBlocks(prevBlocks => addBlockToParent(prevBlocks, parentId, block));
  }, []);
  
  // Update a block by ID
  const updateBlock = useCallback((blockId: string, updates: Partial<NestedContentBlock>) => {
    setBlocks(prevBlocks => updateBlockById(prevBlocks, blockId, updates));
  }, []);
  
  // Update a child block
  const updateBlockChild = useCallback((parentId: string, childId: string, updates: Partial<NestedContentBlock>) => {
    // First find the parent to update its children
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block => {
        if (block.id === parentId && block.children) {
          // Update the specific child
          const updatedChildren = block.children.map(child => 
            child.id === childId ? { ...child, ...updates } : child
          );
          return { ...block, children: updatedChildren };
        }
        return block;
      });
      return updatedBlocks;
    });
  }, []);
  
  // Delete a block by ID
  const deleteBlock = useCallback((blockId: string) => {
    // If deleting the selected block, clear the selection
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    setBlocks(prevBlocks => deleteBlockById(prevBlocks, blockId));
  }, [selectedBlockId]);
  
  // Delete a child block
  const deleteBlockChild = useCallback((parentId: string, childId: string) => {
    // If deleting the selected block, clear the selection
    if (selectedBlockId === childId) {
      setSelectedBlockId(null);
    }
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block => {
        if (block.id === parentId && block.children) {
          // Filter out the child to delete
          const updatedChildren = block.children.filter(child => child.id !== childId);
          return { ...block, children: updatedChildren };
        }
        return block;
      });
      return updatedBlocks;
    });
  }, [selectedBlockId]);
  
  // Move a block from one parent to another
  const moveBlockTo = useCallback((blockId: string, sourceParentId: string | null, targetParentId: string) => {
    setBlocks(prevBlocks => moveBlock(prevBlocks, blockId, sourceParentId, targetParentId));
  }, []);
  
  // Duplicate the selected block
  const duplicateSelectedBlock = useCallback(() => {
    if (!selectedBlockId) return;
    
    const result = duplicateBlock(blocks, selectedBlockId);
    setBlocks(result.blocks);
    // Optionally select the new block
    setSelectedBlockId(result.newBlockId);
  }, [blocks, selectedBlockId]);
  
  // Validate the block structure
  const validateBlocks = useCallback(() => {
    return validateBlockStructure(blocks);
  }, [blocks]);
  
  // Helper: Count blocks of a specific type
  const getBlockTypeCount = useCallback((type: ContentBlockType) => {
    let count = 0;
    
    function countBlocks(items: NestedContentBlock[]) {
      for (const item of items) {
        if (item.type === type) {
          count++;
        }
        if (item.children && item.children.length > 0) {
          countBlocks(item.children);
        }
      }
    }
    
    countBlocks(blocks);
    return count;
  }, [blocks]);
  
  // Helper: Check if there are any blocks of a specific type
  const hasBlocksOfType = useCallback((type: ContentBlockType) => {
    return getBlockTypeCount(type) > 0;
  }, [getBlockTypeCount]);
  
  return {
    blocks,
    selectedBlockId,
    selectedBlock,
    setBlocks,
    selectBlock,
    addBlock,
    addChildBlock,
    updateBlock,
    updateBlockChild,
    deleteBlock,
    deleteBlockChild,
    moveBlockTo,
    duplicateSelectedBlock,
    validateBlocks,
    getBlockTypeCount,
    hasBlocksOfType,
  };
}
