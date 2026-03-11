import React, { useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Layout,
    Grid,
    Columns,
    Move,
    Settings,
    Trash2,
    Copy
} from 'lucide-react';
import ColumnDropZone from './ColumnDropZone';
import type { Section, Column, Block } from '@/types/editor';

// Re-export for backwards compatibility with existing imports.
export type LayoutSection = Section;
export type LayoutColumn = Column;

interface LayoutBuilderProps {
    sections: Section[];
    onSectionsChange: (sections: Section[]) => void;
    selectedSectionId: string | null;
    onSelectSection: (sectionId: string | null) => void;
    selectedColumnId?: string | null;
    onSelectColumn?: (columnId: string | null) => void;
    selectedBlockId?: string | null;
    onSelectBlock?: (blockId: string | null) => void;
    onBlockAdd?: (sectionId: string, columnId: string, block: Block, index?: number) => void;
    onBlockUpdate?: (blockId: string, updates: Partial<Block>) => void;
    onBlockDelete?: (sectionId: string, columnId: string, blockId: string) => void;
}

const ItemTypes = {
    SECTION: 'section',
    LAYOUT_TEMPLATE: 'layout_template',
};

// Predefined layout templates
const LAYOUT_TEMPLATES = [
    {
        id: 'single',
        name: 'Single Column',
        icon: <Layout className="w-6 h-6" />,
        columns: [{ width: 100 }]
    },
    {
        id: 'two-column',
        name: 'Two Columns',
        icon: <Columns className="w-6 h-6" />,
        columns: [{ width: 50 }, { width: 50 }]
    },
    {
        id: 'three-column',
        name: 'Three Columns',
        icon: <Grid className="w-6 h-6" />,
        columns: [{ width: 33.33 }, { width: 33.33 }, { width: 33.33 }]
    },
    {
        id: 'two-column-66-33',
        name: '2/3 + 1/3',
        icon: <Columns className="w-6 h-6" />,
        columns: [{ width: 66.66 }, { width: 33.33 }]
    },
    {
        id: 'two-column-33-66',
        name: '1/3 + 2/3',
        icon: <Columns className="w-6 h-6" />,
        columns: [{ width: 33.33 }, { width: 66.66 }]
    },
    {
        id: 'four-column',
        name: 'Four Columns',
        icon: <Grid className="w-6 h-6" />,
        columns: [{ width: 25 }, { width: 25 }, { width: 25 }, { width: 25 }]
    },
];

