import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { durationLabel, simulationSummary } from '@/lib/simulation';
import { useAutomationStore } from '@/stores/automationStore';
import type { BreadcrumbItem } from '@/types';
import type {
    AutomationDefinition,
    AutomationDraft,
    AutomationEditorOptions,
    AutomationEnrollmentPolicy,
    AutomationNode,
    AutomationTrigger,
    AutomationTriggerType,
    AutomationWorkflowStatus,
    ConditionOperator,
} from '@/types/automation';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    BriefcaseBusiness,
    Check,
    CircleStop,
    Clock3,
    Code2,
    GitBranch,
    GripVertical,
    Mail,
    Play,
    Plus,
    Redo2,
    Rocket,
    Save,
    Settings2,
    TestTube2,
    Trash2,
    Undo2,
    UserRoundCog,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    workflow: {
        id: number;
        name: string;
        description: string | null;
        status: AutomationWorkflowStatus;
        enrollment_policy: AutomationEnrollmentPolicy;
        revision: number;
        definition: AutomationDefinition;
        active_version: { version: number; published_at: string } | null;
    };
    options: AutomationEditorOptions;
}

const triggerTypes: Array<{ value: AutomationTriggerType; label: string }> = [
    { value: 'funnel.form_submitted', label: 'Funnel form submitted' },
    { value: 'contact.created', label: 'Contact created' },
    { value: 'contact.status_changed', label: 'Contact status changed' },
    { value: 'opportunity.created', label: 'Opportunity created' },
    { value: 'opportunity.stage_changed', label: 'Opportunity stage changed' },
    { value: 'opportunity.status_changed', label: 'Opportunity status changed' },
];

const actionTypes: Array<{ type: AutomationNode['type']; label: string; description: string; icon: typeof Mail }> = [
    { type: 'send_email', label: 'Send email', description: 'Send consent-aware contact email.', icon: Mail },
    { type: 'wait', label: 'Wait', description: 'Resume after a fixed delay.', icon: Clock3 },
    { type: 'condition', label: 'If / else', description: 'Choose a Yes or No path.', icon: GitBranch },
    { type: 'update_contact', label: 'Update contact', description: 'Change lifecycle status or tags.', icon: UserRoundCog },
    { type: 'create_opportunity', label: 'Create opportunity', description: 'Add a deal to a CRM pipeline.', icon: BriefcaseBusiness },
    { type: 'move_opportunity', label: 'Move opportunity', description: 'Move the current matching deal.', icon: BriefcaseBusiness },
    { type: 'notify_owner', label: 'Notify owner', description: 'Send an internal email alert.', icon: Bell },
    { type: 'webhook', label: 'Webhook', description: 'POST a signed event externally.', icon: Code2 },
];

const nodeIcons: Record<AutomationNode['type'], typeof Mail> = {
    send_email: Mail,
    wait: Clock3,
    condition: GitBranch,
    update_contact: UserRoundCog,
    create_opportunity: BriefcaseBusiness,
    move_opportunity: BriefcaseBusiness,
    notify_owner: Bell,
    webhook: Code2,
    end: CircleStop,
};

const conditionFields = [
    'contact.name',
    'contact.email',
    'contact.phone',
    'contact.status',
    'contact.source',
    'funnel.id',
    'funnel.name',
    'submission.form_id',
    'opportunity.title',
    'opportunity.value',
    'opportunity.status',
    'pipeline.name',
    'stage.name',
];

const conditionOperators: ConditionOperator[] = [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'is_empty',
    'is_not_empty',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
];

const contactStatuses = ['new', 'contacted', 'qualified', 'won', 'lost'];

