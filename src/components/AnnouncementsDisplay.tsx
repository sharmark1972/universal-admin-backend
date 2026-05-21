'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Pin,
  Calendar,
  Users,
  AlertTriangle,
  MessageSquare,
  Settings,
  Zap,
  X
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'MAINTENANCE' | 'CONFERENCE' | 'DEADLINE' | 'SYSTEM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface AnnouncementsDisplayProps {
  targetAudience?: 'ALL' | 'AUTHORS' | 'REVIEWERS' | 'ADMINS';
  conferenceId?: string;
  limit?: number;
  showDismiss?: boolean;
  className?: string;
}

export default function AnnouncementsDisplay({
  targetAudience = 'ALL',
  conferenceId,
  limit = 5,
  showDismiss = true,
  className = ''
}: AnnouncementsDisplayProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: limit.toString()
        });
        
        const response = await fetch(`/api/announcements?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        
        const data = await response.json();
        setAnnouncements(data.announcements || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedAnnouncements(new Set(JSON.parse(dismissed)));
    }
  }, [limit]);

  const dismissAnnouncement = (announcementId: string) => {
    const newDismissed = new Set(dismissedAnnouncements);
    newDismissed.add(announcementId);
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newDismissed)));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'CONFERENCE':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'SYSTEM':
        return <Settings className="h-5 w-5 text-gray-500" />;
      case 'MAINTENANCE':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'DEADLINE':
        return <Calendar className="h-5 w-5 text-red-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'border-l-gray-400 bg-gray-50';
      case 'NORMAL':
        return 'border-l-blue-400 bg-blue-50';
      case 'HIGH':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'URGENT':
        return 'border-l-red-400 bg-red-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };



  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.has(announcement.id)
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-4 border-l-gray-200 bg-gray-50 p-4 rounded-r-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`border-l-4 p-4 rounded-r-lg shadow-sm ${getPriorityColor(announcement.priority)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {getTypeIcon(announcement.type)}
                <h3 className="text-lg font-semibold text-gray-900 ml-2">
                  {announcement.title}
                </h3>
              </div>
              
              <p className="text-gray-700 mb-3">{announcement.content}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4" />
                  <span className="ml-1">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {announcement.priority === 'URGENT' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Urgent
                  </span>
                )}
                
                {announcement.priority === 'HIGH' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    High Priority
                  </span>
                )}
              </div>
            </div>
            
            {showDismiss && (
              <button
                onClick={() => dismissAnnouncement(announcement.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                title="Dismiss announcement"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}