import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AutomationEnrollmentPolicy, AutomationWorkflowStatus } from '@/types/automation';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Archive, CheckCircle2, Clock3, Copy, FilePlus2, Pause, Play, Plus, Search, Sparkles, Workflow, XCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Automations', href: '/automations' }];

interface WorkflowItem {
    id: number;
    name: string;
    description: string | null;
    status: AutomationWorkflowStatus;
    enrollment_policy: AutomationEnrollmentPolicy;
    trigger_type: string;
    revision: number;
    active_version: number | null;
    runs_last_7_days: number;
    completed_runs: number;
    failed_runs: number;
    last_run_at: string | null;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    workflows: {
        data: WorkflowItem[];
        links: PaginationLink[];
        total: number;
    };
    recipes: Array<{ key: string; name: string; description: string }>;
    filters: { search: string; status: string; trigger: string };
}

const statusStyles: Record<AutomationWorkflowStatus, string> = {
    draft: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    paused: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    archived: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-500',
};

function humanize(value: string): string {
    return value.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function paginationLabel(label: string): string {
    if (label.includes('Previous')) return 'Previous';
    if (label.includes('Next')) return 'Next';
    return label.replace(/&[^;]+;/g, '');
}

export default function AutomationsIndex({ workflows, recipes, filters }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState(filters.search);
    const createForm = useForm({ name: '', recipe: '', enrollment_policy: 'every_event' as AutomationEnrollmentPolicy });

    const create = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createForm.post(route('automations.store'));
    };

    const applySearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(route('automations.index'), { ...filters, search }, { preserveState: true, replace: true });
    };

    const action = (workflow: WorkflowItem, type: 'pause' | 'resume' | 'duplicate' | 'destroy') => {
        if (type === 'destroy') {
            if (!window.confirm(`Archive “${workflow.name}”?`)) return;
            router.delete(route('automations.destroy', workflow.id));
            return;
        }
        router.post(route(`automations.${type}`, workflow.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Automations" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                            <Workflow className="h-6 w-6 text-primary" />
                            Automation Studio
                        </h1>
                        <p className="mt-1 text-muted-foreground">Turn funnel and CRM activity into reliable, observable follow-up.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('automation-runs.index')}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            <Clock3 className="h-4 w-4" />
                            Run history
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowCreate((value) => !value)}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        >
                            <Plus className="h-4 w-4" />
                            New automation
                        </button>
                    </div>
                </header>

                {showCreate && (
                    <section className="rounded-xl border border-primary/30 bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">Start with a recipe or a blank workflow</h2>
                        </div>
                        <form onSubmit={create} className="grid gap-4 lg:grid-cols-[1fr_1fr_220px_auto] lg:items-end">
                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">Name</span>
                                <input
                                    value={createForm.data.name}
                                    onChange={(event) => createForm.setData('name', event.target.value)}
                                    placeholder="New lead follow-up"
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">Recipe</span>
                                <select
                                    value={createForm.data.recipe}
                                    onChange={(event) => createForm.setData('recipe', event.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                >
                                    <option value="">Blank workflow</option>
                                    {recipes.map((recipe) => (
                                        <option key={recipe.key} value={recipe.key}>
                                            {recipe.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">Re-entry</span>
                                <select
                                    value={createForm.data.enrollment_policy}
                                    onChange={(event) => createForm.setData('enrollment_policy', event.target.value as AutomationEnrollmentPolicy)}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                >
                                    <option value="every_event">Every distinct event</option>
                                    <option value="after_completion">After completion</option>
                                    <option value="once_per_contact">Once per contact</option>
                                </select>
                            </label>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
                            >
                                <FilePlus2 className="h-4 w-4" />
                                Create
                            </button>
                        </form>
                        {createForm.errors.recipe && <p className="mt-2 text-sm text-destructive">{createForm.errors.recipe}</p>}
                    </section>
                )}

                <form onSubmit={applySearch} className="flex flex-wrap gap-2">
                    <div className="relative min-w-64 flex-1">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search automations"
                            className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(event) =>
                            router.get(route('automations.index'), { ...filters, status: event.target.value }, { preserveState: true, replace: true })
                        }
                        className="rounded-lg border border-border bg-background px-3 py-2"
                    >
                        <option value="">Active workspace</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="archived">Archived</option>
                    </select>
                    <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                        Search
                    </button>
                </form>

                {workflows.data.length === 0 ? (
                    <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
                        <div>
                            <Workflow className="mx-auto mb-4 h-10 w-10 text-primary" />
                            <h2 className="text-lg font-semibold">Build your first follow-up engine</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                                Start with the new-lead recipe to send a welcome email and remind yourself to follow up.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCreate(true)}
                                className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                            >
                                Choose a recipe
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {workflows.data.map((workflow) => (
                            <article key={workflow.id} className="rounded-xl border border-border bg-card p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={route('automations.edit', workflow.id)}
                                                className="truncate text-lg font-semibold hover:text-primary"
                                            >
                                                {workflow.name}
                                            </Link>
                                            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[workflow.status]}`}>
                                                {humanize(workflow.status)}
                                            </span>
                                            {workflow.active_version && (
                                                <span className="text-xs text-muted-foreground">v{workflow.active_version}</span>
                                            )}
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {workflow.description || 'No description yet.'}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => action(workflow, 'duplicate')}
                                            aria-label={`Duplicate ${workflow.name}`}
                                            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        {workflow.status === 'active' ? (
                                            <button
                                                type="button"
                                                onClick={() => action(workflow, 'pause')}
                                                aria-label={`Pause ${workflow.name}`}
                                                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            >
                                                <Pause className="h-4 w-4" />
                                            </button>
                                        ) : workflow.status === 'paused' && workflow.active_version ? (
                                            <button
                                                type="button"
                                                onClick={() => action(workflow, 'resume')}
                                                aria-label={`Resume ${workflow.name}`}
                                                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            >
                                                <Play className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => action(workflow, 'destroy')}
                                            aria-label={`Archive ${workflow.name}`}
                                            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                                        >
                                            <Archive className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                                    <div className="col-span-3 flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
                                        <p className="text-xs text-muted-foreground">Trigger</p>
                                        <p className="font-medium">{humanize(workflow.trigger_type)}</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">7-day runs</p>
                                        <p className="mt-1 font-semibold">{workflow.runs_last_7_days}</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Completed
                                        </p>
                                        <p className="mt-1 font-semibold">{workflow.completed_runs}</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <XCircle className="h-3 w-3 text-red-500" /> Failed
                                        </p>
                                        <p className="mt-1 font-semibold">{workflow.failed_runs}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {workflows.links.length > 3 && (
                    <nav className="flex flex-wrap justify-center gap-1" aria-label="Automation pagination">
                        {workflows.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                                >
                                    {paginationLabel(link.label)}
                                </Link>
                            ) : null,
                        )}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}
