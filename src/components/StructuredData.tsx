import { getOrganizationSchema, getWebsiteSchema } from '@/utils/structuredData';

export default function StructuredData() {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();
  
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
    />
  );
}