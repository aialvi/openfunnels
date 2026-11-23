import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    closestCorners,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    BriefcaseBusiness,
    CalendarDays,
    CircleDollarSign,
    GripVertical,
    History,
    Pencil,
    Plus,
    Search,
    Settings2,
    Trash2,
    TrendingUp,
    UserRound,
    X,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Opportunities', href: '/opportunities' }];

interface Stage {
    id: number;
    name: string;
    position: number;
    probability: number;
}

interface Pipeline {
    id: number;
    name: string;
    currency: string;
    stages: Stage[];
}

interface ContactOption {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
}

interface OpportunityActivity {
    id: number;
    type: string;
    payload: Record<string, unknown>;
    created_at: string;
    actor: string | null;
}

interface Opportunity {
    id: number;
    title: string;
    value_cents: number;
    status: 'open' | 'won' | 'lost';
    source: string | null;
    expected_close_date: string | null;
    stage_changed_at: string | null;
    closed_at: string | null;
    created_at: string;
    stage: Stage;
    contact: ContactOption;
    funnel: {
        id: number;
        name: string;
        slug: string;
    } | null;
    activities: OpportunityActivity[];
}

interface OpportunitiesProps {
    pipelines: Pipeline[];
    selectedPipelineId: number | null;
    opportunities: Opportunity[];
    stats: {
        open_value_cents: number;
        weighted_value_cents: number;
        won_value_cents: number;
    };
    filters: {
        status: 'open' | 'won' | 'lost' | 'all';
        search: string;
    };
    preselectedContact: ContactOption | null;
}

interface OpportunityFormState {
    contact: ContactOption | null;
    title: string;
    value: string;
    pipeline_stage_id: string;
    expected_close_date: string;
    status: 'open' | 'won' | 'lost';
}

const defaultStages = [
    { name: 'New Lead', probability: 10 },
    { name: 'Contacted', probability: 25 },
    { name: 'Qualified', probability: 50 },
    { name: 'Proposal', probability: 75 },
];

function formatMoney(cents: number, currency: string): string {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(cents / 100);
    } catch {
        return `${currency} ${(cents / 100).toFixed(2)}`;
    }
}

/** Formats a Y-m-d date without shifting it across timezones. */
function formatDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function activityLabel(activity: OpportunityActivity): string {
    if (activity.type === 'created') return 'Opportunity created';
    if (activity.type === 'stage_moved') {
        return `Moved from ${String(activity.payload.from_stage_name || 'another stage')} to ${String(activity.payload.to_stage_name || 'a new stage')}`;
    }
    if (activity.type === 'status_changed') return `Status changed from ${String(activity.payload.from)} to ${String(activity.payload.to)}`;
    if (activity.type === 'value_changed') return 'Deal value updated';

    return activity.type.replace(/_/g, ' ');
}

function OpportunityCard({
    opportunity,
    currency,
    onEdit,
    overlay = false,
}: {
    opportunity: Opportunity;
    currency: string;
    onEdit: (opportunity: Opportunity) => void;
    /** The copy that follows the pointer, outside the scrolling columns. */
    overlay?: boolean;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: overlay ? `overlay-${opportunity.id}` : `opportunity-${opportunity.id}`,
        disabled: overlay,
        data: { opportunityId: opportunity.id },
    });

    return (
        <article
            ref={overlay ? undefined : setNodeRef}
            className={`rounded-lg border bg-card p-3 transition-opacity ${
                overlay ? 'rotate-1 cursor-grabbing border-primary shadow-2xl' : 'border-border shadow-sm hover:border-muted-foreground/40'
            } ${isDragging ? 'opacity-30' : ''}`}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <button
                    type="button"
                    onClick={() => onEdit(opportunity)}
                    className="min-w-0 flex-1 text-left font-semibold text-foreground hover:text-primary"
                >
                    <span className="block truncate">{opportunity.title}</span>
                </button>
                <button
                    type="button"
                    className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                    aria-label={`Move ${opportunity.title}`}
                    {...listeners}
                    {...attributes}
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            </div>
            <Link
                href={route('contacts.show', opportunity.contact.id)}
                className="mb-3 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{opportunity.contact.name || opportunity.contact.email}</span>
            </Link>
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{formatMoney(opportunity.value_cents, currency)}</span>
                {opportunity.status !== 'open' && (
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            opportunity.status === 'won' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}
                    >
                        {opportunity.status}
                    </span>
                )}
            </div>
            {opportunity.expected_close_date && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Close by {formatDate(opportunity.expected_close_date)}
                </div>
            )}
            {opportunity.funnel && <div className="mt-2 truncate text-xs text-muted-foreground">From {opportunity.funnel.name}</div>}
        </article>
    );
}

