'use client';

import { useEffect, useState } from 'react';
import { Users, Building, ExternalLink, AlertCircle, RefreshCw, Crown } from 'lucide-react';
import Image from 'next/image';

interface ChiefPatron {
  id: string;
  name: string;
  title: string;
  institution?: string;
  image_url?: string;
  bio?: string;
  display_order: number;
  is_active: boolean;
}

interface PatronCardProps {
  patron: ChiefPatron;
  index: number;
}

const PatronCard: React.FC<PatronCardProps> = ({ patron, index }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div
      className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up"
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          {patron.image_url && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center border-3 border-blue-200 animate-pulse">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src={patron.image_url}
                alt={patron.name}
                fill
                className={`rounded-full object-cover border-3 border-blue-300 group-hover:border-blue-500 transition-all duration-300 shadow-md ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-3 border-blue-300 group-hover:border-blue-500 transition-colors shadow-md">
              <Crown className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        
        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
          {patron.name}
        </h4>
        
        <p className="text-blue-700 text-sm font-semibold mb-1">
          {patron.title}
        </p>
        
        <p className="text-gray-600 text-xs mb-3 font-medium">
          {patron.institution}
        </p>
        
        {patron.bio && (
          <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
            {patron.bio}
          </p>
        )}
      </div>
    </div>
  );
};

interface ErrorState {
  hasError: boolean;
  message: string;
}

interface ChiefPatronsProps {
  className?: string;
}

export default function ChiefPatrons({ className = '' }: ChiefPatronsProps) {
  const [patrons, setPatrons] = useState<ChiefPatron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchChiefPatrons();
  }, [retryCount]);

  const fetchChiefPatrons = async () => {
    try {
      setLoading(true);
      setError({ hasError: false, message: '' });
      
      const response = await fetch('/api/admin/chief-patrons');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chief patrons: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      setPatrons(data.chiefPatrons || []);
    } catch (err) {
      console.error('Error fetching chief patrons:', err);
      setError({
        hasError: true,
        message: err instanceof Error ? err.message : 'Failed to load chief patrons'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className={`animate-fade-in-up ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading chief patrons...</p>
        </div>
      </div>
    );
  }

  if (error.hasError) {
    return (
      <div className={`animate-fade-in-up ${className}`}>
        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-medium mb-2">Failed to load chief patrons</p>
          <p className="text-red-600 text-sm mb-4">{error.message}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (patrons.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-4 border border-blue-300">
          <Crown className="w-4 h-4 mr-2 text-yellow-600" />
          Chief Patrons
        </div>
        <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-3">
          Distinguished Leadership
        </h3>
        <p className="text-gray-600 text-sm lg:text-base font-medium">
          Honoring the visionary leaders who guide our mission
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto lg:max-w-none">
        {patrons.map((patron, index) => (
          <PatronCard
            key={patron.id}
            patron={patron}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}