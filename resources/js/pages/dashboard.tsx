import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Zap, Eye, BarChart3, Users, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import gsap from 'gsap';

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

export default function Dashboard({ stats, recentContacts }: DashboardProps) {
    const conversionRate = stats.total_views > 0 ? (stats.total_conversions / stats.total_views) * 100 : 0;

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.dashboard-card',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power3.out'
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
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
                        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href="/funnel-editor"
                                className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                            >
                                <div className="bg-primary/10 p-2 rounded-lg mr-3 group-hover:bg-primary/20 transition-colors">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Create New Funnel</p>
                                    <p className="text-sm text-muted-foreground">Start building with our drag-and-drop editor</p>
                                </div>
                            </Link>

                            <Link
                                href="/funnels"
                                className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                            >
                                <div className="bg-chart-2/10 p-2 rounded-lg mr-3 group-hover:bg-chart-2/20 transition-colors">
                                    <Zap className="h-5 w-5 text-chart-2" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">View All Funnels</p>
                                    <p className="text-sm text-muted-foreground">Manage your existing funnels</p>
                                </div>
                            </Link>

                            <Link
                                href="/contacts"
                                className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                            >
                                <div className="bg-chart-3/10 p-2 rounded-lg mr-3 group-hover:bg-chart-3/20 transition-colors">
                                    <Users className="h-5 w-5 text-chart-3" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Review Captured Leads</p>
                                    <p className="text-sm text-muted-foreground">Follow up with contacts from funnel forms</p>
                                </div>
                            </Link>

                            <div className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group cursor-pointer">
                                <div className="bg-chart-3/10 p-2 rounded-lg mr-3 group-hover:bg-chart-3/20 transition-colors">
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
                        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Contacts</h3>
                        <div className="space-y-3">
                            {recentContacts.map((contact) => (
                                <div key={contact.id} className="flex items-center p-3 rounded-lg bg-muted/50">
                                    <div className="bg-chart-3/10 p-2 rounded-lg mr-3">
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

                {/* Performance Chart Placeholder */}
                <div className="dashboard-card relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-border md:min-h-min bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Performance Overview</h3>
                    <div className="relative h-full">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-muted-foreground/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-muted-foreground">Conversion rate: {conversionRate.toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground/70">Time-series analytics and attribution are planned.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