// Draggable Layout Template
function LayoutTemplate({ template }: { template: typeof LAYOUT_TEMPLATES[0] }) {
    const dragRef = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.LAYOUT_TEMPLATE,
        item: template,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    drag(dragRef);

    return (
        <div
            ref={dragRef}
            className={`p-3 bg-card border border-border rounded-lg cursor-move hover:border-primary/50 transition-all ${isDragging ? 'opacity-50' : ''
                }`}
        >
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-muted-foreground group-hover:text-primary transition-colors">{template.icon}</div>
                <span className="text-xs font-medium text-foreground">{template.name}</span>
                <div className="flex space-x-1">
                    {template.columns.map((col, index) => (
                        <div
                            key={index}
                            className="h-4 bg-muted rounded"
                            style={{ width: `${col.width / 4}px` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Section Component
function SectionComponent({
    section,
    index,
    moveSection,
    onSelect,
    isSelected,
    onDelete,
    onDuplicate,
    selectedColumnId,
    onSelectColumn,
    onBlockAdd,
    onBlockUpdate,
    onBlockDelete
}: {
    section: Section;
    index: number;
    moveSection: (dragIndex: number, hoverIndex: number) => void;
    onSelect: (sectionId: string) => void;
    isSelected: boolean;
    onDelete: (sectionId: string) => void;
    onDuplicate: (sectionId: string) => void;
    selectedColumnId?: string | null;
    onSelectColumn?: (columnId: string | null) => void;
    onBlockAdd: (columnId: string, block: Block) => void;
    onBlockUpdate: (columnId: string, blockId: string, updates: Partial<Block>) => void;
    onBlockDelete: (columnId: string, blockId: string) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.SECTION,
        collect: (monitor) => ({
            handlerId: monitor.getHandlerId(),
        }),
        hover(item: unknown, monitor) {
            const dragItem = item as { id: string; index: number };
            if (!ref.current) return;

            const dragIndex = dragItem.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveSection(dragIndex, hoverIndex);
            dragItem.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.SECTION,
        item: () => ({ id: section.id, index }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            data-handler-id={handlerId}
            className={`relative group border-2 transition-all ${isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
                } ${isDragging ? 'opacity-50' : ''}`}
            style={{
                backgroundColor: section.settings.backgroundColor,
                padding: section.settings.padding,
                margin: section.settings.margin,
                minHeight: section.settings.minHeight,
                backgroundImage: section.settings.backgroundImage
                    ? `url(${section.settings.backgroundImage})`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(section.id);
            }}
        >
            {/* Section Controls */}
            <div className={`absolute top-2 right-2 flex space-x-1 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10`}>
                <button
                    className="p-1 bg-card border border-border rounded hover:bg-muted text-foreground"
                    title="Move Section"
                >
                    <Move className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(section.id);
                    }}
                    className="p-1 bg-card border border-border rounded hover:bg-muted text-foreground"
                    title="Duplicate Section"
                >
                    <Copy className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(section.id);
                    }}
                    className="p-1 bg-card border border-border rounded hover:bg-destructive/10 text-destructive"
                    title="Delete Section"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {/* Section Label */}
            {isSelected && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded z-10">
                    Section: {section.layout}
                </div>
            )}

            {/* Columns */}
            <div className="flex h-full">
                {section.columns.map((column) => (
                    <div
                        key={column.id}
                        className="relative"
                        style={{
                            width: `${column.width}%`,
                            padding: '4px',
                        }}
                    >
                        <ColumnDropZone
                            column={column}
                            onBlockAdd={onBlockAdd}
                            onBlockUpdate={onBlockUpdate}
                            onBlockDelete={onBlockDelete}
                            isSelected={selectedColumnId === column.id}
                            onSelect={() => onSelectColumn?.(column.id)}
                        />

                        {/* Column controls */}
                        {isSelected && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    className="p-1 bg-card border border-border rounded hover:bg-muted text-foreground"
                                    title="Column Settings"
                                >
                                    <Settings className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main Layout Builder Component
export default function LayoutBuilder({
    sections,
    onSectionsChange,
    selectedSectionId,
    onSelectSection,
    selectedColumnId,
    onSelectColumn,
    selectedBlockId,
    onSelectBlock,
    onBlockAdd,
    onBlockUpdate,
    onBlockDelete
}: LayoutBuilderProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
        const newSections = [...sections];
        const draggedSection = newSections[dragIndex];
        newSections.splice(dragIndex, 1);
        newSections.splice(hoverIndex, 0, draggedSection);
        onSectionsChange(newSections);
    }, [sections, onSectionsChange]);

    // Block handling functions
    const handleBlockAdd = useCallback((columnId: string, block: Block) => {
        if (onBlockAdd) {
            // Find the section that contains this column
            const section = sections.find(s => s.columns.some(c => c.id === columnId));
            if (section) {
                onBlockAdd(section.id, columnId, block);
                return;
            }
        }

        // Fallback to local state management
        const newSections = sections.map(section => ({
            ...section,
            columns: section.columns.map(column =>
                column.id === columnId
                    ? { ...column, blocks: [...column.blocks, block] }
                    : column
            )
        }));
        onSectionsChange(newSections);
    }, [sections, onSectionsChange, onBlockAdd]);

    const handleBlockUpdate = useCallback((columnId: string, blockId: string, updates: Partial<Block>) => {
        if (onBlockUpdate) {
            onBlockUpdate(blockId, updates);
            return;
        }

        // Fallback to local state management
        const newSections = sections.map(section => ({
            ...section,
            columns: section.columns.map(column =>
                column.id === columnId
                    ? {
                        ...column,
                        blocks: column.blocks.map(block =>
                            block.id === blockId ? { ...block, ...updates } : block
                        )
                    }
                    : column
            )
        }));
        onSectionsChange(newSections);
    }, [sections, onSectionsChange, onBlockUpdate]);

    const handleBlockDelete = useCallback((columnId: string, blockId: string) => {
        if (onBlockDelete) {
            // Find the section that contains this column
            const section = sections.find(s => s.columns.some(c => c.id === columnId));
            if (section) {
                onBlockDelete(section.id, columnId, blockId);
                return;
            }
        }

        // Clear selection if deleting the selected block
        if (selectedBlockId === blockId && onSelectBlock) {
            onSelectBlock(null);
        }

        // Fallback to local state management
        const newSections = sections.map(section => ({
            ...section,
            columns: section.columns.map(column =>
                column.id === columnId
                    ? {
                        ...column,
                        blocks: column.blocks.filter(block => block.id !== blockId)
                    }
                    : column
            )
        }));
        onSectionsChange(newSections);
    }, [sections, onSectionsChange, onBlockDelete, selectedBlockId, onSelectBlock]);

    const addSection = useCallback((template: typeof LAYOUT_TEMPLATES[0]) => {
        const newSection: Section = {
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'section',
            layout: template.id as Section['layout'],
            columns: template.columns.map((col, index) => ({
                id: `column-${Date.now()}-${index}`,
                type: 'column' as const,
                width: col.width,
                blocks: [],
                settings: {
                    padding: '20px',
                    backgroundColor: 'transparent',
                    verticalAlign: 'top' as const,
                },
            })),
            settings: {
                backgroundColor: '#ffffff',
                padding: '40px 20px',
                margin: '0',
                fullWidth: false,
                minHeight: '200px',
            },
        };

        onSectionsChange([...sections, newSection]);
    }, [sections, onSectionsChange]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.LAYOUT_TEMPLATE,
        drop: (item: typeof LAYOUT_TEMPLATES[0], monitor) => {
            if (!monitor.didDrop()) {
                addSection(item);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [addSection]);

    const deleteSection = (sectionId: string) => {
        const newSections = sections.filter(section => section.id !== sectionId);
        onSectionsChange(newSections);
        if (selectedSectionId === sectionId) {
            onSelectSection(null);
        }
    };

    const duplicateSection = (sectionId: string) => {
        const sectionToDuplicate = sections.find(section => section.id === sectionId);
        if (sectionToDuplicate) {
            const duplicatedSection: Section = {
                ...sectionToDuplicate,
                id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                columns: sectionToDuplicate.columns.map(col => ({
                    ...col,
                    id: `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                })),
            };

            const sectionIndex = sections.findIndex(section => section.id === sectionId);
            const newSections = [...sections];
            newSections.splice(sectionIndex + 1, 0, duplicatedSection);
            onSectionsChange(newSections);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex h-full">
                {/* Layout Templates Sidebar */}
                <div className="w-64 bg-card border-r border-border p-4 h-full overflow-y-auto">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Layout Templates</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {LAYOUT_TEMPLATES.map((template) => (
                            <LayoutTemplate key={template.id} template={template} />
                        ))}
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-foreground mb-2">Instructions</h4>
                        <p className="text-xs text-muted-foreground">
                            Drag layout templates to the canvas to create sections.
                            You can then add content blocks to each column.
                        </p>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 h-full overflow-hidden bg-background/50 relative">
                    <div
                        ref={(node) => {
                            canvasRef.current = node;
                            drop(node);
                        }}
                        className={`absolute inset-0 overflow-y-auto p-8 transition-colors ${isOver ? 'bg-primary/5' : ''
                            }`}
                    >
                        {sections.length === 0 ? (
                            <div className="flex items-center justify-center h-96 text-muted-foreground">
                                <div className="text-center">
                                    <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-xl font-medium mb-2 text-foreground">Start Building Your Layout</h3>
                                    <p className="text-sm mb-4">Drag layout templates from the sidebar to create sections</p>
                                    <p className="text-xs text-muted-foreground/70">Each section can contain multiple columns for content</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sections.map((section, index) => (
                                    <SectionComponent
                                        key={section.id}
                                        section={section}
                                        index={index}
                                        moveSection={moveSection}
                                        onSelect={(sectionId) => onSelectSection(sectionId)}
                                        isSelected={selectedSectionId === section.id}
                                        onDelete={deleteSection}
                                        onDuplicate={duplicateSection}
                                        selectedColumnId={selectedColumnId}
                                        onSelectColumn={onSelectColumn}
                                        onBlockAdd={handleBlockAdd}
                                        onBlockUpdate={handleBlockUpdate}
                                        onBlockDelete={handleBlockDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
