import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Mail, Phone, Plus, UserRound, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contacts',
        href: '/contacts',
    },
];

interface ContactItem {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    status: string;
    source: string;
    funnel: {
        id: number;
        name: string;
        slug: string;
    } | null;
    submission_count: number;
    last_submitted_at: string | null;
    created_at: string;
}

interface PaginatedContacts {
    data: ContactItem[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ContactsPageProps {
    contacts: PaginatedContacts;
    stats: {
        total_contacts: number;
        new_contacts: number;
        captured_today: number;
    };
}

export default function Contacts({ contacts, stats }: ContactsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
                        <p className="text-muted-foreground">Leads captured from your funnel forms</p>
                    </div>
                    <Link
                        href="/funnel-editor"
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Create Capture Funnel
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Contacts</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total_contacts}</p>
                            </div>
                            <Users className="h-7 w-7 text-chart-1" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">New Contacts</p>
                                <p className="text-2xl font-bold text-foreground">{stats.new_contacts}</p>
                            </div>
                            <UserRound className="h-7 w-7 text-chart-2" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Captured Today</p>
                                <p className="text-2xl font-bold text-foreground">{stats.captured_today}</p>
                            </div>
                            <Mail className="h-7 w-7 text-chart-3" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="grid grid-cols-[minmax(220px,1.3fr)_minmax(160px,1fr)_120px_160px] gap-4 border-b border-border px-5 py-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <div>Contact</div>
                        <div>Funnel</div>
                        <div>Status</div>
                        <div>Last Activity</div>
                    </div>

                    {contacts.data.map((contact) => (
                        <div
                            key={contact.id}
                            className="grid grid-cols-[minmax(220px,1.3fr)_minmax(160px,1fr)_120px_160px] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
                        >
                            <div className="min-w-0">
                                <Link href={route('contacts.show', contact.id)} className="truncate font-medium text-foreground hover:text-primary">
                                    {contact.name || contact.email}
                                </Link>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" />
                                        {contact.email}
                                    </span>
                                    {contact.phone && (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            {contact.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="min-w-0 text-sm text-muted-foreground">
                                {contact.funnel ? (
                                    <Link href={`/funnel-editor/${contact.funnel.id}`} className="truncate text-foreground hover:text-primary">
                                        {contact.funnel.name}
                                    </Link>
                                ) : (
                                    'Unknown funnel'
                                )}
                                <div>
                                    {contact.submission_count} submission{contact.submission_count === 1 ? '' : 's'}
                                </div>
                            </div>
                            <div>
                                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                                    {contact.status}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">{contact.last_submitted_at || contact.created_at}</div>
                        </div>
                    ))}

                    {contacts.data.length === 0 && (
                        <div className="px-5 py-14 text-center">
                            <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground/60" />
                            <h3 className="mb-1 font-medium text-foreground">No contacts yet</h3>
                            <p className="text-sm text-muted-foreground">Publish a funnel with a form block to start capturing leads.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