function humanize(value: string): string {
    return value.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nodeSummary(node: AutomationNode): string {
    if (node.type === 'send_email') return node.config.subject || 'Configure email';
    if (node.type === 'wait') return durationLabel(node.config.amount, node.config.unit);
    if (node.type === 'condition') return `${humanize(node.config.field)} ${humanize(node.config.operator)}`;
    if (node.type === 'update_contact') return node.config.status ? `Set status to ${node.config.status}` : 'Update tags';
    if (node.type === 'create_opportunity') return 'Create a CRM deal';
    if (node.type === 'move_opportunity') return 'Move a CRM deal';
    if (node.type === 'notify_owner') return node.config.subject || 'Notify account owner';
    if (node.type === 'webhook') return node.config.url || 'Configure URL';
    return 'Complete this branch';
}

function nextId(node: AutomationNode): string | null {
    if ('next_node_id' in node) return node.next_node_id;
    return null;
}

function createNode(type: AutomationNode['type'], targetId: string): AutomationNode {
    const id = crypto.randomUUID();
    if (type === 'send_email') {
        return {
            id,
            type,
            config: { purpose: 'marketing', subject: 'Thanks, {{ contact.name }}', body: 'Thanks for reaching out.' },
            next_node_id: targetId,
        };
    }
    if (type === 'wait') return { id, type, config: { amount: 1, unit: 'days' }, next_node_id: targetId };
    if (type === 'condition') {
        return {
            id,
            type,
            config: { field: 'contact.status', operator: 'equals', value: 'qualified' },
            yes_node_id: targetId,
            no_node_id: targetId,
        };
    }
    if (type === 'update_contact') return { id, type, config: { status: 'contacted', add_tags: [], remove_tags: [] }, next_node_id: targetId };
    if (type === 'create_opportunity') {
        return { id, type, config: { pipeline_id: null, stage_id: null, value: 0, title: '{{ contact.name }}' }, next_node_id: targetId };
    }
    if (type === 'move_opportunity') return { id, type, config: { pipeline_id: null, stage_id: null }, next_node_id: targetId };
    if (type === 'notify_owner') {
        return {
            id,
            type,
            config: { subject: 'Follow up with {{ contact.name }}', body: '{{ contact.email }} needs follow-up.' },
            next_node_id: targetId,
        };
    }
    if (type === 'webhook') return { id, type, config: { url: 'https://' }, next_node_id: targetId };
    return { id, type: 'end', config: {} };
}

function replaceReferences(nodes: AutomationNode[], fromId: string, toId: string): AutomationNode[] {
    return nodes.map((node) => {
        if (node.type === 'condition') {
            return {
                ...node,
                yes_node_id: node.yes_node_id === fromId ? toId : node.yes_node_id,
                no_node_id: node.no_node_id === fromId ? toId : node.no_node_id,
            };
        }
        if ('next_node_id' in node && node.next_node_id === fromId) return { ...node, next_node_id: toId };
        return node;
    });
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
}

function SortableNodeCard({
    node,
    disabled,
    onConfigure,
    onInsert,
    onInsertBranch,
    onDelete,
    nodeName,
}: {
    node: AutomationNode;
    disabled: boolean;
    onConfigure: () => void;
    onInsert: () => void;
    onInsertBranch: (branch: 'yes' | 'no') => void;
    onDelete: () => void;
    nodeName: (id: string) => string;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: node.id,
        disabled: disabled || node.type === 'end',
    });
    const Icon = nodeIcons[node.type];

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={isDragging ? 'relative z-20 opacity-60' : ''}
        >
            <article className="rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-start gap-3 p-4">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        disabled={disabled || node.type === 'end'}
                        className="mt-0.5 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted disabled:cursor-default disabled:opacity-30"
                        aria-label={`Reorder ${humanize(node.type)}`}
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </span>
                    <button
                        type="button"
                        onClick={onConfigure}
                        disabled={node.type === 'end'}
                        className="min-w-0 flex-1 text-left disabled:cursor-default"
                    >
                        <p className="font-semibold">{humanize(node.type)}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{nodeSummary(node)}</p>
                        {node.type === 'condition' && (
                            <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                                <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-500">Yes → {nodeName(node.yes_node_id)}</span>
                                <span className="rounded bg-red-500/10 px-2 py-1 text-red-500">No → {nodeName(node.no_node_id)}</span>
                            </div>
                        )}
                    </button>
                    {node.type !== 'end' && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${humanize(node.type)}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {node.type === 'condition' && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
                        <button
                            type="button"
                            onClick={() => onInsertBranch('yes')}
                            className="rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-500 hover:bg-emerald-500/10"
                        >
                            <Plus className="mr-1 inline h-3 w-3" />
                            Add Yes step
                        </button>
                        <button
                            type="button"
                            onClick={() => onInsertBranch('no')}
                            className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10"
                        >
                            <Plus className="mr-1 inline h-3 w-3" />
                            Add No step
                        </button>
                    </div>
                )}
            </article>
            {node.type !== 'condition' && (
                <div className="grid h-12 place-items-center">
                    <button
                        type="button"
                        onClick={onInsert}
                        className="z-10 grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:border-primary hover:text-primary"
                        aria-label={node.type === 'end' ? 'Insert before End' : `Add step after ${humanize(node.type)}`}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function TriggerEditor({
    trigger,
    options,
    onChange,
}: {
    trigger: AutomationTrigger;
    options: AutomationEditorOptions;
    onChange: (trigger: AutomationTrigger) => void;
}) {
    const pipeline = options.pipelines.find((item) => item.id === Number(trigger.config.pipeline_id));
    const update = (config: AutomationTrigger['config']) => onChange({ ...trigger, config });

    return (
        <section className="rounded-xl border border-primary/30 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Play className="h-4 w-4" />
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">Trigger</p>
                    <p className="text-sm text-muted-foreground">The event that enrolls a contact.</p>
                </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                    <span className="font-medium">Event</span>
                    <select
                        value={trigger.type}
                        onChange={(event) => onChange({ type: event.target.value as AutomationTriggerType, config: {} })}
                        className="rounded-lg border border-border bg-background px-3 py-2"
                    >
                        {triggerTypes.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </label>
                {trigger.type.startsWith('funnel.') && (
                    <label className="grid gap-1.5 text-sm">
                        <span className="font-medium">Funnel</span>
                        <select
                            value={trigger.config.funnel_id || ''}
                            onChange={(event) => update({ ...trigger.config, funnel_id: event.target.value ? Number(event.target.value) : null })}
                            className="rounded-lg border border-border bg-background px-3 py-2"
                        >
                            <option value="">Any funnel</option>
                            {options.funnels.map((funnel) => (
                                <option key={funnel.id} value={funnel.id}>
                                    {funnel.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {trigger.type === 'funnel.form_submitted' && (
                    <>
                        <label className="grid gap-1.5 text-sm">
                            <span className="font-medium">Form ID</span>
                            <input
                                value={trigger.config.form_id || ''}
                                onChange={(event) => update({ ...trigger.config, form_id: event.target.value })}
                                placeholder="Any form"
                                className="rounded-lg border border-border bg-background px-3 py-2"
                            />
                        </label>
                        <label className="grid gap-1.5 text-sm">
                            <span className="font-medium">Contact occurrence</span>
                            <select
                                value={trigger.config.contact_occurrence || ''}
                                onChange={(event) => update({ ...trigger.config, contact_occurrence: event.target.value as 'new' | 'repeat' | '' })}
                                className="rounded-lg border border-border bg-background px-3 py-2"
                            >
                                <option value="">New or repeat</option>
                                <option value="new">New contact only</option>
                                <option value="repeat">Repeat contact only</option>
                            </select>
                        </label>
                    </>
                )}
                {trigger.type.startsWith('opportunity.') && (
                    <label className="grid gap-1.5 text-sm">
                        <span className="font-medium">Pipeline</span>
                        <select
                            value={trigger.config.pipeline_id || ''}
                            onChange={(event) =>
                                update({ ...trigger.config, pipeline_id: event.target.value ? Number(event.target.value) : null, stage_id: null })
                            }
                            className="rounded-lg border border-border bg-background px-3 py-2"
                        >
                            <option value="">Any pipeline</option>
                            {options.pipelines.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {trigger.type === 'opportunity.stage_changed' && pipeline && (
                    <label className="grid gap-1.5 text-sm">
                        <span className="font-medium">Current stage</span>
                        <select
                            value={trigger.config.stage_id || ''}
                            onChange={(event) => update({ ...trigger.config, stage_id: event.target.value ? Number(event.target.value) : null })}
                            className="rounded-lg border border-border bg-background px-3 py-2"
                        >
                            <option value="">Any stage</option>
                            {pipeline.stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {stage.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {(trigger.type === 'contact.status_changed' || trigger.type === 'opportunity.status_changed') && (
                    <>
                        <label className="grid gap-1.5 text-sm">
                            <span className="font-medium">From status</span>
                            <select
                                value={trigger.config.from_status || ''}
                                onChange={(event) => update({ ...trigger.config, from_status: event.target.value })}
                                className="rounded-lg border border-border bg-background px-3 py-2"
                            >
                                <option value="">Any status</option>
                                {(trigger.type.startsWith('contact.') ? contactStatuses : ['open', 'won', 'lost']).map((status) => (
                                    <option key={status} value={status}>
                                        {humanize(status)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1.5 text-sm">
                            <span className="font-medium">To status</span>
                            <select
                                value={trigger.config.to_status || ''}
                                onChange={(event) => update({ ...trigger.config, to_status: event.target.value })}
                                className="rounded-lg border border-border bg-background px-3 py-2"
                            >
                                <option value="">Any status</option>
                                {(trigger.type.startsWith('contact.') ? contactStatuses : ['open', 'won', 'lost']).map((status) => (
                                    <option key={status} value={status}>
                                        {humanize(status)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                )}
            </div>
        </section>
    );
}

function NodeConfigDialog({
    node,
    nodes,
    options,
    open,
    onOpenChange,
    onSave,
}: {
    node: AutomationNode | null;
    nodes: AutomationNode[];
    options: AutomationEditorOptions;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (node: AutomationNode) => void;
}) {
    const [config, setConfig] = useState<Record<string, unknown>>({});
    const [yesNodeId, setYesNodeId] = useState('');
    const [noNodeId, setNoNodeId] = useState('');

    useEffect(() => {
        if (node) {
            setConfig({ ...node.config });
            setYesNodeId(node.type === 'condition' ? node.yes_node_id : '');
            setNoNodeId(node.type === 'condition' ? node.no_node_id : '');
        }
    }, [node]);

    if (!node) return null;

    const text = (key: string) => (typeof config[key] === 'string' ? String(config[key]) : '');
    const number = (key: string) => (typeof config[key] === 'number' ? Number(config[key]) : 0);
    const set = (key: string, value: unknown) => setConfig((current) => ({ ...current, [key]: value }));
    const selectedPipeline = options.pipelines.find((pipeline) => pipeline.id === Number(config.pipeline_id));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const updated =
            node.type === 'condition'
                ? ({ ...node, config, yes_node_id: yesNodeId, no_node_id: noNodeId } as AutomationNode)
                : ({ ...node, config } as AutomationNode);
        onSave(updated);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Configure {humanize(node.type)}</DialogTitle>
                        <DialogDescription>Changes remain in the draft until this workflow is published.</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 grid gap-4">
                        {node.type === 'send_email' && (
                            <>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Purpose</span>
                                    <select
                                        value={text('purpose')}
                                        onChange={(event) => set('purpose', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        <option value="marketing">Marketing — respects unsubscribe</option>
                                        <option value="transactional">Transactional</option>
                                    </select>
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Subject</span>
                                    <input
                                        value={text('subject')}
                                        onChange={(event) => set('subject', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Message</span>
                                    <textarea
                                        value={text('body')}
                                        onChange={(event) => set('body', event.target.value)}
                                        rows={7}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        Merge fields: {'{{ contact.name }}'}, {'{{ funnel.name }}'}, {'{{ unsubscribe_url }}'}
                                    </span>
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Reply-to (optional)</span>
                                    <input
                                        type="email"
                                        value={text('reply_to')}
                                        onChange={(event) => set('reply_to', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                            </>
                        )}
                        {node.type === 'wait' && (
                            <div className="grid grid-cols-2 gap-3">
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Duration</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={number('amount')}
                                        onChange={(event) => set('amount', Number(event.target.value))}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Unit</span>
                                    <select
                                        value={text('unit')}
                                        onChange={(event) => set('unit', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </label>
                            </div>
                        )}
                        {node.type === 'condition' && (
                            <>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Field</span>
                                    <select
                                        value={text('field')}
                                        onChange={(event) => set('field', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        {conditionFields.map((field) => (
                                            <option key={field} value={field}>
                                                {humanize(field)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Operator</span>
                                    <select
                                        value={text('operator')}
                                        onChange={(event) => set('operator', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        {conditionOperators.map((operator) => (
                                            <option key={operator} value={operator}>
                                                {humanize(operator)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {!['is_empty', 'is_not_empty'].includes(text('operator')) && (
                                    <label className="grid gap-1.5 text-sm">
                                        <span className="font-medium">Value</span>
                                        <input
                                            value={String(config.value ?? '')}
                                            onChange={(event) => set('value', event.target.value)}
                                            className="rounded-lg border border-border bg-background px-3 py-2"
                                        />
                                    </label>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="grid gap-1.5 text-sm">
                                        <span className="font-medium text-emerald-500">Yes path</span>
                                        <select
                                            value={yesNodeId}
                                            onChange={(event) => setYesNodeId(event.target.value)}
                                            className="rounded-lg border border-border bg-background px-3 py-2"
                                        >
                                            {nodes
                                                .filter((item) => item.id !== node.id)
                                                .map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {humanize(item.type)} · {item.id.slice(0, 6)}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>
                                    <label className="grid gap-1.5 text-sm">
                                        <span className="font-medium text-red-500">No path</span>
                                        <select
                                            value={noNodeId}
                                            onChange={(event) => setNoNodeId(event.target.value)}
                                            className="rounded-lg border border-border bg-background px-3 py-2"
                                        >
                                            {nodes
                                                .filter((item) => item.id !== node.id)
                                                .map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {humanize(item.type)} · {item.id.slice(0, 6)}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>
                                </div>
                            </>
                        )}
                        {node.type === 'update_contact' && (
                            <>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Set lifecycle status</span>
                                    <select
                                        value={text('status')}
                                        onChange={(event) => set('status', event.target.value || null)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        <option value="">Do not change</option>
                                        {contactStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {humanize(status)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Add tags</span>
                                    <input
                                        value={Array.isArray(config.add_tags) ? config.add_tags.join(', ') : ''}
                                        onChange={(event) =>
                                            set(
                                                'add_tags',
                                                event.target.value
                                                    .split(',')
                                                    .map((tag) => tag.trim())
                                                    .filter(Boolean),
                                            )
                                        }
                                        placeholder="priority, demo-request"
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Remove tags</span>
                                    <input
                                        value={Array.isArray(config.remove_tags) ? config.remove_tags.join(', ') : ''}
                                        onChange={(event) =>
                                            set(
                                                'remove_tags',
                                                event.target.value
                                                    .split(',')
                                                    .map((tag) => tag.trim())
                                                    .filter(Boolean),
                                            )
                                        }
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                            </>
                        )}
                        {(node.type === 'create_opportunity' || node.type === 'move_opportunity') && (
                            <>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Pipeline</span>
                                    <select
                                        value={Number(config.pipeline_id) || ''}
                                        onChange={(event) => {
                                            set('pipeline_id', event.target.value ? Number(event.target.value) : null);
                                            set('stage_id', null);
                                        }}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        <option value="">Select pipeline</option>
                                        {options.pipelines.map((pipeline) => (
                                            <option key={pipeline.id} value={pipeline.id}>
                                                {pipeline.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Stage</span>
                                    <select
                                        value={Number(config.stage_id) || ''}
                                        onChange={(event) => set('stage_id', event.target.value ? Number(event.target.value) : null)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    >
                                        <option value="">Select stage</option>
                                        {selectedPipeline?.stages.map((stage) => (
                                            <option key={stage.id} value={stage.id}>
                                                {stage.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {node.type === 'create_opportunity' && (
                                    <>
                                        <label className="grid gap-1.5 text-sm">
                                            <span className="font-medium">Title</span>
                                            <input
                                                value={text('title')}
                                                onChange={(event) => set('title', event.target.value)}
                                                className="rounded-lg border border-border bg-background px-3 py-2"
                                            />
                                        </label>
                                        <label className="grid gap-1.5 text-sm">
                                            <span className="font-medium">Value</span>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={number('value')}
                                                onChange={(event) => set('value', Number(event.target.value))}
                                                className="rounded-lg border border-border bg-background px-3 py-2"
                                            />
                                        </label>
                                    </>
                                )}
                            </>
                        )}
                        {node.type === 'notify_owner' && (
                            <>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Subject</span>
                                    <input
                                        value={text('subject')}
                                        onChange={(event) => set('subject', event.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Message</span>
                                    <textarea
                                        value={text('body')}
                                        onChange={(event) => set('body', event.target.value)}
                                        rows={6}
                                        className="rounded-lg border border-border bg-background px-3 py-2"
                                    />
                                </label>
                            </>
                        )}
                        {node.type === 'webhook' && (
                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">HTTPS URL</span>
                                <input
                                    type="url"
                                    value={text('url')}
                                    onChange={(event) => set('url', event.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                />
                                <span className="text-xs text-muted-foreground">
                                    Requests are signed, non-redirecting, and blocked from private networks by default.
                                </span>
                                <code className="rounded-md bg-muted p-2 text-xs break-all">Signing secret: {options.webhook_signing_secret}</code>
                            </label>
                        )}
                    </div>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                            Apply
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AutomationEditor({ workflow, options }: Props) {
    const draft = useAutomationStore((state) => state.draft);
    const isDirty = useAutomationStore((state) => state.isDirty);
    const isSaving = useAutomationStore((state) => state.isSaving);
    const setDraft = useAutomationStore((state) => state.setDraft);
    const updateMetadata = useAutomationStore((state) => state.updateMetadata);
    const updateDefinition = useAutomationStore((state) => state.updateDefinition);
    const undo = useAutomationStore((state) => state.undo);
    const redo = useAutomationStore((state) => state.redo);
    const [revision, setRevision] = useState(workflow.revision);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error' | 'conflict'>('saved');
    const [errors, setErrors] = useState<string[]>([]);
    const [editingNode, setEditingNode] = useState<AutomationNode | null>(null);
    const [insertTarget, setInsertTarget] = useState<{ node: AutomationNode; branch?: 'yes' | 'no' } | null>(null);
    const [testContactId, setTestContactId] = useState('');
    const [simulation, setSimulation] = useState<Array<{ node_id: string; node_type: string; output: Record<string, unknown> }> | null>(null);
    const initializedWorkflowId = useRef<number | null>(null);
    const revisionRef = useRef(workflow.revision);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    useEffect(() => {
        if (initializedWorkflowId.current === workflow.id) return;
        const initial: AutomationDraft = {
            name: workflow.name,
            description: workflow.description || '',
            enrollment_policy: workflow.enrollment_policy,
            definition: workflow.definition,
        };
        setDraft(initial);
        setRevision(workflow.revision);
        revisionRef.current = workflow.revision;
        initializedWorkflowId.current = workflow.id;
        setSaveState('saved');
        setErrors([]);
        setEditingNode(null);
        setInsertTarget(null);
        setSimulation(null);
        setTestContactId('');
    }, [setDraft, workflow]);

    const saveDraft = useCallback(async (): Promise<boolean> => {
        for (let attempt = 0; attempt < 5; attempt++) {
            const current = useAutomationStore.getState().draft;
            if (!current || useAutomationStore.getState().isSaving) return !useAutomationStore.getState().isDirty;
            const serialized = JSON.stringify(current);
            useAutomationStore.getState().setSaving(true);
            setSaveState('saving');
            setErrors([]);

            try {
                const response = await fetch(route('automations.autosave', workflow.id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                    body: JSON.stringify({ ...current, revision: revisionRef.current }),
                });
                const payload = (await response.json()) as { revision?: number; message?: string; errors?: Record<string, string[]> };
                if (initializedWorkflowId.current !== workflow.id) {
                    return false;
                }
                if (response.status === 409) {
                    setSaveState('conflict');
                    setErrors([payload.message || 'This draft changed elsewhere.']);
                    useAutomationStore.getState().setSaving(false);
                    return false;
                }
                if (!response.ok) {
                    const messages = payload.errors ? Object.values(payload.errors).flat() : [payload.message || 'Draft validation failed.'];
                    setErrors(messages);
                    setSaveState('error');
                    useAutomationStore.getState().setSaving(false);
                    return false;
                }
                if (payload.revision) {
                    revisionRef.current = payload.revision;
                    setRevision(payload.revision);
                }
                if (JSON.stringify(useAutomationStore.getState().draft) === serialized) {
                    useAutomationStore.getState().markClean();
                    setSaveState('saved');
                    return true;
                }
                useAutomationStore.getState().setSaving(false);
            } catch {
                if (initializedWorkflowId.current !== workflow.id) {
                    return false;
                }
                setSaveState('error');
                setErrors(['The draft could not be saved. Check your connection and try again.']);
                useAutomationStore.getState().setSaving(false);
                return false;
            }
        }

        setSaveState('error');
        setErrors(['The draft is changing too quickly to publish. Pause editing and try again.']);
        return false;
    }, [workflow.id]);

    useEffect(() => {
        if (!isDirty || isSaving) return;
        const timer = window.setTimeout(() => void saveDraft(), 1000);
        return () => window.clearTimeout(timer);
    }, [draft, isDirty, isSaving, saveDraft]);

    const definition = draft?.definition;
    const hasConditions = definition?.nodes.some((node) => node.type === 'condition') ?? false;
    const nodeNames = useMemo(
        () => new Map((definition?.nodes || []).map((node) => [node.id, `${humanize(node.type)} · ${node.id.slice(0, 6)}`])),
        [definition?.nodes],
    );

    if (!draft || !definition) {
        return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading automation…</div>;
    }

    const setDefinition = (changes: Partial<AutomationDefinition>) => updateDefinition({ ...definition, ...changes });
    const updateTrigger = (trigger: AutomationTrigger) => setDefinition({ trigger });

    const insert = (type: AutomationNode['type']) => {
        if (!insertTarget) return;
        const insertAnchor = insertTarget.node;
        const target =
            insertAnchor.type === 'condition' && insertTarget.branch
                ? insertTarget.branch === 'yes'
                    ? insertAnchor.yes_node_id
                    : insertAnchor.no_node_id
                : insertAnchor.type === 'end'
                  ? insertAnchor.id
                  : nextId(insertAnchor);
        if (!target) return;
        const node = createNode(type, target);
        const anchorIndex = definition.nodes.findIndex((item) => item.id === insertAnchor.id);
        let nodes = [...definition.nodes];
        if (insertAnchor.type === 'condition' && insertTarget.branch) {
            nodes = nodes.map((item) =>
                item.id === insertAnchor.id && item.type === 'condition'
                    ? {
                          ...item,
                          yes_node_id: insertTarget.branch === 'yes' ? node.id : item.yes_node_id,
                          no_node_id: insertTarget.branch === 'no' ? node.id : item.no_node_id,
                      }
                    : item,
            );
        } else if (insertAnchor.type === 'end') nodes = replaceReferences(nodes, insertAnchor.id, node.id);
        else nodes = nodes.map((item) => (item.id === insertAnchor.id && 'next_node_id' in item ? { ...item, next_node_id: node.id } : item));
        nodes.splice(insertAnchor.type === 'end' ? anchorIndex : anchorIndex + 1, 0, node);
        const startNodeId = definition.start_node_id === insertAnchor.id && insertAnchor.type === 'end' ? node.id : definition.start_node_id;
        updateDefinition({ ...definition, nodes, start_node_id: startNodeId });
        setInsertTarget(null);
        if (node.type !== 'end') setEditingNode(node);
    };

    const saveNode = (node: AutomationNode) => {
        updateDefinition({ ...definition, nodes: definition.nodes.map((item) => (item.id === node.id ? node : item)) });
        setEditingNode(null);
    };

    const deleteNode = (node: AutomationNode) => {
        const target = node.type === 'condition' && node.yes_node_id === node.no_node_id ? node.yes_node_id : nextId(node);
        if (node.type === 'condition' && !target) {
            window.alert('Point the Yes and No paths to the same next step before deleting this condition.');
            return;
        }
        if (!target || !window.confirm(`Delete ${humanize(node.type)}?`)) return;
        const nodes = replaceReferences(
            definition.nodes.filter((item) => item.id !== node.id),
            node.id,
            target,
        );
        updateDefinition({ ...definition, nodes, start_node_id: definition.start_node_id === node.id ? target : definition.start_node_id });
    };

    const dragEnd = (event: DragEndEvent) => {
        if (hasConditions || !event.over || event.active.id === event.over.id) return;
        const end = definition.nodes.find((node) => node.type === 'end');
        if (!end) return;
        const actions = definition.nodes.filter((node) => node.type !== 'end');
        const oldIndex = actions.findIndex((node) => node.id === event.active.id);
        const newIndex = actions.findIndex((node) => node.id === event.over?.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const ordered = arrayMove(actions, oldIndex, newIndex).map((node, index, list) => ({
            ...node,
            next_node_id: list[index + 1]?.id || end.id,
        })) as AutomationNode[];
        updateDefinition({ ...definition, nodes: [...ordered, end], start_node_id: ordered[0]?.id || end.id });
    };

    const validate = async () => {
        setErrors([]);
        try {
            const response = await fetch(route('automations.validate', workflow.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ definition }),
            });
            const payload = (await response.json()) as { valid?: boolean; errors?: string[] };
            setErrors(payload.errors || []);
            if (payload.valid) setErrors(['✓ Workflow definition is valid and ready to publish.']);
        } catch {
            setErrors(['Validation could not be completed. Check your connection and try again.']);
        }
    };

    const simulate = async () => {
        setSimulation(null);
        try {
            const response = await fetch(route('automations.simulate', workflow.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ contact_id: testContactId ? Number(testContactId) : null }),
            });
            const payload = (await response.json()) as {
                path?: Array<{ node_id: string; node_type: string; output: Record<string, unknown> }>;
                errors?: Record<string, string[]>;
            };
            if (!response.ok) {
                setErrors(payload.errors ? Object.values(payload.errors).flat() : ['Simulation failed.']);
                return;
            }
            setSimulation(payload.path || []);
        } catch {
            setErrors(['Simulation could not be completed. Check your connection and try again.']);
        }
    };

    const publish = async () => {
        if (isDirty && !(await saveDraft())) return;
        router.post(route('automations.publish', workflow.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Automations', href: '/automations' },
        { title: workflow.name, href: `/automations/${workflow.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${draft.name} · Automation`} />
            <div className="flex h-full flex-1 flex-col">
                <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link href={route('automations.index')} className="rounded-lg border border-border p-2 hover:bg-muted">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="min-w-0">
                                <input
                                    value={draft.name}
                                    onChange={(event) => updateMetadata({ name: event.target.value })}
                                    className="w-full truncate border-0 bg-transparent p-0 text-lg font-bold outline-none"
                                    aria-label="Automation name"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {saveState === 'saving'
                                        ? 'Saving…'
                                        : saveState === 'saved'
                                          ? `Draft saved · revision ${revision}`
                                          : saveState === 'conflict'
                                            ? 'Save conflict'
                                            : 'Draft has errors'}
                                    {workflow.active_version ? ` · active v${workflow.active_version.version}` : ' · not published'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={undo}
                                disabled={!useAutomationStore.getState().canUndo()}
                                className="rounded-lg border border-border p-2 disabled:opacity-30"
                                aria-label="Undo"
                            >
                                <Undo2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={redo}
                                disabled={!useAutomationStore.getState().canRedo()}
                                className="rounded-lg border border-border p-2 disabled:opacity-30"
                                aria-label="Redo"
                            >
                                <Redo2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => void validate()}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <Check className="h-4 w-4" /> Validate
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveDraft()}
                                disabled={!isDirty || isSaving}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-40"
                            >
                                <Save className="h-4 w-4" /> Save
                            </button>
                            <button
                                type="button"
                                onClick={() => void publish()}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                            >
                                <Rocket className="h-4 w-4" /> Publish
                            </button>
                        </div>
                    </div>
                </header>

                <main className="grid flex-1 gap-6 p-4 lg:grid-cols-[minmax(0,760px)_320px] lg:justify-center lg:p-6">
                    <div>
                        <TriggerEditor trigger={definition.trigger} options={options} onChange={updateTrigger} />
                        <div className="mx-auto h-12 w-px bg-border" />
                        <DndContext sensors={sensors} onDragEnd={dragEnd}>
                            <SortableContext items={definition.nodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>
                                {definition.nodes.map((node) => (
                                    <SortableNodeCard
                                        key={node.id}
                                        node={node}
                                        disabled={hasConditions}
                                        onConfigure={() => setEditingNode(node)}
                                        onInsert={() => setInsertTarget({ node })}
                                        onInsertBranch={(branch) => setInsertTarget({ node, branch })}
                                        onDelete={() => deleteNode(node)}
                                        nodeName={(id) => nodeNames.get(id) || 'Missing step'}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {hasConditions && (
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                Drag reordering is disabled for branched workflows; configure branch destinations explicitly.
                            </p>
                        )}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        <section className="rounded-xl border border-border bg-card p-4">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <Settings2 className="h-4 w-4 text-primary" /> Workflow settings
                            </h2>
                            <label className="mt-4 grid gap-1.5 text-sm">
                                <span className="font-medium">Description</span>
                                <textarea
                                    value={draft.description}
                                    onChange={(event) => updateMetadata({ description: event.target.value })}
                                    rows={3}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                />
                            </label>
                            <label className="mt-3 grid gap-1.5 text-sm">
                                <span className="font-medium">Contact re-entry</span>
                                <select
                                    value={draft.enrollment_policy}
                                    onChange={(event) => updateMetadata({ enrollment_policy: event.target.value as AutomationEnrollmentPolicy })}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                >
                                    <option value="every_event">Every distinct event</option>
                                    <option value="after_completion">After prior run completes</option>
                                    <option value="once_per_contact">Once per contact</option>
                                </select>
                            </label>
                            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                {definition.nodes.length}/50 steps · {workflow.status} · published versions are immutable
                            </div>
                        </section>

                        <section className="rounded-xl border border-border bg-card p-4">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <TestTube2 className="h-4 w-4 text-primary" /> Dry-run test
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Evaluate a path without sending email, webhooks, or changing CRM data.
                            </p>
                            <select
                                value={testContactId}
                                onChange={(event) => setTestContactId(event.target.value)}
                                className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">No contact context</option>
                                {options.contacts.map((contact) => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.name || contact.email}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => void simulate()}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <Play className="h-4 w-4" /> Simulate draft
                            </button>
                            {simulation && (
                                <ol className="mt-3 space-y-2">
                                    {simulation.map((step, index) => (
                                        <li key={`${step.node_id}-${index}`} className="rounded-lg bg-muted/50 p-2 text-xs">
                                            <p className="font-medium">
                                                {index + 1}. {humanize(step.node_type)}
                                            </p>
                                            <p className="mt-1 break-words text-muted-foreground">{simulationSummary(step.output)}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>

                        {errors.length > 0 && (
                            <section
                                aria-live="polite"
                                className={`rounded-xl border p-4 ${errors.every((error) => error.startsWith('✓')) ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-destructive/30 bg-destructive/10'}`}
                            >
                                <h2 className="flex items-center gap-2 text-sm font-semibold">
                                    {errors.every((error) => error.startsWith('✓')) ? (
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                    Validation
                                </h2>
                                <ul className="mt-2 space-y-1 text-xs">
                                    {errors.map((error) => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </aside>
                </main>
            </div>

            <Dialog open={insertTarget !== null} onOpenChange={(open) => !open && setInsertTarget(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add workflow step</DialogTitle>
                        <DialogDescription>Select one focused action. You can configure it immediately after adding.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {actionTypes.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.type}
                                    type="button"
                                    onClick={() => insert(action.type)}
                                    className="flex items-start gap-3 rounded-xl border border-border p-4 text-left hover:border-primary hover:bg-primary/5"
                                >
                                    <Icon className="mt-0.5 h-5 w-5 text-primary" />
                                    <span>
                                        <span className="block font-semibold">{action.label}</span>
                                        <span className="mt-1 block text-xs text-muted-foreground">{action.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            <NodeConfigDialog
                node={editingNode}
                nodes={definition.nodes}
                options={options}
                open={editingNode !== null}
                onOpenChange={(open) => !open && setEditingNode(null)}
                onSave={saveNode}
            />
        </AppLayout>
    );
}
