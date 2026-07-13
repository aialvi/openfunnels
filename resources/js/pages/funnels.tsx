import AppLayout from '@/layouts/app-layout';
import { shareLink } from '@/lib/share';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import gsap from 'gsap';
import { BarChart3, Copy, Edit3, ExternalLink, Eye, Inbox, Plus, Rocket, Share2, Trash2, TrendingUp, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    response_count: number;
    conversion_rate: number | string;
    updated_at: string;
    public_url: string | null;
}

interface FunnelsPageProps {
    funnels: FunnelItem[];
    stats: FunnelStats;
}

export default function Funnels({ funnels, stats }: FunnelsPageProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [copiedFunnelId, setCopiedFunnelId] = useState<number | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.funnel-card',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power3.out',
                },
            );

            gsap.fromTo(
                '.stats-card',
                { opacity: 0, scale: 0.9 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power3.out',
                },
            );
        }, gridRef);

        return () => ctx.revert();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'draft':
                return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'archived':
                return 'bg-muted text-muted-foreground border border-border';
            default:
                return 'bg-muted text-muted-foreground border border-border';
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

    const handleShare = async (funnel: FunnelItem) => {
        if (!funnel.public_url) return;

        const result = await shareLink({
            title: funnel.name,
            text: `View ${funnel.name}`,
            url: funnel.public_url,
        });

        if (result === 'copied') {
            setCopiedFunnelId(funnel.id);
            window.setTimeout(() => setCopiedFunnelId(null), 2000);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funnels" />
            <div ref={gridRef} className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Your Funnels</h1>
                        <p className="text-muted-foreground">Create and manage your marketing funnels</p>
                    </div>
                    <Link
                        href="/funnel-editor"
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Create Funnel
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="stats-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-3/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Funnels</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total_funnels}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-chart-3" />
                        </div>
                    </div>

                    <div className="stats-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-2/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_views)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-chart-2" />
                        </div>
                    </div>

                    <div className="stats-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
                        <div className="absolute inset-0 bg-chart-5/5"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Conversions</p>
                                <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total_conversions)}</p>
                            </div>
                            <Users className="h-8 w-8 text-chart-5" />
                        </div>
                    </div>

                    <div className="stats-card relative overflow-hidden rounded-xl border border-border bg-card p-6">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {funnels.map((funnel) => (
                        <div
                            key={funnel.id}
                            className="funnel-card group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
                        >
                            {/* Funnel Header */}
                            <div className="p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                            {funnel.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Updated {funnel.updated_at}</p>
                                    </div>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(funnel.status)}`}>
                                        {funnel.status}
                                    </span>
                                </div>

                                {/* Funnel Stats */}
                                <div className="mb-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Views</p>
                                        <p className="text-lg font-semibold text-foreground">{formatNumber(funnel.views)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Conversions</p>
                                        <p className="text-lg font-semibold text-foreground">{formatNumber(funnel.conversions)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                                        <p className="text-lg font-semibold text-foreground">{Number(funnel.conversion_rate || 0).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className={`text-sm font-medium ${funnel.is_published ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {funnel.is_published ? 'Live' : 'Draft'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mb-2 flex items-center gap-2">
                                    <Link
                                        href={`/funnel-editor/${funnel.id}`}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('funnel.preview', funnel.id)}
                                        className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </Link>
                                    <button
                                        onClick={() => router.post(route('funnels.duplicate', funnel.id))}
                                        className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
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
                                        className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                                        title="Delete funnel"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                                    <Link
                                        href={route('funnels.responses', funnel.id)}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                                        title="View form responses"
                                    >
                                        <Inbox className="h-4 w-4" />
                                        Responses ({funnel.response_count})
                                    </Link>
                                    <button
                                        onClick={() => router.post(route(funnel.is_published ? 'funnels.unpublish' : 'funnels.publish', funnel.id))}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${funnel.is_published ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                                    >
                                        <Rocket className="h-4 w-4" />
                                        {funnel.is_published ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button
                                        onClick={() => handleShare(funnel)}
                                        disabled={!funnel.public_url}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
                                        title={funnel.public_url ? 'Share public funnel' : 'Publish this funnel before sharing'}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        {copiedFunnelId === funnel.id ? 'Copied' : 'Share'}
                                    </button>
                                    {funnel.public_url && (
                                        <a
                                            href={funnel.public_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center rounded-lg bg-secondary px-3 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
                                            title="Open live funnel"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {funnels.length === 0 && (
                        <div className="col-span-full">
                            <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
                                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium text-foreground">No funnels yet</h3>
                                <p className="mb-6 text-muted-foreground">Get started by creating your first funnel</p>
                                <Link
                                    href="/funnel-editor"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
