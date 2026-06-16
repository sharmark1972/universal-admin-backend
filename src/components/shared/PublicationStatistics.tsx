'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, FileText, TrendingUp } from 'lucide-react';

interface PublicationStats {
  totalPublishedIssues: number;
  totalResearchPapers: number;
  publicationYears: number[];
  papersPerYear: Record<number, number>;
  issuesPerYear: Record<number, number>;
}

export default function PublicationStatistics() {
  const [stats, setStats] = useState<PublicationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicationStats();
  }, []);

  const fetchPublicationStats = async () => {
    try {
      const response = await fetch('/api/publication-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching publication stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-8 animate-pulse border border-slate-200">
                <div className="h-16 bg-slate-100 rounded-full w-16 mx-auto mb-4"></div>
                <div className="h-8 bg-slate-100 rounded w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const yearRange = stats.publicationYears.length > 0
    ? `${Math.min(...stats.publicationYears)}-${Math.max(...stats.publicationYears)}`
    : 'N/A';

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Publication Statistics
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our track record of consistent academic contributions.
          </p>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-blue-700" />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {stats.totalPublishedIssues.toLocaleString()}
            </div>
            <div className="text-slate-600 font-medium">Total Issues</div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
              <FileText className="w-8 h-8 text-green-700" />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {stats.totalResearchPapers.toLocaleString()}
            </div>
            <div className="text-slate-600 font-medium">Research Papers</div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-6">
              <Calendar className="w-8 h-8 text-purple-700" />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {yearRange}
            </div>
            <div className="text-slate-600 font-medium">Publication Years</div>
          </div>
        </div>

        {/* Year-wise Statistics */}
        {stats.publicationYears.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center font-serif">
              Yearly Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.publicationYears.map((year) => (
                <div
                  key={year}
                  className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100 hover:border-slate-300 transition-colors"
                >
                  <div className="text-2xl font-bold text-slate-800 mb-2">
                    {year}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-600">
                      <span className="font-semibold">{stats.papersPerYear[year] || 0}</span> papers
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold">{stats.issuesPerYear[year] || 0}</span> issues
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
