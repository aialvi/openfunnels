import React, { useState, useEffect } from 'react';
import { X, Monitor, Tablet, Smartphone, ExternalLink, Share, Maximize, Minimize, ZoomIn, ZoomOut, BarChart3 } from 'lucide-react';
import { Block, Funnel } from '@/stores/funnelStore';
import AnalyticsPreview from './AnalyticsPreview';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    funnel: Funnel;
}

export default function PreviewModal({ isOpen, onClose, funnel }: PreviewModalProps) {
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Keyboard shortcuts for preview modal
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to close
            if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
            // F11 or Cmd/Ctrl + Shift + F for fullscreen
            if (e.key === 'F11' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F')) {
                e.preventDefault();
                setIsFullscreen(!isFullscreen);
            }
            // 1, 2, 3 for device switching
            if (e.key === '1') setPreviewDevice('desktop');
            if (e.key === '2') setPreviewDevice('tablet');
            if (e.key === '3') setPreviewDevice('mobile');
            // ? to toggle shortcuts
            if (e.key === '?') setShowShortcuts(prev => !prev);
            // + and - for zoom
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                setZoomLevel(prev => Math.min(prev + 0.1, 2));
            }
            if (e.key === '-') {
                e.preventDefault();
                setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
            }
            // 0 to reset zoom
            if (e.key === '0') {
                e.preventDefault();
                setZoomLevel(1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isFullscreen, onClose]);

    if (!isOpen) return null;

    const getPreviewWidth = () => {
        switch (previewDevice) {
            case 'mobile':
                return '375px';
            case 'tablet':
                return '768px';
            case 'desktop':
            default:
                return '1200px';
        }
    };

    const getPreviewHeight = () => {
        switch (previewDevice) {
            case 'mobile':
                return '667px';
            case 'tablet':
                return '1024px';
            case 'desktop':
            default:
                return '800px';
        }
    };

    const renderPreviewBlock = (block: Block) => {
        const blockStyle = {
            left: block.position.x,
            top: block.position.y,
            fontSize: (block.content.fontSize as string) || '16px',
            color: (block.content.color as string) || '#000000',
            backgroundColor: (block.content.backgroundColor as string) || 'transparent',
            padding: (block.content.padding as string) || '8px',
            borderRadius: (block.content.borderRadius as string) || '0px',
        };

        const commonProps = {
            className: 'absolute',
            style: blockStyle,
        };

        switch (block.type) {
            case 'text':
                return (
                    <div key={block.id} {...commonProps}>
                        {(block.content.text as string) || 'Enter text here'}
                    </div>
                );
            case 'image':
                return (
                    <div key={block.id} {...commonProps}>
                        <img 
                            src={block.content.src as string || 'https://via.placeholder.com/300x200?text=Image'} 
                            alt={block.content.alt as string || 'Image'} 
                            className="max-w-full h-auto"
                            style={{ 
                                borderRadius: (block.content.borderRadius as string) || '8px',
                                width: (block.content.width as string) || '300px',
                                height: (block.content.height as string) || '200px'
                            }}
                        />
                    </div>
                );
            case 'button':
                return (
                    <button 
                        key={block.id} 
                        {...commonProps} 
                        className={`${commonProps.className} px-4 py-2 font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                        {(block.content.text as string) || 'Click Me'}
                    </button>
                );
            case 'form':
                return (
                    <div key={block.id} {...commonProps} className={`${commonProps.className} min-w-64`}>
                        <div className="space-y-4">
                            <h3 className="font-semibold">{(block.content.title as string) || 'Subscribe to our newsletter'}</h3>
                            <input 
                                type="email" 
                                placeholder={(block.content.placeholder as string) || 'Enter your email'}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
                                {(block.content.buttonText as string) || 'Subscribe'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: funnel.name,
                    text: funnel.description || 'Check out this funnel',
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black ${isFullscreen ? 'bg-opacity-100' : 'bg-opacity-50'}`}>
            <div className={`bg-white shadow-xl flex transition-all duration-300 ${
                isFullscreen 
                    ? 'w-full h-full' 
                    : 'rounded-lg w-full h-full max-w-7xl max-h-[90vh]'
            }`}>
                {/* Analytics Sidebar */}
                {showAnalytics && !isFullscreen && (
                    <div className="w-80 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Preview Analytics</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-auto">
                            <AnalyticsPreview funnel={funnel} />
                        </div>
                    </div>
                )}
                
                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">Preview: {funnel.name}</h2>
                        
                        {/* Device Selection */}
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={() => setPreviewDevice('desktop')}
                                className={`p-2 rounded transition-colors ${
                                    previewDevice === 'desktop' 
                                        ? 'bg-white shadow text-blue-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Desktop View (Press 1)"
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setPreviewDevice('tablet')}
                                className={`p-2 rounded transition-colors ${
                                    previewDevice === 'tablet' 
                                        ? 'bg-white shadow text-blue-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Tablet View (Press 2)"
                            >
                                <Tablet className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setPreviewDevice('mobile')}
                                className={`p-2 rounded transition-colors ${
                                    previewDevice === 'mobile' 
                                        ? 'bg-white shadow text-blue-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Mobile View (Press 3)"
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {/* Zoom Controls */}
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                                title="Zoom out (-)"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-sm text-gray-600 min-w-[3rem] text-center">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                                title="Zoom in (+)"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Share className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                // Open in new tab using the correct route
                                window.open(route('funnel.preview', funnel.id), '_blank');
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open in new tab</span>
                        </button>

                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`p-2 rounded-lg transition-colors ${
                                showAnalytics 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title="Toggle analytics preview"
                        >
                            <BarChart3 className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen (F11)`}
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close (Escape)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Preview Content */}
                <div className="flex-1 bg-gray-100 p-8 overflow-auto">
                    <div className="flex justify-center">
                        <div 
                            className="bg-white shadow-lg relative mx-auto transition-all duration-500 ease-in-out"
                            style={{ 
                                width: getPreviewWidth(),
                                height: getPreviewHeight(),
                                maxWidth: funnel.settings.maxWidth,
                                backgroundColor: funnel.settings.backgroundColor,
                                transform: `scale(${zoomLevel})`,
                                transformOrigin: 'center top'
                            }}
                        >
                            {/* Device Frame Visual Indicator */}
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full shadow-md border text-xs text-gray-600">
                                    {previewDevice === 'desktop' && <Monitor className="w-3 h-3" />}
                                    {previewDevice === 'tablet' && <Tablet className="w-3 h-3" />}
                                    {previewDevice === 'mobile' && <Smartphone className="w-3 h-3" />}
                                    <span className="capitalize">{previewDevice} ({getPreviewWidth()})</span>
                                </div>
                            </div>

                            {/* Render all blocks */}
                            {funnel.content.map(renderPreviewBlock)}
                            
                            {/* Empty State */}
                            {funnel.content.length === 0 && (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Monitor className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-medium">No content to preview</p>
                                        <p className="text-sm">Add some blocks to see your funnel</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                            <span>Viewing: {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} ({getPreviewWidth()})</span>
                            <span>•</span>
                            <span>{funnel.content.length} block{funnel.content.length !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <button 
                                onClick={() => setShowShortcuts(!showShortcuts)}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Shortcuts (?)
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${funnel.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="capitalize">{funnel.status}</span>
                        </div>
                    </div>
                    
                    {/* Keyboard Shortcuts Panel */}
                    {showShortcuts && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Close preview</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fullscreen</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">F11</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Desktop view</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">1</kbd>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tablet view</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">2</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mobile view</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">3</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Toggle shortcuts</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Zoom in</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">+</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Zoom out</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">-</kbd>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reset zoom</span>
                                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">0</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
}
