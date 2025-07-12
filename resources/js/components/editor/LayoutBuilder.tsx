import React, { useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
    Layout, 
    Grid, 
    Columns, 
    Plus,
    Move,
    Settings,
    Trash2,
    Copy
} from 'lucide-react';

export interface LayoutSection {
    id: string;
    type: 'section';
    layout: 'single' | 'two-column' | 'three-column' | 'four-column' | 'custom';
    columns: LayoutColumn[];
    settings: {
        backgroundColor: string;
        padding: string;
        margin: string;
        fullWidth: boolean;
        backgroundImage?: string;
        minHeight: string;
    };
}

export interface LayoutColumn {
    id: string;
    type: 'column';
    width: number; // percentage
    blocks: Record<string, unknown>[]; // Content blocks will go here
    settings: {
        padding: string;
        backgroundColor: string;
        verticalAlign: 'top' | 'middle' | 'bottom';
    };
}

interface LayoutBuilderProps {
    sections: LayoutSection[];
    onSectionsChange: (sections: LayoutSection[]) => void;
    selectedSection: LayoutSection | null;
    onSelectSection: (section: LayoutSection | null) => void;
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
            className={`p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-400 transition-colors ${
                isDragging ? 'opacity-50' : ''
            }`}
        >
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-gray-600">{template.icon}</div>
                <span className="text-xs font-medium text-gray-700">{template.name}</span>
                <div className="flex space-x-1">
                    {template.columns.map((col, index) => (
                        <div
                            key={index}
                            className="h-4 bg-gray-300 rounded"
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
    onDuplicate 
}: {
    section: LayoutSection;
    index: number;
    moveSection: (dragIndex: number, hoverIndex: number) => void;
    onSelect: (section: LayoutSection) => void;
    isSelected: boolean;
    onDelete: (sectionId: string) => void;
    onDuplicate: (sectionId: string) => void;
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
            className={`relative group border-2 transition-all ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
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
                onSelect(section);
            }}
        >
            {/* Section Controls */}
            <div className={`absolute top-2 right-2 flex space-x-1 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <button
                    className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Move Section"
                >
                    <Move className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(section.id);
                    }}
                    className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Duplicate Section"
                >
                    <Copy className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(section.id);
                    }}
                    className="p-1 bg-white border border-gray-300 rounded hover:bg-red-50 text-red-600"
                    title="Delete Section"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {/* Section Label */}
            {isSelected && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    Section: {section.layout}
                </div>
            )}

            {/* Columns */}
            <div className="flex h-full">
                {section.columns.map((column) => (
                    <div
                        key={column.id}
                        className="border border-dashed border-gray-300 min-h-[100px] relative"
                        style={{
                            width: `${column.width}%`,
                            padding: column.settings.padding,
                            backgroundColor: column.settings.backgroundColor,
                            display: 'flex',
                            alignItems: column.settings.verticalAlign === 'top' ? 'flex-start' : 
                                      column.settings.verticalAlign === 'middle' ? 'center' : 'flex-end',
                        }}
                    >
                        {/* Column Drop Zone */}
                        <div className="w-full h-full flex items-center justify-center">
                            {column.blocks.length === 0 ? (
                                <div className="text-gray-400 text-center">
                                    <Plus className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm">Drop content here</p>
                                </div>
                            ) : (
                                <div className="w-full">
                                    {/* Render blocks here */}
                                    {column.blocks.map((block, blockIndex) => (
                                        <div key={blockIndex} className="mb-2">
                                            {/* Block content will be rendered here */}
                                            Block content
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Column controls */}
                        {isSelected && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
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
    selectedSection, 
    onSelectSection 
}: LayoutBuilderProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
        const newSections = [...sections];
        const draggedSection = newSections[dragIndex];
        newSections.splice(dragIndex, 1);
        newSections.splice(hoverIndex, 0, draggedSection);
        onSectionsChange(newSections);
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
    }));

    const addSection = (template: typeof LAYOUT_TEMPLATES[0]) => {
        const newSection: LayoutSection = {
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'section',
            layout: template.id as LayoutSection['layout'],
            columns: template.columns.map((col, index) => ({
                id: `column-${Date.now()}-${index}`,
                type: 'column',
                width: col.width,
                blocks: [],
                settings: {
                    padding: '20px',
                    backgroundColor: 'transparent',
                    verticalAlign: 'top',
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
    };

    const deleteSection = (sectionId: string) => {
        const newSections = sections.filter(section => section.id !== sectionId);
        onSectionsChange(newSections);
        if (selectedSection?.id === sectionId) {
            onSelectSection(null);
        }
    };

    const duplicateSection = (sectionId: string) => {
        const sectionToDuplicate = sections.find(section => section.id === sectionId);
        if (sectionToDuplicate) {
            const duplicatedSection: LayoutSection = {
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
                <div className="w-64 bg-white border-r border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Templates</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {LAYOUT_TEMPLATES.map((template) => (
                            <LayoutTemplate key={template.id} template={template} />
                        ))}
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions</h4>
                        <p className="text-xs text-gray-500">
                            Drag layout templates to the canvas to create sections. 
                            You can then add content blocks to each column.
                        </p>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 p-4">
                    <div
                        ref={(node) => {
                            canvasRef.current = node;
                            drop(node);
                        }}
                        className={`min-h-full border-2 border-dashed transition-colors ${
                            isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                        }`}
                    >
                        {sections.length === 0 ? (
                            <div className="flex items-center justify-center h-96 text-gray-500">
                                <div className="text-center">
                                    <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-medium mb-2">Start Building Your Layout</h3>
                                    <p className="text-sm mb-4">Drag layout templates from the sidebar to create sections</p>
                                    <p className="text-xs text-gray-400">Each section can contain multiple columns for content</p>
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
                                        onSelect={onSelectSection}
                                        isSelected={selectedSection?.id === section.id}
                                        onDelete={deleteSection}
                                        onDuplicate={duplicateSection}
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
