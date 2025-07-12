import React from 'react';
import { BarChart3, TrendingUp, Users, MousePointer } from 'lucide-react';
import { Funnel } from '@/stores/funnelStore';

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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Analytics Preview</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Demo Data</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Views</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{mockAnalytics.views.toLocaleString()}</div>
                </div>
                
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                        <MousePointer className="w-4 h-4 text-gray-500" />
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
                    <span className="text-sm text-gray-600">Blocks Count</span>
                    <div className="text-right">
                        <div className="font-semibold text-gray-900">{funnel.content.length}</div>
                        <div className="text-xs text-gray-500">
                            {funnel.content.length === 0 ? 'Add blocks' : 
                             funnel.content.length < 3 ? 'Consider more content' : 
                             'Good content density'}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics will be available after publishing</span>
                </div>
            </div>
        </div>
    );
}
