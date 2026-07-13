import { shareLink } from '@/lib/share';
import type { Block, Funnel } from '@/types/editor';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Monitor, Share, Smartphone, Tablet } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface FunnelPreviewProps {
    funnel: Funnel & { id: number; slug: string };
    previewMode?: boolean;
}

export default function FunnelPreview({ funnel, previewMode = false }: FunnelPreviewProps) {
    const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [submittingBlockId, setSubmittingBlockId] = useState<string | null>(null);
    const [submittedBlockId, setSubmittedBlockId] = useState<string | null>(null);
    const [shareLabel, setShareLabel] = useState('Share');

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

    const handleLeadSubmit = (event: FormEvent<HTMLFormElement>, block: Block) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        setSubmittingBlockId(block.id);

        router.post(
            `/funnels/${funnel.id}/leads`,
            {
                name: formData.get('name') || undefined,
                email: formData.get('email'),
                phone: formData.get('phone') || undefined,
                form_id: block.id,
                fields: Object.fromEntries(formData.entries()),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setSubmittedBlockId(block.id);
                },
                onFinish: () => setSubmittingBlockId(null),
            },
        );
    };

    const renderBlock = (block: Block) => {
        const commonProps = {
            'data-block-id': block.id,
            className: 'w-full',
            style: {
                fontSize: (block.content.fontSize as string) || '16px',
                color: (block.content.color as string) || '#000000',
                backgroundColor: (block.content.backgroundColor as string) || 'transparent',
                padding: (block.content.padding as string) || '8px',
                borderRadius: (block.content.borderRadius as string) || '0px',
                fontWeight: (block.content.fontWeight as string) || 'normal',
                textAlign: (block.content.textAlign as React.CSSProperties['textAlign']) || 'left',
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
                        <form className="space-y-4" onSubmit={(event) => handleLeadSubmit(event, block)}>
                            <h3 className="font-semibold">{(block.content.title as string) || 'Subscribe to our newsletter'}</h3>
                            {(block.content.showName as boolean | undefined) !== false && (
                                <input
                                    name="name"
                                    type="text"
                                    placeholder={(block.content.namePlaceholder as string) || 'Your name'}
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                            )}
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder={(block.content.placeholder as string) || 'Enter your email'}
                                className="w-full rounded border border-gray-300 p-2"
                            />
                            {(block.content.showPhone as boolean | undefined) === true && (
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder={(block.content.phonePlaceholder as string) || 'Phone number'}
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                            )}
                            <button
                                type="submit"
                                disabled={submittingBlockId === block.id}
                                className="w-full rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                            >
                                {submittingBlockId === block.id ? 'Submitting...' : (block.content.buttonText as string) || 'Subscribe'}
                            </button>
                            {submittedBlockId === block.id && (
                                <p className="text-sm font-medium text-green-600">
                                    {(block.content.successMessage as string) || 'Thanks. Your information was submitted.'}
                                </p>
                            )}
                        </form>
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
        <>
            <Head title={`Preview: ${funnel.name} - OpenFunnels`} />

            <div className={previewMode ? 'min-h-screen bg-gray-50' : 'min-h-screen bg-white'}>
                {/* Preview controls are private editor UI, not part of the public funnel. */}
                {previewMode && (
                    <div className="border-b border-gray-200 bg-white">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={route('funnel-editor.edit', funnel.id)}
                                        className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to Editor</span>
                                    </Link>
                                    <div className="h-6 w-px bg-gray-300"></div>
                                    <h1 className="text-lg font-semibold text-gray-900">Preview: {funnel.name}</h1>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* Device Selection */}
                                    <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
                                        <button
                                            onClick={() => setSelectedDevice('desktop')}
                                            className={`rounded p-2 transition-colors ${
                                                selectedDevice === 'desktop' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                            title="Desktop View"
                                        >
                                            <Monitor className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedDevice('tablet')}
                                            className={`rounded p-2 transition-colors ${
                                                selectedDevice === 'tablet' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                            title="Tablet View"
                                        >
                                            <Tablet className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedDevice('mobile')}
                                            className={`rounded p-2 transition-colors ${
                                                selectedDevice === 'mobile' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                            title="Mobile View"
                                        >
                                            <Smartphone className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleShare}
                                        className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        <Share className="h-4 w-4" />
                                        <span>{shareLabel}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview Content */}
                <div className={previewMode ? 'py-8' : ''}>
                    <div className="flex justify-center">
                        <div
                            className={`relative mx-auto min-h-screen bg-white transition-all duration-300 ease-in-out ${previewMode ? 'shadow-lg' : ''}`}
                            style={{
                                width: getDeviceWidth(),
                                maxWidth: funnel.settings.maxWidth,
                                backgroundColor: funnel.settings.backgroundColor,
                            }}
                        >
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
                                                    width: selectedDevice === 'mobile' ? '100%' : `${column.width}%`,
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
                                                {column.blocks.map(renderBlock)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {(!funnel.content.sections || funnel.content.sections.length === 0) && (
                                <div className="flex h-96 items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                                            <Monitor className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-medium">No content to preview</p>
                                        <p className="text-sm">This funnel doesn't have any content yet</p>
                                        {previewMode && (
                                            <Link
                                                href={route('funnel-editor.edit', funnel.id)}
                                                className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                            >
                                                <span>Start Building</span>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                {previewMode && (
                    <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white py-2">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    <span>
                                        Viewing: {selectedDevice.charAt(0).toUpperCase() + selectedDevice.slice(1)} ({getDeviceWidth()})
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {funnel.content.sections?.length || 0} section{funnel.content.sections?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`h-2 w-2 rounded-full ${funnel.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="capitalize">{funnel.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
