'use client';

import { useEffect, useMemo } from 'react';

interface Author {
  name: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
}

interface ScholarlyArticleProps {
  title: string;
  abstract: string;
  authors: Author[];
  publishedAt: string;
  issuePublishDate?: string;
  doi?: string;
  keywords?: string[];
  category?: string;
  url: string;
  downloadUrl?: string;
  citationCount?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  // Enhanced Google Scholar properties
  dateModified?: string;
  review?: {
    rating?: number;
    reviewBody?: string;
    author?: string;
    dateCreated?: string;
  };
  references?: string[];
  partOfPeriodical?: {
    name: string;
    issn?: string;
    issnElectronic?: string;
    publisher?: string;
  };
}

interface OrganizationProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
}

interface PersonProps {
  name: string;
  jobTitle?: string;
  affiliation?: string;
  email?: string;
  url?: string;
  sameAs?: string[];
}

interface WebsiteProps {
  name: string;
  url: string;
  description: string;
  publisher: string;
  inLanguage?: string;
}

interface BreadcrumbListProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

// Scholarly Article Schema
export const ScholarlyArticleSchema: React.FC<ScholarlyArticleProps> = ({
  title,
  abstract,
  authors,
  publishedAt,
  issuePublishDate,
  doi,
  keywords,
  category,
  url,
  downloadUrl,
  citationCount,
  volume,
  issue,
  pages,
  dateModified,
  review,
  references,
  partOfPeriodical
}) => {
  // Use issue publish date if available, otherwise fall back to paper's publishedAt
  const effectivePublishDate = issuePublishDate || publishedAt;
  
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": title,
    "abstract": abstract,
    "author": authors.map(author => ({
      "@type": "Person",
      "name": author.name,
      "email": author.email,
      "affiliation": author.affiliation ? {
        "@type": "Organization",
        "name": author.affiliation
      } : undefined,
      "identifier": author.orcid ? {
        "@type": "PropertyValue",
        "propertyID": "ORCID",
        "value": author.orcid
      } : undefined
    })),
    "datePublished": effectivePublishDate,
    "dateModified": dateModified,
    "publisher": {
      "@type": "Organization",
      "name": "International Journal of Research in Computer Applications and Management (IJARCM)",
      "url": "https://ijarcm.com"
    },
    "url": url,
    "identifier": doi ? {
      "@type": "PropertyValue",
      "propertyID": "DOI",
      "value": doi
    } : undefined,
    "keywords": keywords?.join(", "),
    "about": category ? [{
      "@type": "Thing",
      "name": category
    }] : undefined,
    "distribution": downloadUrl ? {
      "@type": "DataDownload",
      "contentUrl": downloadUrl,
      "encodingFormat": "application/pdf"
    } : undefined,
    "citation": citationCount ? {
      "@type": "CreativeWork",
      "citedBy": citationCount
    } : undefined,
    "isPartOf": {
      "@type": "PublicationIssue",
      "issueNumber": issue,
      "isPartOf": {
        "@type": "PublicationVolume",
        "volumeNumber": volume,
        "isPartOf": {
          "@type": "Periodical",
          "name": partOfPeriodical?.name || "International Journal of Research in Computer Applications and Management",
          "issn": partOfPeriodical?.issn || "2455-0116",
          "issnElectronic": partOfPeriodical?.issnElectronic || "2395-6410",
          "publisher": {
            "@type": "Organization",
            "name": partOfPeriodical?.publisher || "IJARCM"
          }
        }
      }
    },
    "pageStart": pages?.split('-')[0],
    "pageEnd": pages?.split('-')[1],
    "review": review ? {
      "@type": "Review",
      "reviewRating": review.rating ? {
        "@type": "Rating",
        "ratingValue": review.rating.toString()
      } : undefined,
      "reviewBody": review.reviewBody,
      "author": review.author ? {
        "@type": "Person",
        "name": review.author
      } : undefined,
      "dateCreated": review.dateCreated
    } : undefined,
    "references": references?.map(ref => ({
      "@type": "CreativeWork",
      "name": ref
    }))
  }), [title, abstract, authors, effectivePublishDate, dateModified, doi, keywords, category, url, downloadUrl, citationCount, volume, issue, pages, review, references, partOfPeriodical]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

// Organization Schema
export const OrganizationSchema: React.FC<OrganizationProps> = ({
  name,
  url,
  logo,
  description,
  address,
  contactPoint
}) => {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "address": address ? {
      "@type": "PostalAddress",
      ...address
    } : undefined,
    "contactPoint": contactPoint ? {
      "@type": "ContactPoint",
      ...contactPoint
    } : undefined,
    "sameAs": [
      "https://www.facebook.com/ijrcam",
      "https://twitter.com/ijrcam",
      "https://www.linkedin.com/company/ijrcam"
    ]
  }), [name, url, logo, description, address, contactPoint]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

// Person Schema
export const PersonSchema: React.FC<PersonProps> = ({
  name,
  jobTitle,
  affiliation,
  email,
  url,
  sameAs
}) => {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": jobTitle,
    "worksFor": affiliation ? {
      "@type": "Organization",
      "name": affiliation
    } : undefined,
    "email": email,
    "url": url,
    "sameAs": sameAs
  }), [name, jobTitle, affiliation, email, url, sameAs]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

// Website Schema
export const WebsiteSchema: React.FC<WebsiteProps> = ({
  name,
  url,
  description,
  publisher,
  inLanguage = "en"
}) => {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "publisher": {
      "@type": "Organization",
      "name": publisher
    },
    "inLanguage": inLanguage,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }), [name, url, description, publisher, inLanguage]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

// Breadcrumb List Schema
export const BreadcrumbListSchema: React.FC<BreadcrumbListProps> = ({ items }) => {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }), [items]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

// Combined Schema Component for easy usage
interface CombinedSchemaProps {
  type: 'article' | 'organization' | 'person' | 'website' | 'breadcrumb';
  data: ScholarlyArticleProps | OrganizationProps | PersonProps | WebsiteProps | BreadcrumbListProps;
}

export const CombinedSchema: React.FC<CombinedSchemaProps> = ({ type, data }) => {
  switch (type) {
    case 'article':
      return <ScholarlyArticleSchema {...data as ScholarlyArticleProps} />;
    case 'organization':
      return <OrganizationSchema {...data as OrganizationProps} />;
    case 'person':
      return <PersonSchema {...data as PersonProps} />;
    case 'website':
      return <WebsiteSchema {...data as WebsiteProps} />;
    case 'breadcrumb':
      return <BreadcrumbListSchema {...data as BreadcrumbListProps} />;
    default:
      return null;
  }
};

export default CombinedSchema;