function StageColumn({
    stage,
    opportunities,
    currency,
    onEdit,
}: {
    stage: Stage;
    opportunities: Opportunity[];
    currency: string;
    onEdit: (opportunity: Opportunity) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage.id}`, data: { stageId: stage.id } });
    const openValue = opportunities.filter((item) => item.status === 'open').reduce((sum, item) => sum + item.value_cents, 0);

    return (
        <section
            ref={setNodeRef}
            className={`flex max-h-[calc(100vh-310px)] min-h-80 min-w-64 flex-1 flex-col rounded-xl border bg-muted/30 transition-colors xl:max-w-96 ${
                isOver ? 'border-primary bg-primary/5' : 'border-border'
            }`}
        >
            <header className="border-b border-border p-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate font-semibold text-foreground">{stage.name}</h2>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{opportunities.length}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatMoney(openValue, currency)}</span>
                    <span>{stage.probability}% probability</span>
                </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {opportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} currency={currency} onEdit={onEdit} />
                ))}
                {opportunities.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                        Drop opportunities here
                    </div>
                )}
            </div>
        </section>
    );
}

function PipelineModal({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState('Sales Pipeline');
    const [currency, setCurrency] = useState('USD');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProcessing(true);
        router.post(
            route('pipelines.store'),
            { name, currency, stages: defaultStages },
            {
                onSuccess: () => onClose(),
                onFinish: () => setProcessing(false),
                onError: (nextErrors) => setErrors(nextErrors),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-foreground">Create pipeline</h2>
                        <p className="text-sm text-muted-foreground">Start with a practical four-stage sales process.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-2 text-muted-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="space-y-4 p-5">
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-foreground">Pipeline name</span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                        />
                        {errors.name && <span className="mt-1 block text-sm text-destructive">{errors.name}</span>}
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-foreground">Currency</span>
                        <select
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                        >
                            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BDT'].map((code) => (
                                <option key={code}>{code}</option>
                            ))}
                        </select>
                    </label>
                    <div>
                        <div className="mb-2 text-sm font-medium text-foreground">Starting stages</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {defaultStages.map((stage) => (
                                <div key={stage.name} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                    <span className="text-foreground">{stage.name}</span>
                                    <span className="float-right text-muted-foreground">{stage.probability}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing || !name.trim()}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                        Create pipeline
                    </button>
                </div>
            </form>
        </div>
    );
}

function ManagePipelineModal({
    pipeline,
    opportunityCounts,
    onClose,
}: {
    pipeline: Pipeline;
    opportunityCounts: Record<number, number>;
    onClose: () => void;
}) {
    const [name, setName] = useState(pipeline.name);
    const [currency, setCurrency] = useState(pipeline.currency);
    const [newStageName, setNewStageName] = useState('');
    const [newStageProbability, setNewStageProbability] = useState('50');
    const [stageDrafts, setStageDrafts] = useState<Record<number, { name: string; probability: string }>>(
        Object.fromEntries(pipeline.stages.map((stage) => [stage.id, { name: stage.name, probability: String(stage.probability) }])),
    );
    const [moveTargets, setMoveTargets] = useState<Record<number, string>>(
        Object.fromEntries(
            pipeline.stages.map((stage) => [stage.id, String(pipeline.stages.find((candidate) => candidate.id !== stage.id)?.id || '')]),
        ),
    );

    const updatePipeline = () => {
        router.patch(route('pipelines.update', pipeline.id), { name, currency }, { preserveScroll: true });
    };

    const addStage = () => {
        router.post(
            route('pipeline-stages.store', pipeline.id),
            { name: newStageName, probability: Number(newStageProbability) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewStageName('');
                    setNewStageProbability('50');
                },
            },
        );
    };

    const saveStage = (stageId: number) => {
        const draft = stageDrafts[stageId];
        router.patch(
            route('pipeline-stages.update', stageId),
            { name: draft.name, probability: Number(draft.probability) },
            { preserveScroll: true },
        );
    };

    const moveStage = (stageId: number, direction: -1 | 1) => {
        const currentIndex = pipeline.stages.findIndex((stage) => stage.id === stageId);
        const destinationIndex = currentIndex + direction;
        if (destinationIndex < 0 || destinationIndex >= pipeline.stages.length) return;

        const stageIds = pipeline.stages.map((stage) => stage.id);
        [stageIds[currentIndex], stageIds[destinationIndex]] = [stageIds[destinationIndex], stageIds[currentIndex]];
        router.put(route('pipeline-stages.reorder', pipeline.id), { stage_ids: stageIds }, { preserveScroll: true });
    };

    const deleteStage = (stage: Stage) => {
        const alternatives = pipeline.stages.filter((item) => item.id !== stage.id);
        const moveToStageId = opportunityCounts[stage.id] > 0 ? Number(moveTargets[stage.id]) : undefined;
        const destination = alternatives.find((item) => item.id === moveToStageId);

        if (opportunityCounts[stage.id] > 0 && !destination) return;

        if (!window.confirm(`Delete ${stage.name}${destination ? ` and move its opportunities to ${destination.name}` : ''}?`)) return;

        router.delete(route('pipeline-stages.destroy', stage.id), {
            data: { move_to_stage_id: moveToStageId },
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-foreground">Manage pipeline</h2>
                        <p className="text-sm text-muted-foreground">Edit stages and forecasting probabilities.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-2 text-muted-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-10 rounded-lg border border-border bg-background px-3 text-foreground"
                            aria-label="Pipeline name"
                        />
                        <select
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value)}
                            className="h-10 rounded-lg border border-border bg-background px-3 text-foreground"
                            aria-label="Pipeline currency"
                        >
                            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BDT'].map((code) => (
                                <option key={code}>{code}</option>
                            ))}
                        </select>
                        <button onClick={updatePipeline} className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                            Save
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">Stages</h3>
                        {pipeline.stages.map((stage, index) => {
                            const draft = stageDrafts[stage.id] || { name: stage.name, probability: String(stage.probability) };

                            return (
                                <div
                                    key={stage.id}
                                    className="grid items-center gap-2 rounded-lg border border-border bg-background p-2 sm:grid-cols-[auto_1fr_90px_auto]"
                                >
                                    <div className="flex">
                                        <button
                                            onClick={() => moveStage(stage.id, -1)}
                                            disabled={index === 0}
                                            className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                                            aria-label={`Move ${stage.name} left`}
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => moveStage(stage.id, 1)}
                                            disabled={index === pipeline.stages.length - 1}
                                            className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                                            aria-label={`Move ${stage.name} right`}
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            value={draft.name}
                                            onChange={(event) =>
                                                setStageDrafts((current) => ({
                                                    ...current,
                                                    [stage.id]: { ...draft, name: event.target.value },
                                                }))
                                            }
                                            className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm text-foreground"
                                        />
                                        {opportunityCounts[stage.id] > 0 && (
                                            <select
                                                value={moveTargets[stage.id] || ''}
                                                onChange={(event) =>
                                                    setMoveTargets((current) => ({
                                                        ...current,
                                                        [stage.id]: event.target.value,
                                                    }))
                                                }
                                                className="h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-muted-foreground"
                                                aria-label={`Move ${stage.name} opportunities to`}
                                            >
                                                {pipeline.stages
                                                    .filter((candidate) => candidate.id !== stage.id)
                                                    .map((candidate) => (
                                                        <option key={candidate.id} value={candidate.id}>
                                                            Move {opportunityCounts[stage.id]} deals to {candidate.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </div>
                                    <label className="relative">
                                        <span className="sr-only">Probability</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={draft.probability}
                                            onChange={(event) =>
                                                setStageDrafts((current) => ({
                                                    ...current,
                                                    [stage.id]: { ...draft, probability: event.target.value },
                                                }))
                                            }
                                            className="h-9 w-full rounded-md border border-border bg-card px-2 pr-6 text-sm text-foreground"
                                        />
                                        <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                    </label>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => saveStage(stage.id)}
                                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            aria-label={`Save ${stage.name}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteStage(stage)}
                                            disabled={pipeline.stages.length === 1}
                                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-30"
                                            aria-label={`Delete ${stage.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="grid gap-2 rounded-lg border border-dashed border-border p-2 sm:grid-cols-[1fr_90px_auto]">
                            <input
                                value={newStageName}
                                onChange={(event) => setNewStageName(event.target.value)}
                                placeholder="New stage name"
                                className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                            />
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={newStageProbability}
                                onChange={(event) => setNewStageProbability(event.target.value)}
                                className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                                aria-label="New stage probability"
                            />
                            <button
                                onClick={addStage}
                                disabled={!newStageName.trim()}
                                className="rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                Add stage
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                    <button
                        onClick={() => {
                            if (window.confirm(`Delete ${pipeline.name}?`)) router.delete(route('pipelines.destroy', pipeline.id));
                        }}
                        disabled={Object.values(opportunityCounts).some((count) => count > 0)}
                        className="text-sm text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                        title="Pipelines with opportunities cannot be deleted"
                    >
                        Delete pipeline
                    </button>
                    <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function OpportunityModal({
    pipeline,
    opportunity,
    preselectedContact,
    onClose,
}: {
    pipeline: Pipeline;
    opportunity: Opportunity | null;
    preselectedContact: ContactOption | null;
    onClose: () => void;
}) {
    const [form, setForm] = useState<OpportunityFormState>({
        contact: opportunity?.contact || preselectedContact,
        title: opportunity?.title || '',
        value: opportunity ? String(opportunity.value_cents / 100) : '0',
        pipeline_stage_id: String(opportunity?.stage.id || pipeline.stages[0]?.id || ''),
        expected_close_date: opportunity?.expected_close_date || '',
        status: opportunity?.status || 'open',
    });
    const [contactSearch, setContactSearch] = useState(preselectedContact?.name || preselectedContact?.email || '');
    const [contactOptions, setContactOptions] = useState<ContactOption[]>(preselectedContact ? [preselectedContact] : []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (opportunity) return;

        const timeout = window.setTimeout(async () => {
            const response = await fetch(route('contacts.lookup', { search: contactSearch }));
            if (!response.ok) return;
            const payload = (await response.json()) as { contacts: ContactOption[] };
            setContactOptions(payload.contacts);
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [contactSearch, opportunity]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProcessing(true);
        const payload = {
            contact_id: form.contact?.id,
            pipeline_id: pipeline.id,
            pipeline_stage_id: Number(form.pipeline_stage_id),
            title: form.title,
            value: Number(form.value || 0),
            expected_close_date: form.expected_close_date || null,
            status: form.status,
        };
        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError: (nextErrors: Record<string, string>) => setErrors(nextErrors),
            onFinish: () => setProcessing(false),
        };

        if (opportunity) {
            router.patch(route('opportunities.update', opportunity.id), payload, options);
        } else {
            router.post(route('opportunities.store'), payload, options);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <form
                onSubmit={submit}
                className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-foreground">{opportunity ? 'Edit opportunity' : 'New opportunity'}</h2>
                        <p className="text-sm text-muted-foreground">{pipeline.name}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-2 text-muted-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {!opportunity && (
                        <div>
                            <label className="block text-sm font-medium text-foreground">Contact</label>
                            <input
                                value={contactSearch}
                                onChange={(event) => {
                                    setContactSearch(event.target.value);
                                    setForm((current) => ({ ...current, contact: null }));
                                }}
                                placeholder="Search by name, email, or phone"
                                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                            />
                            {!form.contact && contactOptions.length > 0 && (
                                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-background p-1 shadow-lg">
                                    {contactOptions.map((contact) => (
                                        <button
                                            key={contact.id}
                                            type="button"
                                            onClick={() => {
                                                setForm((current) => ({ ...current, contact }));
                                                setContactSearch(contact.name || contact.email);
                                            }}
                                            className="block w-full rounded-md px-3 py-2 text-left hover:bg-muted"
                                        >
                                            <span className="block text-sm font-medium text-foreground">{contact.name || contact.email}</span>
                                            <span className="block text-xs text-muted-foreground">{contact.email}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {errors.contact_id && <span className="mt-1 block text-sm text-destructive">{errors.contact_id}</span>}
                        </div>
                    )}
                    {opportunity && (
                        <Link
                            href={route('contacts.show', opportunity.contact.id)}
                            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-muted"
                        >
                            <UserRound className="h-5 w-5 text-primary" />
                            <div>
                                <div className="text-sm font-medium text-foreground">{opportunity.contact.name || opportunity.contact.email}</div>
                                <div className="text-xs text-muted-foreground">{opportunity.contact.email}</div>
                            </div>
                        </Link>
                    )}
                    <label className="block">
                        <span className="text-sm font-medium text-foreground">Opportunity title</span>
                        <input
                            value={form.title}
                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                            placeholder={form.contact?.name || form.contact?.email || 'Opportunity name'}
                            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                        />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className="text-sm font-medium text-foreground">Stage</span>
                            <select
                                value={form.pipeline_stage_id}
                                onChange={(event) => setForm((current) => ({ ...current, pipeline_stage_id: event.target.value }))}
                                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                            >
                                {pipeline.stages.map((stage) => (
                                    <option key={stage.id} value={stage.id}>
                                        {stage.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {opportunity && (
                            <label>
                                <span className="text-sm font-medium text-foreground">Outcome</span>
                                <select
                                    value={form.status}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            status: event.target.value as OpportunityFormState['status'],
                                        }))
                                    }
                                    className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                                >
                                    <option value="open">Open</option>
                                    <option value="won">Won</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </label>
                        )}
                        <label>
                            <span className="text-sm font-medium text-foreground">Value ({pipeline.currency})</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.value}
                                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                            />
                        </label>
                        <label>
                            <span className="text-sm font-medium text-foreground">Expected close</span>
                            <input
                                type="date"
                                value={form.expected_close_date}
                                onChange={(event) => setForm((current) => ({ ...current, expected_close_date: event.target.value }))}
                                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
                            />
                        </label>
                    </div>
                    {opportunity && opportunity.activities.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <History className="h-4 w-4" />
                                Activity
                            </h3>
                            <div className="max-h-44 space-y-2 overflow-y-auto">
                                {opportunity.activities.map((activity) => (
                                    <div key={activity.id} className="rounded-lg bg-muted/50 px-3 py-2">
                                        <div className="text-sm text-foreground">{activityLabel(activity)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(activity.created_at).toLocaleString()}
                                            {activity.actor ? ` · ${activity.actor}` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                    {opportunity ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm(`Remove ${opportunity.title}?`)) {
                                    router.delete(route('opportunities.destroy', opportunity.id), { onSuccess: () => onClose() });
                                }
                            }}
                            className="text-sm text-destructive"
                        >
                            Remove
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || (!opportunity && !form.contact)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                            {opportunity ? 'Save changes' : 'Create opportunity'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function Opportunities({ pipelines, selectedPipelineId, opportunities, stats, filters, preselectedContact }: OpportunitiesProps) {
    const [boardOpportunities, setBoardOpportunities] = useState(opportunities);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const dragging = boardOpportunities.find((item) => item.id === draggingId);
    const [search, setSearch] = useState(filters.search);
    const [showCreatePipeline, setShowCreatePipeline] = useState(pipelines.length === 0);
    const [showManagePipeline, setShowManagePipeline] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
    const [showOpportunityModal, setShowOpportunityModal] = useState(Boolean(preselectedContact));
    const selectedPipeline = pipelines.find((pipeline) => pipeline.id === selectedPipelineId) || null;
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

    useEffect(() => setBoardOpportunities(opportunities), [opportunities]);

    const opportunityCounts = useMemo(
        () =>
            boardOpportunities.reduce<Record<number, number>>((counts, opportunity) => {
                counts[opportunity.stage.id] = (counts[opportunity.stage.id] || 0) + 1;
                return counts;
            }, {}),
        [boardOpportunities],
    );

    const visitPipeline = (pipelineId: number, status = filters.status, nextSearch = filters.search) => {
        router.get(
            route('opportunities.index'),
            { pipeline_id: pipelineId, status, search: nextSearch },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedPipeline) visitPipeline(selectedPipeline.id, filters.status, search);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDraggingId(null);
        const opportunityId = Number(String(event.active.id).replace('opportunity-', ''));
        const stageId = event.over ? Number(String(event.over.id).replace('stage-', '')) : null;
        const opportunity = boardOpportunities.find((item) => item.id === opportunityId);
        const stage = selectedPipeline?.stages.find((item) => item.id === stageId);

        if (!opportunity || !stage || opportunity.stage.id === stage.id) return;

        const previous = boardOpportunities;
        setBoardOpportunities((current) => current.map((item) => (item.id === opportunity.id ? { ...item, stage } : item)));
        router.patch(
            route('opportunities.update', opportunity.id),
            { pipeline_stage_id: stage.id },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => setBoardOpportunities(previous),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Opportunities" />
            <div className="flex h-full min-h-0 flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Opportunities</h1>
                        <p className="text-muted-foreground">Turn captured contacts into visible, measurable deals.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowCreatePipeline(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            <Plus className="h-4 w-4" />
                            Pipeline
                        </button>
                        <button
                            onClick={() => setShowManagePipeline(true)}
                            disabled={!selectedPipeline}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40"
                        >
                            <Settings2 className="h-4 w-4" />
                            Manage
                        </button>
                        <button
                            onClick={() => {
                                setEditingOpportunity(null);
                                setShowOpportunityModal(true);
                            }}
                            disabled={!selectedPipeline}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                        >
                            <Plus className="h-4 w-4" />
                            Opportunity
                        </button>
                    </div>
                </div>

                {selectedPipeline ? (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Open pipeline</div>
                                        <div className="text-xl font-bold text-foreground">
                                            {formatMoney(stats.open_value_cents, selectedPipeline.currency)}
                                        </div>
                                    </div>
                                    <CircleDollarSign className="h-6 w-6 text-chart-1" />
                                </div>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Weighted forecast</div>
                                        <div className="text-xl font-bold text-foreground">
                                            {formatMoney(stats.weighted_value_cents, selectedPipeline.currency)}
                                        </div>
                                    </div>
                                    <TrendingUp className="h-6 w-6 text-chart-2" />
                                </div>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Won value</div>
                                        <div className="text-xl font-bold text-foreground">
                                            {formatMoney(stats.won_value_cents, selectedPipeline.currency)}
                                        </div>
                                    </div>
                                    <BriefcaseBusiness className="h-6 w-6 text-chart-3" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center">
                            <select
                                value={selectedPipeline.id}
                                onChange={(event) => visitPipeline(Number(event.target.value))}
                                className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground"
                            >
                                {pipelines.map((pipeline) => (
                                    <option key={pipeline.id} value={pipeline.id}>
                                        {pipeline.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex rounded-lg border border-border bg-background p-1">
                                {(['open', 'won', 'lost', 'all'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => visitPipeline(selectedPipeline.id, status)}
                                        className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                                            filters.status === status
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search opportunities or contacts"
                                    className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground"
                                />
                            </form>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={(event) => setDraggingId(Number(String(event.active.id).replace('opportunity-', '')))}
                            onDragCancel={() => setDraggingId(null)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-3">
                                {selectedPipeline.stages.map((stage) => (
                                    <StageColumn
                                        key={stage.id}
                                        stage={stage}
                                        opportunities={boardOpportunities.filter((opportunity) => opportunity.stage.id === stage.id)}
                                        currency={selectedPipeline.currency}
                                        onEdit={(opportunity) => {
                                            setEditingOpportunity(opportunity);
                                            setShowOpportunityModal(true);
                                        }}
                                    />
                                ))}
                            </div>
                            <DragOverlay dropAnimation={null}>
                                {dragging && (
                                    <OpportunityCard overlay opportunity={dragging} currency={selectedPipeline.currency} onEdit={() => undefined} />
                                )}
                            </DragOverlay>
                        </DndContext>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="max-w-md rounded-xl border border-dashed border-border bg-card p-10 text-center">
                            <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">Build your first sales pipeline</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Track every qualified lead from first contact through a won or lost outcome.
                            </p>
                            <button
                                onClick={() => setShowCreatePipeline(true)}
                                className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            >
                                Create sales pipeline
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreatePipeline && <PipelineModal onClose={() => setShowCreatePipeline(false)} />}
            {showManagePipeline && selectedPipeline && (
                <ManagePipelineModal pipeline={selectedPipeline} opportunityCounts={opportunityCounts} onClose={() => setShowManagePipeline(false)} />
            )}
            {showOpportunityModal && selectedPipeline && (
                <OpportunityModal
                    pipeline={selectedPipeline}
                    opportunity={editingOpportunity}
                    preselectedContact={editingOpportunity ? null : preselectedContact}
                    onClose={() => {
                        setShowOpportunityModal(false);
                        setEditingOpportunity(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
