'use client';

import React from 'react';
import { getOptimizedHeadingProps, generateHeadingId } from '@/utils/headingStructure';
import { Link } from 'lucide-react';

interface SEOHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
  showAnchor?: boolean;
  generateId?: boolean;
}

const SEOHeading: React.FC<SEOHeadingProps> = ({
  level,
  children,
  className = '',
  id,
  showAnchor = false,
  generateId = true
}) => {
  const text = typeof children === 'string' ? children : '';
  const headingId = id || (generateId && text ? generateHeadingId(text) : undefined);
  
  const props = getOptimizedHeadingProps(level, text, {
    generateId: false, // We handle ID manually
    className,
    includeAnchor: showAnchor
  });

  const baseClasses = {
    1: 'text-4xl md:text-5xl font-bold text-gray-900 leading-tight',
    2: 'text-3xl md:text-4xl font-semibold text-gray-900 leading-tight',
    3: 'text-2xl md:text-3xl font-semibold text-gray-800 leading-snug',
    4: 'text-xl md:text-2xl font-medium text-gray-800 leading-snug',
    5: 'text-lg md:text-xl font-medium text-gray-700 leading-normal',
    6: 'text-base md:text-lg font-medium text-gray-700 leading-normal'
  };

  const combinedClassName = `${baseClasses[level]} ${className}`.trim();
  
  const headingProps = {
    ...props,
    id: headingId,
    className: combinedClassName
  };

  const HeadingComponent = ({ children: headingChildren }: { children: React.ReactNode }) => {
    switch (level) {
      case 1:
        return <h1 {...headingProps}>{headingChildren}</h1>;
      case 2:
        return <h2 {...headingProps}>{headingChildren}</h2>;
      case 3:
        return <h3 {...headingProps}>{headingChildren}</h3>;
      case 4:
        return <h4 {...headingProps}>{headingChildren}</h4>;
      case 5:
        return <h5 {...headingProps}>{headingChildren}</h5>;
      case 6:
        return <h6 {...headingProps}>{headingChildren}</h6>;
      default:
        return <h2 {...headingProps}>{headingChildren}</h2>;
    }
  };

  if (showAnchor && headingId) {
    return (
      <div className="group relative">
        <HeadingComponent>
          {children}
          <a
            href={`#${headingId}`}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-800"
            aria-label={`Link to ${text}`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(headingId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update URL without triggering navigation
                window.history.pushState(null, '', `#${headingId}`);
              }
            }}
          >
            <Link className="w-4 h-4 inline-block" />
          </a>
        </HeadingComponent>
      </div>
    );
  }

  return <HeadingComponent>{children}</HeadingComponent>;
};

// Convenience components for each heading level
export const H1: React.FC<Omit<SEOHeadingProps, 'level'>> = (props) => (
  <SEOHeading level={1} {...props} />
);

export const H2: React.FC<Omit<SEOHeadingProps, 'level'>> = (props) => (
  <SEOHeading level={2} {...props} />
);

export const H3: React.FC<Omit<SEOHeadingProps, 'level'>> = (props) => (
  <SEOHeading level={3} {...props} />
);

export const H4: React.FC<Omit<SEOHeadingProps, 'level'>> = (props) => (
  <SEOHeading level={4} {...props} />
);

export const H5: React.FC<Omit<SEOHeadingProps, 'level'>> = (props) => (
  <SEOHeading level={5} {...props} />
);

export const H6: React.FC<Omit<SEOHeadingProps, 'level'>> = (props) => (
  <SEOHeading level={6} {...props} />
);

export default SEOHeading;