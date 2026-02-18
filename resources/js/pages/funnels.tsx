import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
    Plus,
    Edit3,
    Eye,
    Copy,
    Trash2,
    BarChart3,
    Users,
    TrendingUp
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Funnels',
        href: '/funnels',
    },
];

interface FunnelStats {
    total_funnels: number;
    total_views: number;
    total_conversions: number;
    avg_conversion_rate: number | string;
}

interface FunnelItem {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    is_published: boolean;
    views: number;
    conversions: number;
    conversion_rate: number | string;
    updated_at: string;
}

interface FunnelsPageProps {
    funnels: FunnelItem[];
    stats: FunnelStats;
}

export default function Funnels({ funnels, stats }: FunnelsPageProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.funnel-card',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power3.out'
                }
            );

            gsap.fromTo('.stats-card',
                { opacity: 0, scale: 0.9 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power3.out'
                }
            );
        }, gridRef);

        return () => ctx.revert();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'draft': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'archived': return 'bg-muted text-muted-foreground border border-border';
            default: return 'bg-muted text-muted-foreground border border-border';
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funnels" />
            <div ref={gridRef} className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Your Funnels</h1>
                        <p className="text-muted-foreground">Create and manage your marketing funnels</p>
                    </div>
                    <Link
                        href="/funnel-editor"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Funnel
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="stats-card bg-card rounded-xl p-6 border border-border relative overflow-hidden">
                        <div className="absolute inset-0 bg-chart-3/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Funnels</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total_funnels}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-chart-3" />
                        </div>
                    </div>

                    <div className="stats-card bg-card rounded-xl p-6 border border-border relative overflow-hidden">
                        <div className="absolute inset-0 bg-chart-2/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_views)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-chart-2" />
                        </div>
                    </div>

                    <div className="stats-card bg-card rounded-xl p-6 border border-border relative overflow-hidden">
                        <div className="absolute inset-0 bg-chart-5/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Conversions</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_conversions)}</p>
                            </div>
                            <Users className="h-8 w-8 text-chart-5" />
                        </div>
                    </div>

                    <div className="stats-card bg-card rounded-xl p-6 border border-border relative overflow-hidden">
                        <div className="absolute inset-0 bg-chart-1/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg. Conversion Rate</p>
                                <p className="text-2xl font-bold text-foreground">{Number(stats.avg_conversion_rate || 0).toFixed(1)}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-chart-1" />
                        </div>
                    </div>
                </div>

                {/* Funnels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funnels.map((funnel) => (
                        <div
                            key={funnel.id}
                            className="funnel-card bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
                        >
                            {/* Funnel Header */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                            {funnel.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Updated {funnel.updated_at}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(funnel.status)}`}>
                                        {funnel.status}
                                    </span>
                                </div>

                                {/* Funnel Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Views</p>
                                        <p className="text-lg font-semibold text-foreground">
                                            {formatNumber(funnel.views)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Conversions</p>
                                        <p className="text-lg font-semibold text-foreground">
                                            {formatNumber(funnel.conversions)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                                        <p className="text-lg font-semibold text-foreground">
                                            {Number(funnel.conversion_rate || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className={`text-sm font-medium ${funnel.is_published ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {funnel.is_published ? 'Live' : 'Draft'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/funnel-editor/${funnel.id}`}
                                        className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('funnel.preview', funnel.id)}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </Link>
                                    <button
                                        onClick={() => router.post(route('funnels.duplicate', funnel.id))}
                                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        title="Duplicate funnel"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete "${funnel.name}"? This cannot be undone.`)) {
                                                router.delete(route('funnels.destroy', funnel.id));
                                            }
                                        }}
                                        className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-destructive/20"
                                        title="Delete funnel"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {funnels.length === 0 && (
                        <div className="col-span-full">
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">No funnels yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Get started by creating your first funnel
                                </p>
                                <Link
                                    href="/funnel-editor"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Your First Funnel
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
