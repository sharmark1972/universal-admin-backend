'use client';

import { useState, useEffect } from 'react';
// Removed unused UI component imports
import { Globe, Users, TrendingUp, MapPin, Calendar, BarChart3, Eye } from 'lucide-react';
import { getVisitorAnalytics } from '@/hooks/useVisitorTracking';

interface VisitorData {
  totalVisitors: number;
  countryStats: Array<{
    country: string;
    countryCode: string;
    count: number;
  }>;
  pageStats: Array<{
    page: string;
    count: number;
  }>;
}

export default function VisitorAnalytics() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d'>('30d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const analytics = await getVisitorAnalytics(timeframe);
        console.log('Visitor analytics data:', analytics);
        setData(analytics);
      } catch (error) {
        console.error('Failed to fetch visitor analytics:', error);
        // Set some default data for display
        setData({
          totalVisitors: 0,
          countryStats: [],
          pageStats: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode) return '🌍';
    return String.fromCodePoint(
      ...[...countryCode.toUpperCase()].map(char => 127397 + char.charCodeAt(0))
    );
  };

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '1d': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      default: return 'Last 7 Days';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="text-center py-8 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No visitor data available</p>
          <p className="text-sm">Visitor tracking is being initialized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Global Visitors</h3>
            <p className="text-gray-600 text-sm">Real-time analytics</p>
          </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['1d', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tf === '1d' ? '24h' : tf === '7d' ? '7d' : '30d'}
            </button>
          ))}
        </div>
      </div>

      {/* Total Visitors */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-600">
            {getTimeframeLabel(timeframe)}
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {data.totalVisitors.toLocaleString()}
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Active tracking</span>
        </div>
      </div>

      {/* Top Countries */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">Top Countries</span>
        </div>
        
        {data.countryStats.length > 0 ? (
          <div className="space-y-3">
            {data.countryStats.slice(0, 5).map((country, index) => {
              const percentage = data.totalVisitors > 0 
                ? (country.count / data.totalVisitors) * 100 
                : 0;
              
              return (
                <div key={`${country.countryCode}-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getCountryFlag(country.countryCode)}
                    </span>
                    <span className="font-medium text-gray-700">
                      {country.country || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-8 text-right">
                      {country.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No visitor data available yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Visitor tracking helps us understand our global reach
        </p>
      </div>
    </div>
  );
}