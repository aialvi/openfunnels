import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NestedContentBlock } from './NestedContentBlock';
import { useNestedContent } from './hooks/useNestedContent';
import { getAllowedChildren, ContentBlockType } from './validation/ContentValidation';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// Sample renderer for content blocks based on type
const renderBlockContent = (block: NestedContentBlock) => {
  const style = {
    padding: '8px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: '#fff'
  };

  switch (block.type) {
    case 'text':
      return <div style={style} className="text-block">{block.content.text as string || 'Text Block'}</div>;
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
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {block.content.text as string || 'Button'}
          </button>
        </div>
      );
    case 'container':
      return (
        <div style={{ ...style, backgroundColor: '#f9fafb' }} className="container-block">
          <div className="text-sm font-medium mb-2">Container</div>
          <p className="text-xs text-gray-500">Can hold {getAllowedChildren('container').join(', ')} blocks</p>
        </div>
      );
    case 'grid':
      return (
        <div style={{ ...style, backgroundColor: '#f0f9ff' }} className="grid-block">
          <div className="text-sm font-medium mb-2">Grid Layout</div>
          <p className="text-xs text-gray-500">Displays items in a grid format</p>
        </div>
      );
    case 'tabs':
      return (
        <div style={{ ...style, backgroundColor: '#f5f3ff' }} className="tabs-block">
          <div className="text-sm font-medium mb-2">Tabs Component</div>
          <div className="flex border-b">
            <div className="px-4 py-2 border-b-2 border-indigo-500 text-xs">Tab 1</div>
            <div className="px-4 py-2 text-xs text-gray-500">Tab 2</div>
            <div className="px-4 py-2 text-xs text-gray-500">+ Add Tab</div>
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ ...style, backgroundColor: '#fef3f2' }} className="accordion-block">
          <div className="text-sm font-medium mb-2">Accordion</div>
          <div className="text-xs border rounded overflow-hidden">
            <div className="p-2 bg-gray-50 flex justify-between">
              Section 1 <span>▼</span>
            </div>
            <div className="p-2 border-t">Content goes here</div>
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
    { type: 'accordion', name: 'Accordion', description: 'Expandable sections' }
  ];

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <h3 className="font-medium text-gray-800 mb-3">Content Blocks</h3>
      <div className="space-y-2">
        {blockTypes.map((blockType) => (
          <DraggableBlockItem 
            key={blockType.type} 
            type={blockType.type} 
            name={blockType.name}
            description={blockType.description}
          />
        ))}
      </div>
    </div>
  );
};

// Draggable block item for the palette
const DraggableBlockItem = ({ 
  type, 
  name, 
  description 
}: { 
  type: ContentBlockType; 
  name: string;
  description: string;
}) => {
  // In a real implementation, you'd use react-dnd useDrag hook here
  return (
    <div 
      className="border border-gray-200 rounded p-3 bg-gray-50 hover:bg-gray-100 cursor-move"
      draggable
      data-block-type={type}
    >
      <div className="font-medium text-sm">{name}</div>
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
          }
        }
      ]
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
          }
        }
      ]
    }
  ];

  // Use our custom hook for managing nested content
  const {
    blocks,
    selectedBlockId,
    selectedBlock,
    selectBlock,
    addBlock,
    addChildBlock,
    updateBlock,
    deleteBlock,
    validateBlocks
  } = useNestedContent(initialBlocks);

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
      }
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
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Interactive Content Hierarchy Demo</h1>
        
        <div className="flex gap-6">
          {/* Left side - Content editor */}
          <div className="flex-1">
            <div className="bg-white border rounded-lg shadow-sm p-6 mb-4">
              <h2 className="text-lg font-medium mb-4">Content Preview</h2>
              
              <div className="space-y-4">
                {blocks.map(renderBlock)}
              </div>
              
              {blocks.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                  <p>No content blocks added yet</p>
                  <p className="text-sm mt-2">Use the buttons below to add content</p>
                </div>
              )}
            </div>
            
            {/* Demo controls */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Quick Add Demo Blocks</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleAddDemoBlock('text')}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Add Text
                </button>
                <button 
                  onClick={() => handleAddDemoBlock('container')}
                  className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  Add Container
                </button>
                <button 
                  onClick={() => handleAddDemoBlock('tabs')}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Add Tabs
                </button>
                <button 
                  onClick={() => handleAddDemoBlock('accordion')}
                  className="px-3 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
                >
                  Add Accordion
                </button>
                <button
                  onClick={() => setValidationResults(validateBlocks())}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
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
              <div className="bg-white border rounded-lg shadow-sm p-4 mt-4">
                <h3 className="font-medium text-gray-800 mb-2">Selected Block</h3>
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
              <div className="mt-4 bg-white border rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  {validationResults.isValid ? (
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                  )}
                  Validation Results
                </h3>
                
                {validationResults.isValid ? (
                  <div className="text-green-600 text-sm">
                    Content structure is valid!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {validationResults.errors.map((error, i) => (
                      <div key={i} className="text-sm text-red-600 flex">
                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                    
                    {validationResults.warnings.map((warning, i) => (
                      <div key={i} className="text-sm text-amber-600 flex">
                        <Info className="w-4 h-4 mr-1 flex-shrink-0" />
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
