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
      <Avatar className="h-10 w-10 border bg-white" style={{borderColor: 'rgba(255,255,255,0.3)'}}>
        <AvatarImage src={member.imageUrl} alt={member.name} />
        <AvatarFallback className="text-xs font-bold" style={{background: 'rgba(255,255,255,0.15)', color: 'white'}}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h4 className="text-sm font-bold text-white leading-tight transition-colors">
          {member.name}
        </h4>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{color: '#87d4e0'}}>
            {roleLabel}
          </span>

          {(member.title || member.institution) && (
            <p className="text-[10px] mt-0.5 line-clamp-1" style={{color: 'rgba(255,255,255,0.6)'}}>
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
    <div className={`flex flex-col ${className}`} style={{divideColor: 'rgba(255,255,255,0.1)'}}>
      {sortedMembers.map((member, idx) => (
        <div key={member.id} style={idx > 0 ? {borderTop: '1px solid rgba(255,255,255,0.1)'} : {}}>
          <MemberCard member={member} />
        </div>
      ))}

      <div className="pt-4 text-center" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
        <a href="/editorial-board" className="text-xs font-semibold uppercase tracking-wide" style={{color: '#87d4e0'}}>
          View Full Board
        </a>
      </div>
    </div>
  );
}
