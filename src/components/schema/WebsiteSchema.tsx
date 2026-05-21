'use client';

import { useEffect } from 'react';

interface WebsiteSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

export default function WebsiteSchema({
  name = "International Journal of Research in Computer Applications and Management",
  description = "A premier academic journal publishing high-quality research in computer applications and management",
  url = "https://ijarcm.com",
  logo = "https://ijarcm.com/ijarcm-logo.svg",
  sameAs = [],
  contactPoint,
  address
}: WebsiteSchemaProps) {
  useEffect(() => {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${url}#organization`,
      "name": name,
      "description": description,
      "url": url,
      "logo": {
        "@type": "ImageObject",
        "url": logo,
        "width": 200,
        "height": 200
      },
      "sameAs": sameAs,
      "foundingDate": "2010",
      "knowsAbout": [
        "Computer Science",
        "Management",
        "Information Technology",
        "Software Engineering",
        "Data Science",
        "Artificial Intelligence",
        "Machine Learning",
        "Business Management",
        "Digital Transformation"
      ],
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Academic Publishing Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Peer Review",
              "description": "Professional peer review services for academic papers"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Academic Publishing",
              "description": "Publication of research papers in computer applications and management"
            }
          }
        ]
      },
      "publishingPrinciples": {
        "@type": "CreativeWork",
        "name": "Editorial Guidelines",
        "url": `${url}/guidelines`
      }
    };

    // Add contact point if provided
    if (contactPoint) {
      schema.contactPoint = {
        "@type": "ContactPoint",
        ...contactPoint
      };
    }

    // Add address if provided
    if (address) {
      schema.address = {
        "@type": "PostalAddress",
        ...address
      };
    }

    // Add website schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${url}#website`,
      "url": url,
      "name": name,
      "description": description,
      "publisher": {
        "@id": `${url}#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${url}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "Periodical",
        "name": name,
        "issn": "2455-0116",
        "issnElectronic": "2395-6410",
        "url": url,
        "publisher": {
          "@id": `${url}#organization`
        },
        "about": [
          "Computer Applications",
          "Management",
          "Information Technology",
          "Software Engineering"
        ]
      }
    };

    // Create script elements
    const organizationScript = document.createElement('script');
    organizationScript.type = 'application/ld+json';
    organizationScript.textContent = JSON.stringify(schema);
    organizationScript.id = 'organization-schema';

    const websiteScript = document.createElement('script');
    websiteScript.type = 'application/ld+json';
    websiteScript.textContent = JSON.stringify(websiteSchema);
    websiteScript.id = 'website-schema';

    // Remove existing schemas
    const existingOrg = document.getElementById('organization-schema');
    const existingWebsite = document.getElementById('website-schema');
    if (existingOrg) existingOrg.remove();
    if (existingWebsite) existingWebsite.remove();

    // Add new schemas
    document.head.appendChild(organizationScript);
    document.head.appendChild(websiteScript);

    return () => {
      // Cleanup on unmount
      const orgScript = document.getElementById('organization-schema');
      const webScript = document.getElementById('website-schema');
      if (orgScript) orgScript.remove();
      if (webScript) webScript.remove();
    };
  }, [name, description, url, logo, sameAs, contactPoint, address]);

  return null;
}