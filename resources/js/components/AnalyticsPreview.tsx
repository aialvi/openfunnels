import { Funnel } from '@/stores/funnelStore';
import { BarChart3, MousePointer, TrendingUp, Users } from 'lucide-react';

interface AnalyticsPreviewProps {
    funnel: Funnel;
}

export default function AnalyticsPreview({ funnel }: AnalyticsPreviewProps) {
    // Mock analytics data - in real app this would come from actual analytics
    const mockAnalytics = {
        views: Math.floor(Math.random() * 1000) + 100,
        conversions: Math.floor(Math.random() * 50) + 10,
        conversionRate: (Math.random() * 10 + 2).toFixed(1),
        bounceRate: (Math.random() * 30 + 40).toFixed(1),
    };

    const getPerformanceColor = (rate: number) => {
        if (rate >= 8) return 'text-green-600';
        if (rate >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceLabel = (rate: number) => {
        if (rate >= 8) return 'Excellent';
        if (rate >= 5) return 'Good';
        return 'Needs improvement';
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Analytics Preview</h3>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">Demo Data</span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="mb-1 flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Views</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{mockAnalytics.views.toLocaleString()}</div>
                </div>

                <div className="text-center">
                    <div className="mb-1 flex items-center justify-center space-x-1">
                        <MousePointer className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Conversions</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{mockAnalytics.conversions}</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(parseFloat(mockAnalytics.conversionRate))}`}>
                            {mockAnalytics.conversionRate}%
                        </div>
                        <div className={`text-xs ${getPerformanceColor(parseFloat(mockAnalytics.conversionRate))}`}>
                            {getPerformanceLabel(parseFloat(mockAnalytics.conversionRate))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <div className="text-right">
                        <div className="font-semibold text-gray-900">{mockAnalytics.bounceRate}%</div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sections Count</span>
                    <div className="text-right">
                        <div className="font-semibold text-gray-900">{funnel.content.sections?.length || 0}</div>
                        <div className="text-xs text-gray-500">
                            {!funnel.content.sections || funnel.content.sections.length === 0
                                ? 'Add sections'
                                : funnel.content.sections.length < 3
                                  ? 'Consider more content'
                                  : 'Good content density'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>Analytics will be available after publishing</span>
                </div>
            </div>
        </div>
    );
}
