import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
            case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Funnels</h1>
                        <p className="text-gray-600 dark:text-gray-400">Create and manage your marketing funnels</p>
                    </div>
                    <Link 
                        href="/funnel-editor" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Funnel
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="stats-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Funnels</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_funnels}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="stats-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.total_views)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <div className="stats-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversions</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.total_conversions)}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>

                    <div className="stats-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Conversion Rate</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(stats.avg_conversion_rate || 0).toFixed(1)}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Funnels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funnels.map((funnel) => (
                        <div 
                            key={funnel.id} 
                            className="funnel-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Funnel Header */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            {funnel.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(funnel.views)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(funnel.conversions)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {Number(funnel.conversion_rate || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                        <p className={`text-sm font-medium ${funnel.is_published ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                            {funnel.is_published ? 'Live' : 'Draft'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <Link 
                                        href={`/funnel-editor/${funnel.id}`}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </button>
                                    <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {funnels.length === 0 && (
                        <div className="col-span-full">
                            <div className="text-center py-12">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No funnels yet</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Get started by creating your first funnel
                                </p>
                                <Link 
                                    href="/funnel-editor" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
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
