'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, FileText, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export interface IssueDisplayProps {
  id: string;
  title: string;
  description?: string;
  volume?: string;
  issue?: string;
  year?: number;
  publicationDate?: string;
  coverImage?: string;
  paperCount: number;
  isUpcoming?: boolean;
}

export default function IssueDisplay({
  id,
  title,
  description,
  volume,
  issue,
  year,
  publicationDate,
  coverImage,
  paperCount,
  isUpcoming = false
}: IssueDisplayProps) {
  const formattedDate = publicationDate
    ? new Date(publicationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : year
    ? year.toString()
    : 'N/A';

  return (
    <Link href={`/issues/${id}`}>
      <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden hover:-translate-y-1">
        {/* Cover Image Section */}
        {coverImage ? (
          <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
            <Image
              src={coverImage}
              alt={`Cover for ${title}`}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
        )}

        <div className="p-5">
          {/* Badge */}
          <div className="mb-3">
            {isUpcoming ? (
              <span className="inline-flex items-center px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                <Clock className="w-3 h-3 mr-1" />
                Upcoming
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                Latest
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-3">
            {volume && (
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                Vol. {volume}
              </span>
            )}
            {issue && (
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                Issue {issue}
              </span>
            )}
            {year && (
              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                {year}
              </span>
            )}
          </div>

          {/* Publication Date */}
          <div className="flex items-center text-sm text-slate-500 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formattedDate}</span>
          </div>

          {/* Description */}
          {description && (
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* Paper Count and View Link */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-600">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="font-medium">{paperCount} paper{paperCount !== 1 ? 's' : ''}</span>
            </div>
            <span className="text-slate-900 hover:text-blue-700 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
              View Issue
              <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
