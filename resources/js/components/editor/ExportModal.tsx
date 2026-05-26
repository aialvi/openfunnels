import { useCallback, useEffect, useState } from 'react';
import { Copy, Download, Check, Code } from 'lucide-react';
import { funnelExporter, ExportFormat } from '@/lib/exporters';
import { Funnel } from '@/stores/funnelStore';

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

    const generateCode = useCallback(async (fmt: ExportFormat) => {
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
    }, [funnel]);

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
        const ext = format === 'react' ? 'tsx' : format === 'vue' ? 'vue' : 'html'; // simplistic extension mapping
        a.download = `${funnel.name.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl border border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Export Funnel
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar / Options */}
                    <div className="w-full md:w-64 bg-muted/30 p-4 border-r border-border space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Platform</label>
                            <div className="space-y-1">
                                {(['html', 'react', 'vue', 'wordpress', 'laravel'] as ExportFormat[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFormat(f)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${format === f
                                            ? 'bg-primary text-primary-foreground font-medium'
                                            : 'hover:bg-muted text-foreground'
                                            }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-auto pt-4">
                            <p>Export your funnel to your favorite platform. Code is generated based on your current design.</p>
                        </div>
                    </div>

                    {/* Code Preview */}
                    <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                            <span className="text-xs text-gray-400 font-mono">
                                {format === 'react' ? 'FunnelPage.tsx' : format === 'vue' ? 'FunnelPage.vue' : 'index.html'}
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 rounded hover:bg-[#3e3e3e] text-gray-300 transition-colors"
                                    title="Copy Code"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-1.5 rounded hover:bg-[#3e3e3e] text-gray-300 transition-colors"
                                    title="Download File"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4 font-mono text-sm text-gray-300 custom-scrollbar">
                            <pre className="whitespace-pre-wrap break-all">
                                {isGenerating ? 'Generating...' : code}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
