import FormFields from '@/components/funnel/FormFields';
import { getFormFields } from '@/lib/form-fields';
import { shareLink } from '@/lib/share';
import { Block, Funnel } from '@/stores/funnelStore';
import { BarChart3, ExternalLink, Maximize, Minimize, Monitor, Share, Smartphone, Tablet, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    const [shareLabel, setShareLabel] = useState('Share');

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
            if (e.key === '?') setShowShortcuts((prev) => !prev);
            // + and - for zoom
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                setZoomLevel((prev) => Math.min(prev + 0.1, 2));
            }
            if (e.key === '-') {
                e.preventDefault();
                setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
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
        const commonProps = {
            'data-block-id': block.id,
            className: 'w-full',
            style: {
                fontSize: (block.content.fontSize as string) || '16px',
                color: (block.content.color as string) || '#000000',
                backgroundColor: (block.content.backgroundColor as string) || 'transparent',
                padding: (block.content.padding as string) || '8px',
                borderRadius: (block.content.borderRadius as string) || '0px',
            },
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
                            src={(block.content.src as string) || 'https://via.placeholder.com/300x200?text=Image'}
                            alt={(block.content.alt as string) || 'Image'}
                            className="h-auto max-w-full"
                            style={{
                                borderRadius: (block.content.borderRadius as string) || '8px',
                                width: (block.content.width as string) || '100%',
                            }}
                        />
                    </div>
                );
            case 'button':
                return (
                    <button
                        key={block.id}
                        {...commonProps}
                        className={`${commonProps.className} cursor-pointer px-4 py-2 font-medium transition-opacity hover:opacity-80`}
                    >
                        {(block.content.text as string) || 'Click Me'}
                    </button>
                );
            case 'form':
                return (
                    <div key={block.id} {...commonProps} className={`${commonProps.className} min-w-64`}>
                        <div className="space-y-4">
                            <h3 className="font-semibold">{(block.content.title as string) || 'Subscribe to our newsletter'}</h3>
                            <FormFields fields={getFormFields(block.content)} formId={`modal-${block.id}`} disabled />
                            <button className="w-full rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700">
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
        if (!funnel.public_url) {
            setShareLabel('Publish first');
            return;
        }

        const result = await shareLink({
            title: funnel.name,
            text: funnel.description || 'Check out this funnel',
            url: funnel.public_url,
        });

        if (result === 'copied') {
            setShareLabel('Copied');
            window.setTimeout(() => setShareLabel('Share'), 2000);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black ${isFullscreen ? 'bg-opacity-100' : 'bg-opacity-50'}`}>
            <div
                className={`flex bg-white shadow-xl transition-all duration-300 ${
                    isFullscreen ? 'h-full w-full' : 'h-full max-h-[90vh] w-full max-w-7xl rounded-lg'
                }`}
            >
                {/* Analytics Sidebar */}
                {showAnalytics && !isFullscreen && (
                    <div className="flex w-80 flex-col border-r border-gray-200">
                        <div className="border-b border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900">Preview Analytics</h3>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <AnalyticsPreview funnel={funnel} />
                        </div>
                    </div>
                )}

                {/* Main Preview Area */}
                <div className="flex flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-semibold text-gray-900">Preview: {funnel.name}</h2>

                            {/* Device Selection */}
                            <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
                                <button
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={`rounded p-2 transition-colors ${
                                        previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    title="Desktop View (Press 1)"
                                >
                                    <Monitor className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('tablet')}
                                    className={`rounded p-2 transition-colors ${
                                        previewDevice === 'tablet' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    title="Tablet View (Press 2)"
                                >
                                    <Tablet className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={`rounded p-2 transition-colors ${
                                        previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    title="Mobile View (Press 3)"
                                >
                                    <Smartphone className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Zoom Controls */}
                            <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-1">
                                <button
                                    onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                                    className="rounded p-1 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
                                    title="Zoom out (-)"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </button>
                                <span className="min-w-[3rem] px-2 text-center text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
                                <button
                                    onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))}
                                    className="rounded p-1 text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
                                    title="Zoom in (+)"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            >
                                <Share className="h-4 w-4" />
                                <span>{shareLabel}</span>
                            </button>

                            <button
                                onClick={() => {
                                    // Open in new tab using the correct route
                                    window.open(route('funnel.preview', funnel.id), '_blank');
                                }}
                                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span>Open in new tab</span>
                            </button>

                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className={`rounded-lg p-2 transition-colors ${
                                    showAnalytics ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                title="Toggle analytics preview"
                            >
                                <BarChart3 className="h-5 w-5" />
                            </button>

                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                title={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen (F11)`}
                            >
                                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                            </button>

                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                title="Close (Escape)"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-auto bg-gray-100 p-8">
                        <div className="flex justify-center">
                            <div
                                className="relative mx-auto bg-white shadow-lg transition-all duration-500 ease-in-out"
                                style={{
                                    width: getPreviewWidth(),
                                    height: getPreviewHeight(),
                                    maxWidth: funnel.settings.maxWidth,
                                    backgroundColor: funnel.settings.backgroundColor,
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'center top',
                                }}
                            >
                                {/* Device Frame Visual Indicator */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform">
                                    <div className="flex items-center space-x-2 rounded-full border bg-white px-3 py-1 text-xs text-gray-600 shadow-md">
                                        {previewDevice === 'desktop' && <Monitor className="h-3 w-3" />}
                                        {previewDevice === 'tablet' && <Tablet className="h-3 w-3" />}
                                        {previewDevice === 'mobile' && <Smartphone className="h-3 w-3" />}
                                        <span className="capitalize">
                                            {previewDevice} ({getPreviewWidth()})
                                        </span>
                                    </div>
                                </div>

                                {/* Render all sections, columns, and blocks */}
                                {funnel.content.sections?.map((section) => (
                                    <div
                                        key={section.id}
                                        className="relative w-full"
                                        style={{
                                            backgroundColor: section.settings.backgroundColor,
                                            padding: section.settings.padding,
                                            minHeight: section.settings.minHeight,
                                        }}
                                    >
                                        <div
                                            className="mx-auto flex flex-col gap-4 md:flex-row"
                                            style={{
                                                maxWidth: section.settings.fullWidth ? '100%' : '1200px',
                                            }}
                                        >
                                            {section.columns.map((column) => (
                                                <div
                                                    key={column.id}
                                                    className="relative flex flex-col gap-4"
                                                    style={{
                                                        width: previewDevice === 'mobile' ? '100%' : column.width,
                                                        padding: column.settings.padding,
                                                        backgroundColor: column.settings.backgroundColor,
                                                        justifyContent:
                                                            column.settings.verticalAlign === 'middle'
                                                                ? 'center'
                                                                : column.settings.verticalAlign === 'bottom'
                                                                  ? 'flex-end'
                                                                  : 'flex-start',
                                                    }}
                                                >
                                                    {column.blocks.map(renderPreviewBlock)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State */}
                                {(!funnel.content.sections || funnel.content.sections.length === 0) && (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                                                <Monitor className="h-8 w-8 text-gray-400" />
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
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                                <span>
                                    Viewing: {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} ({getPreviewWidth()})
                                </span>
                                <span>•</span>
                                <span>
                                    {funnel.content.sections?.length || 0} section{funnel.content.sections?.length !== 1 ? 's' : ''}
                                </span>
                                <span>•</span>
                                <button onClick={() => setShowShortcuts(!showShortcuts)} className="text-blue-600 underline hover:text-blue-800">
                                    Shortcuts (?)
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`h-2 w-2 rounded-full ${funnel.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className="capitalize">{funnel.status}</span>
                            </div>
                        </div>

                        {/* Keyboard Shortcuts Panel */}
                        {showShortcuts && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <h4 className="mb-3 font-medium text-gray-900">Keyboard Shortcuts</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Close preview</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">Esc</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fullscreen</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">F11</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Desktop view</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">1</kbd>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tablet view</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">2</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mobile view</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">3</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Toggle shortcuts</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">?</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Zoom in</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">+</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Zoom out</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">-</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Reset zoom</span>
                                            <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">0</kbd>
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
