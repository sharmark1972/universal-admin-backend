'use client';

import { useEffect, useState } from 'react';
import { Users, Building, Mail, Briefcase, AlertCircle, RefreshCw, Star, User } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  name: string;
  title?: string;
  role: string;
  institution?: string;
  email?: string;
  imageUrl?: string;
  bio?: string;
  expertise?: string;
  displayOrder: number;
  isActive: boolean;
}

interface MemberCardProps {
  member: TeamMember;
}

const ROLE_LABELS: Record<string, string> = {
  MANAGING_EDITOR: 'Managing Editor',
  ASSOCIATE_EDITOR: 'Associate Editor',
  TECH_LEAD: 'Tech Lead',
  DEVELOPER: 'Developer',
  DESIGNER: 'Designer',
  CONTENT_MANAGER: 'Content Manager',
  MARKETING: 'Marketing',
  MEMBER: 'Team Member'
};

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const roleLabel = ROLE_LABELS[member.role] || member.role;
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex items-center gap-3 py-3 group">
      <Avatar className="h-10 w-10 border border-slate-200 bg-white">
        <AvatarImage src={member.imageUrl} alt={member.name} />
        <AvatarFallback className="bg-slate-50 text-slate-600 text-xs font-serif">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h4 className="text-sm font-serif font-bold text-slate-900 leading-tight group-hover:text-blue-800 transition-colors">
          {member.name}
        </h4>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            {roleLabel}
          </span>
          
          {(member.title || member.institution) && (
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              {member.title || member.institution}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ErrorState {
  hasError: boolean;
  message: string;
}

interface OurLeadershipProps {
  className?: string;
}

export default function OurLeadership({ className = '' }: OurLeadershipProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError({ hasError: false, message: '' });
      
      const response = await fetch('/api/team-members');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team members`);
      }
      
      const data = await response.json();
      setMembers(data.teamMembers || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError({
        hasError: true,
        message: 'Failed to load leadership team'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-2 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error.hasError) {
    return null; // Fail silently in sidebar to keep UI clean
  }

  if (members.length === 0) {
    return null;
  }

  // Filter for leadership roles only if needed, or sort by importance
  const sortedMembers = [...members].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className={`flex flex-col divide-y divide-slate-100 ${className}`}>
      {sortedMembers.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
        />
      ))}
      
      <div className="pt-4 text-center">
        <a href="/editorial-board" className="text-xs font-semibold text-blue-700 hover:text-blue-900 uppercase tracking-wide">
          View Full Board
        </a>
      </div>
    </div>
  );
}
