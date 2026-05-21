'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, FileText } from 'lucide-react';
import Image from 'next/image';

export interface IssueCardProps {
  id: string;
  title: string;
  description?: string;
  volume?: string;
  issue?: string;
  year?: number;
  publicationDate?: string;
  coverImage?: string;
  paperCount: number;
}

export default function IssueCard({
  id,
  title,
  description,
  volume,
  issue,
  year,
  publicationDate,
  coverImage,
  paperCount,
}: IssueCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0, active: false });
  const cardRef = useRef<HTMLDivElement>(null);

  const formattedDate = publicationDate
    ? new Date(publicationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : year
    ? year.toString()
    : 'N/A';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRipplePosition({ ...ripplePosition, active: false });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipplePosition({ x, y, active: true });
    setTimeout(() => setRipplePosition({ ...ripplePosition, active: false }), 600);
  };

  const tiltStyle = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.1}deg) rotateY(${(mousePosition.x - 50) * 0.1}deg) scale(1.03)`
      : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
    transition: 'transform 0.3s ease-out',
  };

  const glowStyle = {
    background: isHovered
      ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 50%)`
      : 'transparent',
  };

  return (
    <Link href={`/issues/${id}`}>
      <Card
        ref={cardRef}
        className="h-full cursor-pointer border-2 border-gray-200 hover:border-blue-400 group relative overflow-hidden"
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            ...glowStyle,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Ripple Effect */}
        {ripplePosition.active && (
          <div
            className="absolute rounded-full bg-blue-400/30 pointer-events-none animate-ping"
            style={{
              left: ripplePosition.x,
              top: ripplePosition.y,
              width: '100px',
              height: '100px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Shimmer Effect */}
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ${
            isHovered ? 'translate-x-full' : '-translate-x-full'
          }`}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
        <CardHeader className="pb-3 relative z-10">
          {/* Cover Image Section */}
          {coverImage ? (
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 group-hover:shadow-lg transition-shadow duration-300">
              <Image
                src={coverImage}
                alt={`Cover for ${title}`}
                width={800}
                height={1200}
                className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Image Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-full h-48 mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors duration-300">
              <FileText className="w-16 h-16 text-blue-300 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300" />
            </div>
          )}

          <div className="space-y-3">
            <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 group-hover:translate-x-1">
              {title}
            </CardTitle>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {volume && (
                <Badge variant="outline" className="font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105">
                  Vol. {volume}
                </Badge>
              )}
              {issue && (
                <Badge variant="outline" className="font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105">
                  Issue {issue}
                </Badge>
              )}
              {year && (
                <Badge variant="secondary" className="font-medium hover:bg-blue-100 transition-all duration-300 hover:scale-105">
                  {year}
                </Badge>
              )}
            </div>

            {/* Publication Date */}
            <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
              <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* Description */}
          {description && (
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
              {description}
            </p>
          )}

          {/* Paper Count */}
          <div className="flex items-center justify-between pt-2 border-t group-hover:border-blue-200 transition-colors duration-300">
            <div className="flex items-center text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
              <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">{paperCount} paper{paperCount !== 1 ? 's' : ''}</span>
            </div>
            <Badge
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
            >
              View Issue
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
