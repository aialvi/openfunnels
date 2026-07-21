import { funnelExporter, type ExportFormat } from '@/lib/exporters';
import { downloadTemplateManifest } from '@/lib/templates';
import type { Funnel } from '@/types/editor';
import { Check, Code, Copy, Download } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const exportFiles: Record<ExportFormat, string> = {
    html: 'index.html',
    react: 'FunnelPage.tsx',
    vue: 'FunnelPage.vue',
    wordpress: 'wordpress-blocks.html',
    laravel: 'funnel.blade.php',
    shopify: 'openfunnels.liquid',
    woocommerce: 'openfunnels-woocommerce.php',
};

const exportFormats: ExportFormat[] = ['html', 'react', 'vue', 'wordpress', 'laravel', 'shopify', 'woocommerce'];

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    funnel: Funnel;
}

export default function ExportModal({ isOpen, onClose, funnel }: ExportModalProps) {
    const [format, setFormat] = useState<ExportFormat>('html');
    const [code, setCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCode = useCallback(
        async (fmt: ExportFormat) => {
            setIsGenerating(true);
            try {
                const result = await funnelExporter.export(funnel, fmt);
                setCode(result);
            } catch (error) {
                console.error('Export failed:', error);
                setCode('Error generating export.');
            } finally {
                setIsGenerating(false);
            }
        },
        [funnel],
    );

    useEffect(() => {
        if (isOpen) {
            generateCode(format);
        }
    }, [isOpen, format, generateCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = exportFiles[format].split('.').slice(1).join('.');
        a.download = `${funnel.name.replace(/\s+/g, '-').toLowerCase()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Code className="h-5 w-5 text-primary" />
                        Export Funnel
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
                    {/* Sidebar / Options */}
                    <div className="w-full space-y-4 border-r border-border bg-muted/30 p-4 md:w-64">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Platform</label>
                            <div className="space-y-1">
                                {exportFormats.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFormat(f)}
                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                            format === f ? 'bg-primary font-medium text-primary-foreground' : 'text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {f === 'woocommerce'
                                            ? 'WooCommerce'
                                            : f === 'wordpress'
                                              ? 'WordPress'
                                              : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => downloadTemplateManifest(funnel)}
                            className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/40 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                            <Download className="h-4 w-4" />
                            Download template JSON
                        </button>

                        <div className="mt-auto pt-4 text-xs text-muted-foreground">
                            <p>Export your funnel to your favorite platform. Code is generated based on your current design.</p>
                        </div>
                    </div>

                    {/* Code Preview */}
                    <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e]">
                        <div className="flex items-center justify-between border-b border-[#3e3e3e] bg-[#2d2d2d] px-4 py-2">
                            <span className="font-mono text-xs text-gray-400">{exportFiles[format]}</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleCopy}
                                    className="rounded p-1.5 text-gray-300 transition-colors hover:bg-[#3e3e3e]"
                                    title="Copy Code"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="rounded p-1.5 text-gray-300 transition-colors hover:bg-[#3e3e3e]"
                                    title="Download File"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="custom-scrollbar flex-1 overflow-auto p-4 font-mono text-sm text-gray-300">
                            <pre className="break-all whitespace-pre-wrap">{isGenerating ? 'Generating...' : code}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
