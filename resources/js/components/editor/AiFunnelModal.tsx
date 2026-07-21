import type { Funnel } from '@/types/editor';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface GeneratedFunnel {
    content: Funnel['content'];
    settings: Funnel['settings'];
}

interface AiFunnelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (generated: GeneratedFunnel) => void;
}

export default function AiFunnelModal({ isOpen, onClose, onApply }: AiFunnelModalProps) {
    const [brief, setBrief] = useState({ goal: 'Lead capture', business: '', audience: '', offer: '', tone: 'Clear and confident' });
    const [generated, setGenerated] = useState<GeneratedFunnel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const generate = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/funnels/generate', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token ?? '' },
                body: JSON.stringify(brief),
            });
            const result = (await response.json()) as GeneratedFunnel & { message?: string; errors?: Record<string, string[]> };
            if (!response.ok) throw new Error(result.message || Object.values(result.errors || {})[0]?.[0] || 'Generation failed.');
            setGenerated(result);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Generation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Sparkles className="h-5 w-5 text-primary" /> Generate a funnel draft
                        </h2>
                        <p className="text-sm text-muted-foreground">Review the structure before it replaces the current canvas.</p>
                    </div>
                    <button onClick={onClose} className="rounded p-2 text-muted-foreground hover:bg-muted">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="grid gap-4 p-6 sm:grid-cols-2">
                    {(
                        [
                            ['business', 'Business', 'What does the business do?'],
                            ['audience', 'Audience', 'Who should this page persuade?'],
                            ['offer', 'Offer', 'What should visitors sign up for or buy?'],
                            ['goal', 'Primary goal', 'Lead capture, booking, launch…'],
                            ['tone', 'Tone', 'Clear, premium, playful…'],
                        ] as const
                    ).map(([key, label, placeholder]) => (
                        <label key={key} className={key === 'offer' ? 'sm:col-span-2' : ''}>
                            <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
                            {key === 'offer' ? (
                                <textarea
                                    value={brief[key]}
                                    onChange={(event) => setBrief((current) => ({ ...current, [key]: event.target.value }))}
                                    placeholder={placeholder}
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                />
                            ) : (
                                <input
                                    value={brief[key]}
                                    onChange={(event) => setBrief((current) => ({ ...current, [key]: event.target.value }))}
                                    placeholder={placeholder}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                />
                            )}
                        </label>
                    ))}
                </div>
                {error && <div className="mx-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                {generated && (
                    <div className="mx-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                        Draft ready: {generated.content.sections.length} sections and{' '}
                        {generated.content.sections.reduce(
                            (total, section) => total + section.columns.reduce((count, column) => count + column.blocks.length, 0),
                            0,
                        )}{' '}
                        blocks.
                    </div>
                )}
                <div className="flex justify-end gap-2 p-6">
                    <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground">
                        Cancel
                    </button>
                    <button
                        onClick={() => void generate()}
                        disabled={loading || !brief.business.trim() || !brief.audience.trim() || !brief.offer.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {generated ? 'Regenerate' : 'Generate'}
                    </button>
                    {generated && (
                        <button
                            onClick={() => {
                                onApply(generated);
                                onClose();
                            }}
                            className="rounded-lg bg-chart-2 px-4 py-2 text-sm font-medium text-white"
                        >
                            Apply draft
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
