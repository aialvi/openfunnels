import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import gsap from 'gsap';
import { BarChart3, Eye, Plus, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        total_funnels: number;
        total_views: number;
        total_conversions: number;
        total_contacts: number;
    };
    recentContacts: Array<{
        id: number;
        email: string;
        name: string | null;
        funnel: string | null;
        last_submitted_at: string | null;
    }>;
    analytics: {
        daily: Array<{ date: string; views: number; conversions: number }>;
        sources: Array<{ source: string; conversions: number }>;
    };
}

function formatNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }

    return value.toString();
}

export default function Dashboard({ stats, recentContacts, analytics }: DashboardProps) {
    const conversionRate = stats.total_views > 0 ? (stats.total_conversions / stats.total_views) * 100 : 0;
    const maxDailyViews = Math.max(1, ...analytics.daily.map((day) => day.views));

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.dashboard-card',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power3.out',
                },
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Quick Stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-1/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Funnels</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total_funnels}</p>
                            </div>
                            <Zap className="h-8 w-8 text-chart-1" />
                        </div>
                    </div>

                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-2/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_views)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-chart-2" />
                        </div>
                    </div>

                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-3/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_conversions)}</p>
                            </div>
                            <Users className="h-8 w-8 text-chart-3" />
                        </div>
                    </div>

                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-4/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_contacts)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-chart-4" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Quick Actions */}
                    <div className="dashboard-card rounded-xl border border-border bg-card p-6">
                        <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href="/funnel-editor"
                                className="group flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="mr-3 rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Create New Funnel</p>
                                    <p className="text-sm text-muted-foreground">Start building with our drag-and-drop editor</p>
                                </div>
                            </Link>

                            <Link
                                href="/funnels"
                                className="group flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="mr-3 rounded-lg bg-chart-2/10 p-2 transition-colors group-hover:bg-chart-2/20">
                                    <Zap className="h-5 w-5 text-chart-2" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">View All Funnels</p>
                                    <p className="text-sm text-muted-foreground">Manage your existing funnels</p>
                                </div>
                            </Link>

                            <Link
                                href="/contacts"
                                className="group flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="mr-3 rounded-lg bg-chart-3/10 p-2 transition-colors group-hover:bg-chart-3/20">
                                    <Users className="h-5 w-5 text-chart-3" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Review Captured Leads</p>
                                    <p className="text-sm text-muted-foreground">Follow up with contacts from funnel forms</p>
                                </div>
                            </Link>

                            <div className="group flex cursor-pointer items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                                <div className="mr-3 rounded-lg bg-chart-3/10 p-2 transition-colors group-hover:bg-chart-3/20">
                                    <BarChart3 className="h-5 w-5 text-chart-3" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Analytics Overview</p>
                                    <p className="text-sm text-muted-foreground">View detailed performance metrics</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Contacts */}
                    <div className="dashboard-card rounded-xl border border-border bg-card p-6">
                        <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Contacts</h3>
                        <div className="space-y-3">
                            {recentContacts.map((contact) => (
                                <div key={contact.id} className="flex items-center rounded-lg bg-muted/50 p-3">
                                    <div className="mr-3 rounded-lg bg-chart-3/10 p-2">
                                        <Users className="h-4 w-4 text-chart-3" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-foreground">{contact.name || contact.email}</p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {contact.funnel || 'Unknown funnel'} | {contact.last_submitted_at || 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {recentContacts.length === 0 && (
                                <div className="rounded-lg bg-muted/50 p-6 text-center">
                                    <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                    <p className="font-medium text-foreground">No contacts captured yet</p>
                                    <p className="text-sm text-muted-foreground">Add a form block to a published funnel.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-card grid gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Last 14 days</h3>
                                <p className="text-sm text-muted-foreground">Views and attributed conversions</p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                {conversionRate.toFixed(1)}% overall
                            </span>
                        </div>
                        <div className="flex h-56 items-end gap-2 border-b border-border">
                            {analytics.daily.map((day) => (
                                <div
                                    key={day.date}
                                    className="group flex h-full min-w-0 flex-1 items-end gap-0.5"
                                    title={`${day.date}: ${day.views} views, ${day.conversions} conversions`}
                                >
                                    <div
                                        className="min-h-1 flex-1 rounded-t bg-chart-2/70 transition-colors group-hover:bg-chart-2"
                                        style={{ height: `${Math.max(2, (day.views / maxDailyViews) * 100)}%` }}
                                    />
                                    <div
                                        className="min-h-1 flex-1 rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                                        style={{ height: `${Math.max(2, (day.conversions / maxDailyViews) * 100)}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border-border lg:border-l lg:pl-6">
                        <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Top conversion sources</h3>
                        <div className="space-y-3">
                            {analytics.sources.map((source) => (
                                <div key={source.source} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                                    <span className="truncate text-sm font-medium text-foreground">{source.source}</span>
                                    <span className="text-sm text-muted-foreground tabular-nums">{source.conversions}</span>
                                </div>
                            ))}
                            {analytics.sources.length === 0 && <p className="text-sm text-muted-foreground">No attributed conversions yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
