import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock, Mail, MessageSquare, Phone, Send, UserRound } from 'lucide-react';

interface ContactSubmission {
    id: number;
    form_id: string | null;
    fields: Record<string, unknown>;
    source: string;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    funnel: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

interface ContactDetailProps {
    contact: {
        id: number;
        email: string;
        name: string | null;
        phone: string | null;
        status: string;
        source: string;
        tags: string[];
        metadata: Record<string, unknown>;
        notes: Array<{
            id: string;
            body: string;
            created_at: string;
        }>;
        funnel: {
            id: number;
            name: string;
            slug: string;
        } | null;
        ip_address: string | null;
        user_agent: string | null;
        last_submitted_at: string | null;
        created_at: string;
        updated_at: string;
        submissions: ContactSubmission[];
    };
    statusOptions: string[];
}

export default function ContactDetail({ contact, statusOptions }: ContactDetailProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Contacts', href: '/contacts' },
        { title: contact.name || contact.email, href: `/contacts/${contact.id}` },
    ];

    const noteForm = useForm({
        note: '',
    });

    const updateStatus = (status: string) => {
        router.patch(route('contacts.update', contact.id), { status }, { preserveScroll: true });
    };

    const addNote = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        noteForm.post(route('contacts.notes.store', contact.id), {
            preserveScroll: true,
            onSuccess: () => noteForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${contact.name || contact.email} - Contact`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/contacts" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{contact.name || contact.email}</h1>
                            <p className="text-muted-foreground">Captured from {contact.funnel?.name || contact.source}</p>
                        </div>
                    </div>
                    <select
                        value={contact.status}
                        onChange={(event) => updateStatus(event.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card p-5">
                            <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <UserRound className="h-4 w-4" />
                                Profile
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-foreground">{contact.email}</span>
                                </div>
                                {contact.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-foreground">{contact.phone}</span>
                                    </div>
                                )}
                                <div className="border-t border-border pt-3">
                                    <div className="text-muted-foreground">Source</div>
                                    <div className="text-foreground">{contact.source}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Last submitted</div>
                                    <div className="text-foreground">{contact.last_submitted_at || 'Not available'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">IP address</div>
                                    <div className="text-foreground">{contact.ip_address || 'Not available'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-5">
                            <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <MessageSquare className="h-4 w-4" />
                                Notes
                            </h2>
                            <form onSubmit={addNote} className="space-y-3">
                                <textarea
                                    value={noteForm.data.note}
                                    onChange={(event) => noteForm.setData('note', event.target.value)}
                                    placeholder="Add a follow-up note..."
                                    className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                                />
                                <button
                                    type="submit"
                                    disabled={noteForm.processing || !noteForm.data.note.trim()}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                    Add note
                                </button>
                            </form>

                            <div className="mt-5 space-y-3">
                                {contact.notes.map((note) => (
                                    <div key={note.id} className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-sm text-foreground">{note.body}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</p>
                                    </div>
                                ))}
                                {contact.notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <Clock className="h-4 w-4" />
                                Submission Timeline
                            </h2>
                        </div>
                        <div className="divide-y divide-border">
                            {contact.submissions.map((submission) => (
                                <div key={submission.id} className="p-5">
                                    <div className="mb-3 flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-medium text-foreground">{submission.funnel?.name || 'Unknown funnel'}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {submission.source} {submission.form_id ? `| ${submission.form_id}` : ''}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{submission.created_at}</div>
                                    </div>
                                    <div className="grid gap-2 text-sm md:grid-cols-2">
                                        {Object.entries(submission.fields).map(([key, value]) => (
                                            <div key={key} className="rounded-lg bg-muted/40 px-3 py-2">
                                                <div className="text-xs text-muted-foreground">{key}</div>
                                                <div className="break-words text-foreground">{String(value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {submission.url && <div className="mt-3 break-all text-xs text-muted-foreground">{submission.url}</div>}
                                </div>
                            ))}
                            {contact.submissions.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No submissions recorded.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
