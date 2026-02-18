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

export default function Dashboard() {
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
                                <p className="text-2xl font-bold text-foreground">12</p>
                            </div>
                            <Zap className="h-8 w-8 text-chart-1" />
                        </div>
                    </div>

                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-2/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold text-foreground">24.3K</p>
                            </div>
                            <Eye className="h-8 w-8 text-chart-2" />
                        </div>
                    </div>

                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-3/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                                <p className="text-2xl font-bold text-foreground">1.8K</p>
                            </div>
                            <Users className="h-8 w-8 text-chart-3" />
                        </div>
                    </div>

                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-4/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                                <p className="text-2xl font-bold text-foreground">7.4%</p>
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

                    {/* Recent Activity */}
                    <div className="dashboard-card rounded-xl border border-border bg-card p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                    <Plus className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">Created "Product Launch Funnel"</p>
                                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                <div className="bg-chart-2/10 p-2 rounded-lg mr-3">
                                    <Eye className="h-4 w-4 text-chart-2" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">Updated "Lead Magnet Landing Page"</p>
                                    <p className="text-sm text-muted-foreground">5 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                <div className="bg-chart-3/10 p-2 rounded-lg mr-3">
                                    <BarChart3 className="h-4 w-4 text-chart-3" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">Generated analytics report</p>
                                    <p className="text-sm text-muted-foreground">1 day ago</p>
                                </div>
                            </div>
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
                                <p className="text-muted-foreground">Analytics chart coming soon</p>
                                <p className="text-sm text-muted-foreground/70">Track funnel performance over time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
