import type { Funnel } from '@/types/editor';
import { router } from '@inertiajs/react';
import { Beaker, RefreshCw, Trash2, X } from 'lucide-react';
import { useState } from 'react';

export interface ExperimentVariant {
    id: number;
    name: string;
    weight: number;
    is_active: boolean;
    views: number;
    conversions: number;
}

interface ExperimentModalProps {
    isOpen: boolean;
    onClose: () => void;
    funnelId: number;
    funnel: Funnel;
    variants: ExperimentVariant[];
}

export default function ExperimentModal({ isOpen, onClose, funnelId, funnel, variants }: ExperimentModalProps) {
    const [name, setName] = useState('Variant B');
    const [weight, setWeight] = useState(50);
    const [busy, setBusy] = useState(false);
    const activeWeight = variants.filter((variant) => variant.is_active).reduce((sum, variant) => sum + variant.weight, 0);

    if (!isOpen) return null;

    const createVariant = () => {
        setBusy(true);
        router.post(
            route('funnels.variants.store', funnelId),
            { name, weight, content: JSON.stringify(funnel.content), settings: JSON.stringify(funnel.settings) },
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };

    const updateVariant = (
        variant: ExperimentVariant,
        updates: { name?: string; weight?: number; is_active?: boolean; content?: string; settings?: string },
    ) => {
        router.patch(route('funnels.variants.update', { funnel: funnelId, variant: variant.id }), updates, { preserveScroll: true });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Beaker className="h-5 w-5 text-primary" /> Experiments
                        </h2>
                        <p className="text-sm text-muted-foreground">The current funnel remains the control. Variants are portable snapshots.</p>
                    </div>
                    <button onClick={onClose} className="rounded p-2 text-muted-foreground hover:bg-muted">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-5 overflow-y-auto p-6">
                    <div className="grid grid-cols-[minmax(0,1fr)_90px_auto] gap-2 rounded-lg border border-border bg-muted/30 p-4">
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="rounded border border-border bg-background px-3 py-2 text-sm"
                        />
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={weight}
                            onChange={(event) => setWeight(Number(event.target.value))}
                            className="rounded border border-border bg-background px-3 py-2 text-sm"
                            title="Traffic percentage"
                        />
                        <button
                            disabled={busy || !name.trim()}
                            onClick={createVariant}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                            Create snapshot
                        </button>
                    </div>

                    <div className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
                        Active allocation: <strong className="text-foreground">{activeWeight}% variants</strong> / {100 - activeWeight}% control
                    </div>

                    <div className="space-y-3">
                        {variants.map((variant) => {
                            const rate = variant.views > 0 ? (variant.conversions / variant.views) * 100 : 0;
                            return (
                                <div key={variant.id} className="rounded-lg border border-border bg-background p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{variant.name}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {variant.views} views · {variant.conversions} conversions · {rate.toFixed(1)}%
                                            </p>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input
                                                type="checkbox"
                                                checked={variant.is_active}
                                                onChange={(event) => updateVariant(variant, { is_active: event.target.checked })}
                                                className="accent-primary"
                                            />
                                            Active
                                        </label>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <label className="text-xs text-muted-foreground">
                                            Traffic
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                defaultValue={variant.weight}
                                                onBlur={(event) => updateVariant(variant, { weight: Number(event.target.value) })}
                                                className="ml-2 w-20 rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                                            />
                                        </label>
                                        <button
                                            onClick={() =>
                                                updateVariant(variant, {
                                                    content: JSON.stringify(funnel.content),
                                                    settings: JSON.stringify(funnel.settings),
                                                })
                                            }
                                            className="ml-auto inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" /> Replace from editor
                                        </button>
                                        <button
                                            onClick={() =>
                                                router.delete(route('funnels.variants.destroy', { funnel: funnelId, variant: variant.id }), {
                                                    preserveScroll: true,
                                                })
                                            }
                                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {variants.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No variants yet. Create a snapshot of the current design to begin.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
