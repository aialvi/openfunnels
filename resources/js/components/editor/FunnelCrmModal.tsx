import { useEscapeKey } from '@/hooks/use-escape-key';
import { Link, router } from '@inertiajs/react';
import { BriefcaseBusiness, X } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

export interface CrmAutomationSettings {
    enabled: boolean;
    pipeline_id: number | null;
    pipeline_stage_id: number | null;
    default_value_cents: number;
}

export interface CrmPipelineOption {
    id: number;
    name: string;
    currency: string;
    stages: Array<{
        id: number;
        name: string;
    }>;
}

interface FunnelCrmModalProps {
    isOpen: boolean;
    onClose: () => void;
    funnelId: number;
    settings: CrmAutomationSettings;
    pipelines: CrmPipelineOption[];
}

export default function FunnelCrmModal({ isOpen, onClose, funnelId, settings, pipelines }: FunnelCrmModalProps) {
    const initialPipeline = pipelines.find((pipeline) => pipeline.id === settings.pipeline_id) || pipelines[0] || null;
    const [enabled, setEnabled] = useState(settings.enabled);
    const [pipelineId, setPipelineId] = useState(String(initialPipeline?.id || ''));
    const [stageId, setStageId] = useState(
        String(initialPipeline?.stages.find((stage) => stage.id === settings.pipeline_stage_id)?.id || initialPipeline?.stages[0]?.id || ''),
    );
    const [defaultValue, setDefaultValue] = useState(String(settings.default_value_cents / 100));
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const selectedPipeline = useMemo(() => pipelines.find((pipeline) => pipeline.id === Number(pipelineId)) || null, [pipelineId, pipelines]);

    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        router.patch(
            route('funnels.crm-settings.update', funnelId),
            {
                enabled,
                pipeline_id: pipelineId ? Number(pipelineId) : null,
                pipeline_stage_id: stageId ? Number(stageId) : null,
                default_value: Number(defaultValue || 0),
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (errors) => {
                    setError(Object.values(errors)[0] || 'CRM automation settings could not be saved.');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <BriefcaseBusiness className="h-5 w-5" />
                            CRM Automation
                        </h2>
                        <p className="text-sm text-muted-foreground">Create an opportunity when this funnel captures a lead.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-2 text-muted-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {pipelines.length === 0 ? (
                    <div className="p-6 text-center">
                        <BriefcaseBusiness className="mx-auto mb-3 h-9 w-9 text-primary" />
                        <h3 className="font-medium text-foreground">Create a pipeline first</h3>
                        <p className="mt-1 text-sm text-muted-foreground">CRM automation needs a destination pipeline and stage.</p>
                        <Link
                            href={route('opportunities.index')}
                            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            Open Opportunities
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 p-5">
                            {error && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                            )}
                            <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(event) => setEnabled(event.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-border accent-primary"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-foreground">Create opportunities automatically</span>
                                    <span className="block text-sm text-muted-foreground">
                                        Repeat submissions reuse the contact’s existing open opportunity for this funnel.
                                    </span>
                                </span>
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label>
                                    <span className="text-sm font-medium text-foreground">Pipeline</span>
                                    <select
                                        value={pipelineId}
                                        onChange={(event) => {
                                            const nextPipeline = pipelines.find((pipeline) => pipeline.id === Number(event.target.value));
                                            setPipelineId(event.target.value);
                                            setStageId(String(nextPipeline?.stages[0]?.id || ''));
                                        }}
                                        disabled={!enabled}
                                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground disabled:opacity-50"
                                    >
                                        {pipelines.map((pipeline) => (
                                            <option key={pipeline.id} value={pipeline.id}>
                                                {pipeline.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span className="text-sm font-medium text-foreground">Starting stage</span>
                                    <select
                                        value={stageId}
                                        onChange={(event) => setStageId(event.target.value)}
                                        disabled={!enabled}
                                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground disabled:opacity-50"
                                    >
                                        {selectedPipeline?.stages.map((stage) => (
                                            <option key={stage.id} value={stage.id}>
                                                {stage.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    Default opportunity value {selectedPipeline ? `(${selectedPipeline.currency})` : ''}
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={defaultValue}
                                    onChange={(event) => setDefaultValue(event.target.value)}
                                    disabled={!enabled}
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground disabled:opacity-50"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || (enabled && (!pipelineId || !stageId))}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                Save automation
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}
