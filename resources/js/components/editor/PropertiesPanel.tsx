import { configurableFieldTypes, createFormField, getFormFields, normalizeFieldName } from '@/lib/form-fields';
import type { Block as ContentBlock, FormField, Column as LayoutColumn, Section as LayoutSection } from '@/types/editor';
import {
    ChevronDown,
    ChevronUp,
    FileText,
    Image as ImageIcon,
    Monitor,
    Palette,
    Plus,
    Settings,
    Smartphone,
    Square,
    Tablet,
    Trash2,
    Type,
} from 'lucide-react';
import BlockContentInspector from './BlockContentInspector';

interface PropertiesPanelProps {
    embedded?: boolean;
    forceExpanded?: boolean;
    selectedSection: LayoutSection | null;
    selectedColumn: LayoutColumn | null;
    selectedBlock: ContentBlock | null;
    selectedDevice: 'desktop' | 'tablet' | 'mobile';
    onSectionUpdate: (sectionId: string, updates: Partial<LayoutSection>) => void;
    onColumnUpdate: (sectionId: string, columnId: string, updates: Partial<LayoutColumn>) => void;
    onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
    onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export default function PropertiesPanel({
    embedded = false,
    forceExpanded = false,
    selectedSection,
    selectedColumn,
    selectedBlock,
    selectedDevice,
    onSectionUpdate,
    onColumnUpdate,
    onBlockUpdate,
    onDeviceChange,
}: PropertiesPanelProps) {
    const renderSectionProperties = () => {
        if (!selectedSection) return null;

        return (
            <div className="space-y-4">
                <div className="mb-4 flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Section Properties</h3>
                </div>

                {/* Background Settings */}
                <div className="space-y-3">
                    <h4 className="flex items-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <Palette className="mr-1 h-3 w-3" />
                        Background
                    </h4>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Background Color</label>
                        <input
                            type="color"
                            value={selectedSection.settings.backgroundColor}
                            onChange={(e) =>
                                onSectionUpdate(selectedSection.id, {
                                    settings: { ...selectedSection.settings, backgroundColor: e.target.value },
                                })
                            }
                            className="h-8 w-full rounded border border-border bg-background"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Background Image URL</label>
                        <input
                            type="url"
                            value={selectedSection.settings.backgroundImage || ''}
                            onChange={(e) =>
                                onSectionUpdate(selectedSection.id, {
                                    settings: { ...selectedSection.settings, backgroundImage: e.target.value },
                                })
                            }
                            placeholder="https://example.com/image.jpg"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Spacing Settings */}
                <div className="space-y-3">
                    <h4 className="flex items-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <Settings className="mr-1 h-3 w-3" />
                        Spacing
                    </h4>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Padding</label>
                        <input
                            type="text"
                            value={selectedSection.settings.padding}
                            onChange={(e) =>
                                onSectionUpdate(selectedSection.id, {
                                    settings: { ...selectedSection.settings, padding: e.target.value },
                                })
                            }
                            placeholder="40px 20px"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Margin</label>
                        <input
                            type="text"
                            value={selectedSection.settings.margin}
                            onChange={(e) =>
                                onSectionUpdate(selectedSection.id, {
                                    settings: { ...selectedSection.settings, margin: e.target.value },
                                })
                            }
                            placeholder="0"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Min Height</label>
                        <input
                            type="text"
                            value={selectedSection.settings.minHeight}
                            onChange={(e) =>
                                onSectionUpdate(selectedSection.id, {
                                    settings: { ...selectedSection.settings, minHeight: e.target.value },
                                })
                            }
                            placeholder="200px"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Layout Settings */}
                <div className="space-y-3">
                    <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Layout</h4>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="fullWidth"
                            checked={selectedSection.settings.fullWidth}
                            onChange={(e) =>
                                onSectionUpdate(selectedSection.id, {
                                    settings: { ...selectedSection.settings, fullWidth: e.target.checked },
                                })
                            }
                            className="mr-2 accent-primary"
                        />
                        <label htmlFor="fullWidth" className="text-xs text-muted-foreground">
                            Full Width Section
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    const renderColumnProperties = () => {
        if (!selectedColumn || !selectedSection) return null;

        return (
            <div className="space-y-4">
                <div className="mb-4 flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Column Properties</h3>
                </div>

                {/* Column Settings */}
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Width (%)</label>
                        <input
                            type="number"
                            min="10"
                            max="100"
                            value={selectedColumn.width}
                            onChange={(e) =>
                                onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                    width: parseFloat(e.target.value),
                                })
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Padding</label>
                        <input
                            type="text"
                            value={selectedColumn.settings.padding}
                            onChange={(e) =>
                                onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                    settings: { ...selectedColumn.settings, padding: e.target.value },
                                })
                            }
                            placeholder="20px"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Background Color</label>
                        <input
                            type="color"
                            value={selectedColumn.settings.backgroundColor === 'transparent' ? '#ffffff' : selectedColumn.settings.backgroundColor}
                            onChange={(e) =>
                                onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                    settings: { ...selectedColumn.settings, backgroundColor: e.target.value },
                                })
                            }
                            className="h-8 w-full rounded border border-border bg-background"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Vertical Alignment</label>
                        <select
                            value={selectedColumn.settings.verticalAlign}
                            onChange={(e) =>
                                onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                    settings: { ...selectedColumn.settings, verticalAlign: e.target.value as 'top' | 'middle' | 'bottom' },
                                })
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                            <option value="top">Top</option>
                            <option value="middle">Middle</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    const renderBlockProperties = () => {
        if (!selectedBlock) return null;

        const updateContent = (updates: Record<string, unknown>) => {
            onBlockUpdate(selectedBlock.id, {
                content: { ...selectedBlock.content, ...updates },
            });
        };

        const renderFormProperties = () => {
            const fields = getFormFields(selectedBlock.content);
            const updateField = (fieldId: string, updates: Partial<FormField>) => {
                updateContent({ fields: fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)) });
            };

            const removeField = (fieldId: string) => {
                updateContent({ fields: fields.filter((field) => field.id !== fieldId) });
            };

            const moveField = (index: number, direction: -1 | 1) => {
                const targetIndex = index + direction;
                if (targetIndex < 0 || targetIndex >= fields.length) return;

                const reordered = [...fields];
                const [field] = reordered.splice(index, 1);
                reordered.splice(targetIndex, 0, field);
                updateContent({ fields: reordered });
            };

            return (
                <div className="space-y-4 border-b border-border pb-4">
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Form title</label>
                            <input
                                type="text"
                                value={(selectedBlock.content.title as string) || ''}
                                onChange={(event) => updateContent({ title: event.target.value })}
                                placeholder="Join our newsletter"
                                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Button label</label>
                            <input
                                type="text"
                                value={(selectedBlock.content.buttonText as string) || ''}
                                onChange={(event) => updateContent({ buttonText: event.target.value })}
                                placeholder="Submit"
                                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Success message</label>
                            <textarea
                                value={(selectedBlock.content.successMessage as string) || ''}
                                onChange={(event) => updateContent({ successMessage: event.target.value })}
                                placeholder="Thanks. Your information was submitted."
                                rows={2}
                                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Fields</h4>
                            <button
                                type="button"
                                onClick={() => updateContent({ fields: [...fields, createFormField(fields)] })}
                                className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-3 w-3" /> Add field
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => {
                                const isEmail = field.name === 'email';
                                const duplicateName = fields.some(
                                    (candidate, candidateIndex) => candidate.name === field.name && candidateIndex !== index,
                                );

                                return (
                                    <div key={field.id} className="rounded-lg border border-border bg-muted/30 p-3">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground">
                                                <div className="flex">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveField(index, -1)}
                                                        disabled={index === 0}
                                                        className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                                                        title="Move field up"
                                                    >
                                                        <ChevronUp className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveField(index, 1)}
                                                        disabled={index === fields.length - 1}
                                                        className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                                                        title="Move field down"
                                                    >
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <span className="truncate">{field.label || field.name || `Field ${index + 1}`}</span>
                                                {isEmail && (
                                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                                        Required lead ID
                                                    </span>
                                                )}
                                            </div>
                                            {!isEmail && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField(field.id)}
                                                    className="text-muted-foreground hover:text-destructive"
                                                    title="Remove field"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <label className="col-span-2">
                                                <span className="mb-1 block text-[11px] text-muted-foreground">Label</span>
                                                <input
                                                    value={field.label}
                                                    onChange={(event) => updateField(field.id, { label: event.target.value })}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                                                />
                                            </label>
                                            <label>
                                                <span className="mb-1 block text-[11px] text-muted-foreground">Type</span>
                                                <select
                                                    value={field.type}
                                                    disabled={isEmail}
                                                    onChange={(event) => {
                                                        const type = event.target.value as FormField['type'];
                                                        updateField(field.id, { type, required: type === 'hidden' ? false : field.required });
                                                    }}
                                                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground disabled:opacity-60"
                                                >
                                                    {configurableFieldTypes
                                                        .filter((type) => isEmail || type.value !== 'email')
                                                        .map((type) => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                </select>
                                            </label>
                                            <label>
                                                <span className="mb-1 block text-[11px] text-muted-foreground">Field name</span>
                                                <input
                                                    value={field.name}
                                                    disabled={isEmail}
                                                    onChange={(event) => updateField(field.id, { name: normalizeFieldName(event.target.value) })}
                                                    className={`w-full rounded border bg-background px-2 py-1 text-xs text-foreground disabled:opacity-60 ${duplicateName ? 'border-destructive' : 'border-border'}`}
                                                />
                                            </label>
                                            {field.type === 'select' ? (
                                                <label className="col-span-2">
                                                    <span className="mb-1 block text-[11px] text-muted-foreground">Options (one per line)</span>
                                                    <textarea
                                                        value={(field.options || []).join('\n')}
                                                        onChange={(event) =>
                                                            updateField(field.id, {
                                                                options: event.target.value
                                                                    .split('\n')
                                                                    .map((option) => option.trim())
                                                                    .filter(Boolean),
                                                            })
                                                        }
                                                        rows={3}
                                                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                                                    />
                                                </label>
                                            ) : (
                                                <label className="col-span-2">
                                                    <span className="mb-1 block text-[11px] text-muted-foreground">
                                                        {field.type === 'hidden' ? 'Value' : 'Placeholder'}
                                                    </span>
                                                    <input
                                                        value={field.type === 'hidden' ? field.defaultValue || '' : field.placeholder || ''}
                                                        onChange={(event) =>
                                                            updateField(
                                                                field.id,
                                                                field.type === 'hidden'
                                                                    ? { defaultValue: event.target.value }
                                                                    : { placeholder: event.target.value },
                                                            )
                                                        }
                                                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                disabled={isEmail || field.type === 'hidden'}
                                                onChange={(event) => updateField(field.id, { required: event.target.checked })}
                                                className="accent-primary"
                                            />
                                            Required
                                        </label>
                                        {duplicateName && <p className="mt-1 text-[11px] text-destructive">Field names must be unique.</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-4">
                <div className="mb-4 flex items-center space-x-2 text-foreground">
                    {selectedBlock.type === 'text' && <Type className="h-4 w-4" />}
                    {selectedBlock.type === 'image' && <ImageIcon className="h-4 w-4" />}
                    {selectedBlock.type === 'button' && <Square className="h-4 w-4" />}
                    {selectedBlock.type === 'form' && <FileText className="h-4 w-4" />}
                    <h3 className="text-sm font-semibold capitalize">{selectedBlock.type} Block</h3>
                </div>

                {selectedBlock.type === 'form' && renderFormProperties()}
                {selectedBlock.type !== 'form' && (
                    <BlockContentInspector block={selectedBlock} onUpdate={(updates) => onBlockUpdate(selectedBlock.id, updates)} />
                )}

                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Padding</label>
                        <input
                            type="text"
                            value={selectedBlock.settings.padding}
                            onChange={(e) =>
                                onBlockUpdate(selectedBlock.id, {
                                    settings: { ...selectedBlock.settings, padding: e.target.value },
                                })
                            }
                            placeholder="16px"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Margin</label>
                        <input
                            type="text"
                            value={selectedBlock.settings.margin}
                            onChange={(e) =>
                                onBlockUpdate(selectedBlock.id, {
                                    settings: { ...selectedBlock.settings, margin: e.target.value },
                                })
                            }
                            placeholder="0"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Background Color</label>
                        <input
                            type="color"
                            value={selectedBlock.settings.backgroundColor}
                            onChange={(e) =>
                                onBlockUpdate(selectedBlock.id, {
                                    settings: { ...selectedBlock.settings, backgroundColor: e.target.value },
                                })
                            }
                            className="h-8 w-full rounded border border-border bg-background"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Border Radius</label>
                        <input
                            type="text"
                            value={selectedBlock.settings.borderRadius}
                            onChange={(e) =>
                                onBlockUpdate(selectedBlock.id, {
                                    settings: { ...selectedBlock.settings, borderRadius: e.target.value },
                                })
                            }
                            placeholder="8px"
                            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderDevicePreview = () => (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Device Preview</h3>
            <div className="flex items-center space-x-2 rounded-lg bg-muted p-1">
                <button
                    onClick={() => onDeviceChange('desktop')}
                    className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition-colors ${
                        selectedDevice === 'desktop' ? 'bg-background text-primary shadow' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Monitor className="h-3 w-3" />
                    <span>Desktop</span>
                </button>
                <button
                    onClick={() => onDeviceChange('tablet')}
                    className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition-colors ${
                        selectedDevice === 'tablet' ? 'bg-background text-primary shadow' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Tablet className="h-3 w-3" />
                    <span>Tablet</span>
                </button>
                <button
                    onClick={() => onDeviceChange('mobile')}
                    className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition-colors ${
                        selectedDevice === 'mobile' ? 'bg-background text-primary shadow' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Smartphone className="h-3 w-3" />
                    <span>Mobile</span>
                </button>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="py-8 text-center text-muted-foreground">
            <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm">Select an element to edit its properties</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Click on sections, columns, or blocks to customize them</p>
        </div>
    );

    const hasSelection = Boolean(selectedSection || selectedColumn || selectedBlock);

    return (
        <div className={embedded ? 'pt-4' : 'h-full w-80 overflow-y-auto border-l border-border bg-card p-4'}>
            <div className="space-y-6">
                {/* Device Preview */}
                {(!forceExpanded || !hasSelection) && renderDevicePreview()}

                {/* Properties */}
                <div className={forceExpanded && hasSelection ? '' : 'border-t border-border pt-4'}>
                    {selectedBlock && renderBlockProperties()}
                    {selectedColumn && !selectedBlock && renderColumnProperties()}
                    {selectedSection && !selectedColumn && !selectedBlock && renderSectionProperties()}
                    {!selectedSection && !selectedColumn && !selectedBlock && renderEmptyState()}
                </div>
            </div>
        </div>
    );
}
