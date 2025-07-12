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
                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Funnels</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">12</p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    
                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Views</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">24.3K</p>
                            </div>
                            <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    
                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Conversions</p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">1.8K</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    
                    <div className="dashboard-card relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Conversion Rate</p>
                                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">7.4%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Quick Actions */}
                    <div className="dashboard-card rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link 
                                href="/funnel-editor" 
                                className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Create New Funnel</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Start building with our drag-and-drop editor</p>
                                </div>
                            </Link>
                            
                            <Link 
                                href="/funnels" 
                                className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">View All Funnels</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your existing funnels</p>
                                </div>
                            </Link>
                            
                            <div className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer">
                                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Analytics Overview</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">View detailed performance metrics</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="dashboard-card rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">Created "Product Launch Funnel"</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                                    <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">Updated "Lead Magnet Landing Page"</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">5 hours ago</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                                    <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">Generated analytics report</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="dashboard-card relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h3>
                    <div className="relative h-full">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-400">Analytics chart coming soon</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Track funnel performance over time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
