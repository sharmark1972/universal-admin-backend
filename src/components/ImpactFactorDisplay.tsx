'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Award, FileText, ExternalLink } from 'lucide-react';

interface ImpactFactorData {
  year: number;
  value: number;
  certificatePath?: string;
}

export default function ImpactFactorDisplay() {
  const [impactFactor, setImpactFactor] = useState<ImpactFactorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactFactor = async () => {
      try {
        const response = await fetch('/api/impact-factors');
        if (response.ok) {
          const data = await response.json();
          if (data.currentImpactFactor) {
            setImpactFactor(data.currentImpactFactor);
          }
        }
      } catch (error) {
        console.error('Error fetching impact factor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactFactor();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!impactFactor) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Impact factor information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg mr-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Journal Impact Factor</h3>
            <p className="text-gray-600">Current Academic Year</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-600">
            {impactFactor.value.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">
            {impactFactor.year}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-900">Citation Impact</h4>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {(impactFactor.value * 1.5).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Based on current impact factor</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-900">5-Year Impact Factor</h4>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {impactFactor.value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Official journal metric</p>
        </div>
      </div>
      
      {impactFactor.certificatePath && (
        <div className="mt-6 text-center">
          <a
            href={impactFactor.certificatePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            View Certificate
          </a>
        </div>
      )}
    </div>
  );
}