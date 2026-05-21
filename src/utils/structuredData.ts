// Structured Data (JSON-LD) utilities for IJARCM

interface Author {
  name: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
}

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  publishedAt: string;
  doi?: string;
  keywords: string[];
  pdfUrl?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

interface Conference {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
}


// Organization Schema
export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT",
    "alternateName": "IJARCM",
    "url": "https://ijrcam.com",
    "logo": "https://ijrcam.com/images/ijarcm-logo.svg",
    "description": "IJARCM is a premier international journal publishing high-quality research in academic research, commerce, and management.",
    "foundingDate": "2011",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9999999999",
      "contactType": "Editorial Office",
      "email": "editor@ijrcam.com",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressLocality": "New Delhi",
      "addressRegion": "Delhi"
    },
    "sameAs": [
      "https://www.facebook.com/ijrcam",
      "https://twitter.com/ijrcam",
      "https://www.linkedin.com/company/ijrcam"
    ],
    "publishingPrinciples": "https://ijrcam.com/publishing-ethics",
    "issn": "2455-0116",
    "issnElectronic": "2395-6410"
  };
};

// Website Schema
export const getWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT",
    "url": "https://ijrcam.com",
    "description": "Premier international journal for research in computer applications, management, and technology",
    "publisher": {
      "@type": "Organization",
      "name": "IJARCM"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ijrcam.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

// Scholarly Article Schema
export const getScholarlyArticleSchema = (paper: Paper) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": paper.title,
    "abstract": paper.abstract,
    "url": `${baseUrl}/papers/${paper.id}`,
    "datePublished": paper.publishedAt,
    "dateModified": paper.publishedAt,
    "author": paper.authors.map(author => ({
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
    "publisher": {
      "@type": "Organization",
      "name": "IJARCM",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/ijarcm-logo.svg`
      }
    },
    "isPartOf": {
      "@type": "Periodical",
      "name": "IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT",
      "issn": "2455-0116",
      "issnElectronic": "2395-6410",
      "volumeNumber": paper.volume,
      "issueNumber": paper.issue
    },
    "pageStart": paper.pages?.split('-')[0],
    "pageEnd": paper.pages?.split('-')[1],
    "keywords": paper.keywords.join(', '),
    "inLanguage": "en",
    "copyrightYear": new Date(paper.publishedAt).getFullYear(),
    "copyrightHolder": {
      "@type": "Organization",
      "name": "IJARCM"
    },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "identifier": paper.doi ? {
      "@type": "PropertyValue",
      "propertyID": "DOI",
      "value": paper.doi
    } : undefined,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/papers/${paper.id}`
    },
    "distribution": paper.pdfUrl ? {
      "@type": "DataDownload",
      "encodingFormat": "application/pdf",
      "contentUrl": paper.pdfUrl
    } : undefined
  };
};

// Person Schema for Authors
export const getPersonSchema = (author: Author) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com';
  
  return {
    "@context": "https://schema.org",
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
    } : undefined,
    "url": `${baseUrl}/authors/${encodeURIComponent(author.name)}`,
    "jobTitle": "Researcher",
    "knowsAbout": [
      "Computer Applications",
      "Management",
      "Technology",
      "Research"
    ]
  };
};

// Event Schema for Conferences
export const getEventSchema = (conference: Conference) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": conference.title,
    "description": conference.description,
    "startDate": conference.startDate,
    "endDate": conference.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "location": conference.location ? {
      "@type": "Place",
      "name": conference.location
    } : {
      "@type": "VirtualLocation",
      "url": `${baseUrl}/conferences/${conference.id}`
    },
    "organizer": {
      "@type": "Organization",
      "name": conference.organizer
    },
    "url": `${baseUrl}/conferences/${conference.id}`,
    "image": `${baseUrl}/images/conference-${conference.id}.jpg`,
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/conferences/${conference.id}/register`,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    }
  };
};


// Breadcrumb Schema
export const getBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// FAQ Schema
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};