import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ExternalLink, FileText, Filter, Inbox, Mail, Phone, RotateCcw, Search, UserRound, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface Lead {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
}

interface FunnelResponse {
    id: number;
    form_id: string | null;
    fields: Record<string, unknown>;
    source: string;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    contact: Lead;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FunnelResponsesProps {
    funnel: {
        id: number;
        name: string;
        slug: string;
        is_published: boolean;
    };
    responses: {
        data: FunnelResponse[];
        links: PaginationLink[];
        total: number;
        from: number | null;
        to: number | null;
    };
    stats: {
        total_responses: number;
        unique_leads: number;
        responses_today: number;
    };
    filters: ResponseFilters;
    filterOptions: {
        statuses: string[];
        forms: string[];
    };
}

interface ResponseFilters {
    search: string;
    status: string;
    form_id: string;
    date_from: string;
    date_to: string;
}

const statusStyles: Record<string, string> = {
    new: 'border-sky-500/20 bg-sky-500/10 text-sky-500',
    contacted: 'border-violet-500/20 bg-violet-500/10 text-violet-500',
    qualified: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
    won: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    lost: 'border-red-500/20 bg-red-500/10 text-red-500',
};

function fieldLabel(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (character) => character.toUpperCase());
}

function fieldValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return JSON.stringify(value);
}

export default function FunnelResponses({ funnel, responses, stats, filters, filterOptions }: FunnelResponsesProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Funnels', href: '/funnels' },
        { title: funnel.name, href: `/funnel-editor/${funnel.id}` },
        { title: 'Responses', href: route('funnels.responses', funnel.id) },
    ];
    const [form, setForm] = useState<ResponseFilters>(filters);

    const updateFilter = (key: keyof ResponseFilters, value: string) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            route('funnels.responses', funnel.id),
            {
                search: form.search,
                status: form.status,
                form_id: form.form_id,
                date_from: form.date_from,
                date_to: form.date_to,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearFilters = () => {
        const emptyFilters: ResponseFilters = { search: '', status: '', form_id: '', date_from: '', date_to: '' };
        setForm(emptyFilters);
        router.get(route('funnels.responses', funnel.id), {}, { preserveState: false, replace: true });
    };

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${funnel.name} Responses`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/funnels" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold text-foreground">Responses</h1>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${funnel.is_published ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'}`}
                                >
                                    {funnel.is_published ? 'Live' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-muted-foreground">Every submission captured by {funnel.name}</p>
                        </div>
                    </div>
                    <Link
                        href={`/funnel-editor/${funnel.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        <FileText className="h-4 w-4" />
                        Edit funnel
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total responses</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total_responses}</p>
                            </div>
                            <Inbox className="h-7 w-7 text-chart-1" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Unique leads</p>
                                <p className="text-2xl font-bold text-foreground">{stats.unique_leads}</p>
                            </div>
                            <Users className="h-7 w-7 text-chart-2" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Responses today</p>
                                <p className="text-2xl font-bold text-foreground">{stats.responses_today}</p>
                            </div>
                            <CalendarDays className="h-7 w-7 text-chart-3" />
                        </div>
                    </div>
                </div>

                <form onSubmit={applyFilters} className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Filter className="h-4 w-4" /> Filter responses
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_1fr_1fr_1fr_1fr_auto]">
                        <label className="relative">
                            <span className="sr-only">Search leads</span>
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={form.search}
                                onChange={(event) => updateFilter('search', event.target.value)}
                                placeholder="Name, email, or phone"
                                className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground"
                            />
                        </label>
                        <select
                            value={form.status}
                            onChange={(event) => updateFilter('status', event.target.value)}
                            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        >
                            <option value="">All statuses</option>
                            {filterOptions.statuses.map((status) => (
                                <option key={status} value={status}>
                                    {fieldLabel(status)}
                                </option>
                            ))}
                        </select>
                        <select
                            value={form.form_id}
                            onChange={(event) => updateFilter('form_id', event.target.value)}
                            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        >
                            <option value="">All forms</option>
                            {filterOptions.forms.map((formId) => (
                                <option key={formId} value={formId}>
                                    {fieldLabel(formId)}
                                </option>
                            ))}
                        </select>
                        <label>
                            <span className="sr-only">From date</span>
                            <input
                                type="date"
                                value={form.date_from}
                                onChange={(event) => updateFilter('date_from', event.target.value)}
                                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            />
                        </label>
                        <label>
                            <span className="sr-only">To date</span>
                            <input
                                type="date"
                                value={form.date_to}
                                onChange={(event) => updateFilter('date_to', event.target.value)}
                                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            />
                        </label>
                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Apply
                        </button>
                    </div>
                    {(hasFilters || Object.values(form).some(Boolean)) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Clear filters
                        </button>
                    )}
                </form>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            {responses.total === 0 ? 'No matching responses' : `Showing ${responses.from}–${responses.to} of ${responses.total}`}
                        </span>
                    </div>
                    {responses.data.map((response) => {
                        const initials = (response.contact.name || response.contact.email).slice(0, 2).toUpperCase();
                        const fields = Object.entries(response.fields);

                        return (
                            <article key={response.id} className="overflow-hidden rounded-xl border border-border bg-card">
                                <div className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-start">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={route('contacts.show', response.contact.id)}
                                                    className="font-semibold text-foreground hover:text-primary"
                                                >
                                                    {response.contact.name || response.contact.email}
                                                </Link>
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[response.contact.status] || 'border-border bg-muted text-muted-foreground'}`}
                                                >
                                                    {fieldLabel(response.contact.status)}
                                                </span>
                                                {response.form_id && (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                        {fieldLabel(response.form_id)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <span className="inline-flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {response.contact.email}
                                                </span>
                                                {response.contact.phone && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {response.contact.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-sm text-muted-foreground">{response.created_at}</div>
                                </div>
                                <div className="p-5">
                                    {fields.length > 0 ? (
                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            {fields.map(([key, value]) => (
                                                <div key={key} className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
                                                    <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                        {fieldLabel(key)}
                                                    </div>
                                                    <div className="mt-1 text-sm break-words text-foreground">{fieldValue(value)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <UserRound className="h-4 w-4" />
                                            This response only included the lead's contact details.
                                        </div>
                                    )}
                                    {(response.url || response.ip_address || response.user_agent) && (
                                        <details className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                                            <summary className="cursor-pointer font-medium select-none hover:text-foreground">
                                                Submission details
                                            </summary>
                                            <div className="mt-3 space-y-1 break-all">
                                                {response.url && (
                                                    <div className="flex items-start gap-1.5">
                                                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                                                        <span>{response.url}</span>
                                                    </div>
                                                )}
                                                {response.ip_address && <div>IP: {response.ip_address}</div>}
                                                {response.user_agent && <div>Browser: {response.user_agent}</div>}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            </article>
                        );
                    })}

                    {responses.data.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed border-border px-5 py-14 text-center">
                            <Inbox className="mx-auto mb-4 h-11 w-11 text-muted-foreground/60" />
                            <h2 className="font-semibold text-foreground">{hasFilters ? 'No responses match these filters' : 'No responses yet'}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {hasFilters
                                    ? 'Clear or adjust the filters to see more results.'
                                    : 'New funnel form submissions will appear here automatically.'}
                            </p>
                        </div>
                    )}

                    {responses.links.length > 3 && (
                        <nav aria-label="Response pages" className="flex flex-wrap items-center justify-center gap-1 pt-2">
                            {responses.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Link>
                                ) : (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className="cursor-not-allowed rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground/40"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </nav>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
