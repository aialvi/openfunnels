import React from 'react';
import { 
    Settings, 
    Palette, 
    Type,
    Image as ImageIcon,
    Square,
    Monitor,
    Smartphone,
    Tablet
} from 'lucide-react';
import { LayoutSection, LayoutColumn } from './LayoutBuilder';
import { ContentBlock } from './ContentBlockLibrary';

interface PropertiesPanelProps {
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
                <div className="flex items-center space-x-2 mb-4">
                    <Settings className="w-4 h-4" />
                    <h3 className="text-sm font-semibold">Section Properties</h3>
                </div>

                {/* Background Settings */}
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide flex items-center">
                        <Palette className="w-3 h-3 mr-1" />
                        Background
                    </h4>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Background Color
                        </label>
                        <input
                            type="color"
                            value={selectedSection.settings.backgroundColor}
                            onChange={(e) => onSectionUpdate(selectedSection.id, {
                                settings: { ...selectedSection.settings, backgroundColor: e.target.value }
                            })}
                            className="w-full h-8 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Background Image URL
                        </label>
                        <input
                            type="url"
                            value={selectedSection.settings.backgroundImage || ''}
                            onChange={(e) => onSectionUpdate(selectedSection.id, {
                                settings: { ...selectedSection.settings, backgroundImage: e.target.value }
                            })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Spacing Settings */}
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide flex items-center">
                        <Settings className="w-3 h-3 mr-1" />
                        Spacing
                    </h4>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Padding
                        </label>
                        <input
                            type="text"
                            value={selectedSection.settings.padding}
                            onChange={(e) => onSectionUpdate(selectedSection.id, {
                                settings: { ...selectedSection.settings, padding: e.target.value }
                            })}
                            placeholder="40px 20px"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Margin
                        </label>
                        <input
                            type="text"
                            value={selectedSection.settings.margin}
                            onChange={(e) => onSectionUpdate(selectedSection.id, {
                                settings: { ...selectedSection.settings, margin: e.target.value }
                            })}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Min Height
                        </label>
                        <input
                            type="text"
                            value={selectedSection.settings.minHeight}
                            onChange={(e) => onSectionUpdate(selectedSection.id, {
                                settings: { ...selectedSection.settings, minHeight: e.target.value }
                            })}
                            placeholder="200px"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Layout Settings */}
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Layout
                    </h4>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="fullWidth"
                            checked={selectedSection.settings.fullWidth}
                            onChange={(e) => onSectionUpdate(selectedSection.id, {
                                settings: { ...selectedSection.settings, fullWidth: e.target.checked }
                            })}
                            className="mr-2"
                        />
                        <label htmlFor="fullWidth" className="text-xs text-gray-600">
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
                <div className="flex items-center space-x-2 mb-4">
                    <Settings className="w-4 h-4" />
                    <h3 className="text-sm font-semibold">Column Properties</h3>
                </div>

                {/* Column Settings */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Width (%)
                        </label>
                        <input
                            type="number"
                            min="10"
                            max="100"
                            value={selectedColumn.width}
                            onChange={(e) => onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                width: parseFloat(e.target.value)
                            })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Padding
                        </label>
                        <input
                            type="text"
                            value={selectedColumn.settings.padding}
                            onChange={(e) => onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                settings: { ...selectedColumn.settings, padding: e.target.value }
                            })}
                            placeholder="20px"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Background Color
                        </label>
                        <input
                            type="color"
                            value={selectedColumn.settings.backgroundColor === 'transparent' ? '#ffffff' : selectedColumn.settings.backgroundColor}
                            onChange={(e) => onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                settings: { ...selectedColumn.settings, backgroundColor: e.target.value }
                            })}
                            className="w-full h-8 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Vertical Alignment
                        </label>
                        <select
                            value={selectedColumn.settings.verticalAlign}
                            onChange={(e) => onColumnUpdate(selectedSection.id, selectedColumn.id, {
                                settings: { ...selectedColumn.settings, verticalAlign: e.target.value as 'top' | 'middle' | 'bottom' }
                            })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                    {selectedBlock.type === 'text' && <Type className="w-4 h-4" />}
                    {selectedBlock.type === 'image' && <ImageIcon className="w-4 h-4" />}
                    {selectedBlock.type === 'button' && <Square className="w-4 h-4" />}
                    <h3 className="text-sm font-semibold capitalize">{selectedBlock.type} Block</h3>
                </div>

                {/* Block-specific properties would go here */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Padding
                        </label>
                        <input
                            type="text"
                            value={selectedBlock.settings.padding}
                            onChange={(e) => onBlockUpdate(selectedBlock.id, {
                                settings: { ...selectedBlock.settings, padding: e.target.value }
                            })}
                            placeholder="16px"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Margin
                        </label>
                        <input
                            type="text"
                            value={selectedBlock.settings.margin}
                            onChange={(e) => onBlockUpdate(selectedBlock.id, {
                                settings: { ...selectedBlock.settings, margin: e.target.value }
                            })}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Background Color
                        </label>
                        <input
                            type="color"
                            value={selectedBlock.settings.backgroundColor}
                            onChange={(e) => onBlockUpdate(selectedBlock.id, {
                                settings: { ...selectedBlock.settings, backgroundColor: e.target.value }
                            })}
                            className="w-full h-8 border border-gray-300 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Border Radius
                        </label>
                        <input
                            type="text"
                            value={selectedBlock.settings.borderRadius}
                            onChange={(e) => onBlockUpdate(selectedBlock.id, {
                                settings: { ...selectedBlock.settings, borderRadius: e.target.value }
                            })}
                            placeholder="8px"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderDevicePreview = () => (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold">Device Preview</h3>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => onDeviceChange('desktop')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        selectedDevice === 'desktop' ? 'bg-white shadow' : ''
                    }`}
                >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                </button>
                <button
                    onClick={() => onDeviceChange('tablet')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        selectedDevice === 'tablet' ? 'bg-white shadow' : ''
                    }`}
                >
                    <Tablet className="w-3 h-3" />
                    <span>Tablet</span>
                </button>
                <button
                    onClick={() => onDeviceChange('mobile')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        selectedDevice === 'mobile' ? 'bg-white shadow' : ''
                    }`}
                >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                </button>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="text-center text-gray-500 py-8">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Select an element to edit its properties</p>
            <p className="text-xs text-gray-400 mt-1">
                Click on sections, columns, or blocks to customize them
            </p>
        </div>
    );

    return (
        <div className="w-80 bg-white border-l border-gray-200 p-4 h-full overflow-y-auto">
            <div className="space-y-6">
                {/* Device Preview */}
                {renderDevicePreview()}

                {/* Properties */}
                <div className="border-t pt-4">
                    {selectedBlock && renderBlockProperties()}
                    {selectedColumn && !selectedBlock && renderColumnProperties()}
                    {selectedSection && !selectedColumn && !selectedBlock && renderSectionProperties()}
                    {!selectedSection && !selectedColumn && !selectedBlock && renderEmptyState()}
                </div>
            </div>
        </div>
    );
}
