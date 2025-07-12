import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Monitor, Tablet, Smartphone, ArrowLeft, ExternalLink, Share } from 'lucide-react';
import { Block, Funnel } from '@/stores/funnelStore';

interface FunnelPreviewProps {
    funnel: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        content: Block[];
        settings: Funnel['settings'];
        status: string;
        is_published: boolean;
    };
}

export default function FunnelPreview({ funnel }: FunnelPreviewProps) {
    const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const getDeviceWidth = () => {
        switch (selectedDevice) {
            case 'mobile':
                return '375px';
            case 'tablet':
                return '768px';
            case 'desktop':
            default:
                return '100%';
        }
    };

    const renderBlock = (block: Block) => {
        const commonProps = {
            'data-block-id': block.id,
            className: 'absolute',
            style: {
                left: block.position.x,
                top: block.position.y,
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
        <>
            <Head title={`Preview: ${funnel.name} - OpenFunnels`} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Link 
                                    href={route('funnel-editor.edit', funnel.id)} 
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Editor</span>
                                </Link>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <h1 className="text-lg font-semibold text-gray-900">Preview: {funnel.name}</h1>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {/* Device Selection */}
                                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={() => setSelectedDevice('desktop')}
                                        className={`p-2 rounded transition-colors ${
                                            selectedDevice === 'desktop' 
                                                ? 'bg-white shadow text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        title="Desktop View"
                                    >
                                        <Monitor className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedDevice('tablet')}
                                        className={`p-2 rounded transition-colors ${
                                            selectedDevice === 'tablet' 
                                                ? 'bg-white shadow text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        title="Tablet View"
                                    >
                                        <Tablet className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedDevice('mobile')}
                                        className={`p-2 rounded transition-colors ${
                                            selectedDevice === 'mobile' 
                                                ? 'bg-white shadow text-blue-600' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        title="Mobile View"
                                    >
                                        <Smartphone className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <button
                                    onClick={handleShare}
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Share className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Preview Content */}
                <div className="py-8">
                    <div className="flex justify-center">
                        <div 
                            className="bg-white shadow-lg relative mx-auto transition-all duration-300 ease-in-out min-h-screen"
                            style={{ 
                                width: getDeviceWidth(),
                                maxWidth: funnel.settings.maxWidth,
                                backgroundColor: funnel.settings.backgroundColor,
                            }}
                        >
                            {/* Render all blocks */}
                            {funnel.content.map(renderBlock)}
                            
                            {/* Empty State */}
                            {funnel.content.length === 0 && (
                                <div className="flex items-center justify-center h-96 text-gray-500">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Monitor className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-medium">No content to preview</p>
                                        <p className="text-sm">This funnel doesn't have any content yet</p>
                                        <Link 
                                            href={route('funnel-editor.edit', funnel.id)}
                                            className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <span>Start Building</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer Info */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                                <span>Viewing: {selectedDevice.charAt(0).toUpperCase() + selectedDevice.slice(1)} ({getDeviceWidth()})</span>
                                <span>•</span>
                                <span>{funnel.content.length} block{funnel.content.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${funnel.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className="capitalize">{funnel.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
