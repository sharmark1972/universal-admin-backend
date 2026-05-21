import { useEffect, useState } from 'react';

interface SEOData {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  createdAt: string;
  updatedAt: string;
}

interface SEOFormData {
  page: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
}

export function useSEO() {
  const [seoData, setSeoData] = useState<SEOData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSEOData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/seo');
      if (!response.ok) {
        throw new Error('Failed to fetch SEO data');
      }
      const data = await response.json();
      setSeoData(data.seoData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createSEOConfig = async (formData: SEOFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create SEO configuration');
      }

      await fetchSEOData(); // Refresh the data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSEOConfig = async (id: string, formData: SEOFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/seo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update SEO configuration');
      }

      await fetchSEOData(); // Refresh the data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSEOConfig = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/seo/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete SEO configuration');
      }

      await fetchSEOData(); // Refresh the data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEOData();
  }, []);

  return {
    seoData,
    loading,
    error,
    fetchSEOData,
    createSEOConfig,
    updateSEOConfig,
    deleteSEOConfig,
  };
}

// Hook to get SEO data for a specific page
export function usePageSEO(pageName: string) {
  const [seoConfig, setSeoConfig] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageSEO = async () => {
      if (!pageName) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/seo?page=${encodeURIComponent(pageName)}`);
        if (response.ok) {
          const data = await response.json();
          const pageConfig = data.seoData?.find((config: SEOData) => config.page === pageName);
          setSeoConfig(pageConfig || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch page SEO');
      } finally {
        setLoading(false);
      }
    };

    fetchPageSEO();
  }, [pageName]);

  return { seoConfig, loading, error };
}