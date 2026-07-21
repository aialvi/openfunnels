import FunnelBlock from '@/components/funnel/FunnelBlock';
import { getSuccessAction } from '@/lib/form-fields';
import { shareLink } from '@/lib/share';
import type { Block, Funnel } from '@/types/editor';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Monitor, Share, Smartphone, Tablet } from 'lucide-react';
import { type CSSProperties, type FormEvent, useState } from 'react';

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
        const search = new URLSearchParams(window.location.search);
        const attribution = Object.fromEntries(
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
                .map((key) => [key, search.get(key)] as const)
                .filter((entry): entry is [string, string] => entry[1] !== null),
        );
        if (document.referrer) attribution.referrer = document.referrer;

        setSubmittingBlockId(block.id);

        router.post(
            `/funnels/${funnel.id}/leads`,
            {
                name: formData.get('name') || undefined,
                email: formData.get('email'),
                phone: formData.get('phone') || undefined,
                form_id: block.id,
                fields: Object.fromEntries(formData.entries()),
                attribution,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setSubmittedBlockId(block.id);
                    const action = getSuccessAction(block.content);
                    if (action.type === 'redirect') window.location.assign(action.url);
                    if (action.type === 'download') {
                        const anchor = document.createElement('a');
                        anchor.href = action.url;
                        anchor.rel = 'noreferrer';
                        anchor.click();
                    }
                },
                onFinish: () => setSubmittingBlockId(null),
            },
        );
    };

    const renderBlock = (block: Block) => (
        <FunnelBlock
            key={block.id}
            block={block}
            formSubmitting={submittingBlockId === block.id}
            formSubmitted={submittedBlockId === block.id}
            onFormSubmit={handleLeadSubmit}
        />
    );

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
                                        margin: section.settings.margin,
                                        minHeight: section.settings.minHeight,
                                        backgroundImage: section.settings.backgroundImage ? `url(${section.settings.backgroundImage})` : undefined,
                                        backgroundPosition: section.settings.backgroundImage ? 'center' : undefined,
                                        backgroundSize: section.settings.backgroundImage ? 'cover' : undefined,
                                    }}
                                >
                                    <div
                                        className="mx-auto flex flex-col gap-4 md:flex-row"
                                        style={{
                                            maxWidth: section.settings.fullWidth ? '100%' : funnel.settings.maxWidth,
                                        }}
                                    >
                                        {section.columns.map((column) => (
                                            <div
                                                key={column.id}
                                                className={`relative flex flex-col gap-4 ${previewMode ? '' : 'w-full md:w-[var(--column-width)]'}`}
                                                style={
                                                    {
                                                        width: previewMode ? (selectedDevice === 'mobile' ? '100%' : `${column.width}%`) : undefined,
                                                        '--column-width': `${column.width}%`,
                                                        padding: column.settings.padding,
                                                        backgroundColor: column.settings.backgroundColor,
                                                        justifyContent:
                                                            column.settings.verticalAlign === 'middle'
                                                                ? 'center'
                                                                : column.settings.verticalAlign === 'bottom'
                                                                  ? 'flex-end'
                                                                  : 'flex-start',
                                                    } as CSSProperties
                                                }
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
