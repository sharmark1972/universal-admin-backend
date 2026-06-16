export interface SiteConfig {
  slug: string;
  domain: string;
  name: string;
  shortName: string;
  description: string;
  dbEnvVar: string;
  smtpUserEnvVar: string;
  smtpPassEnvVar: string;
  smtpFromEnvVar: string;
  r2BucketEnvVar: string;
  r2PublicUrlEnvVar: string;
  nextauthSecretEnvVar: string;
}

const sites: Record<string, SiteConfig> = {
  wjiis: {
    slug: 'wjiis',
    domain: 'wjiis.com',
    name: 'World Journal of Innovative and Interdisciplinary Studies',
    shortName: 'WJIIS',
    description: 'A peer-reviewed international journal for innovative and interdisciplinary research.',
    dbEnvVar: 'DATABASE_URL_WJIIS',
    smtpUserEnvVar: 'SMTP_USER_WJIIS',
    smtpPassEnvVar: 'SMTP_PASS_WJIIS',
    smtpFromEnvVar: 'SMTP_FROM_WJIIS',
    r2BucketEnvVar: 'R2_BUCKET_WJIIS',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_WJIIS',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_WJIIS',
  },
  ijarcm: {
    slug: 'ijarcm',
    domain: 'ijarcm.com',
    name: 'International Journal of Academic Research in Commerce and Management',
    shortName: 'IJARCM',
    description: 'A peer-reviewed international journal for research in commerce and management.',
    dbEnvVar: 'DATABASE_URL_IJARCM',
    smtpUserEnvVar: 'SMTP_USER_IJARCM',
    smtpPassEnvVar: 'SMTP_PASS_IJARCM',
    smtpFromEnvVar: 'SMTP_FROM_IJARCM',
    r2BucketEnvVar: 'R2_BUCKET_IJARCM',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_IJARCM',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_IJARCM',
  },
};

const DEV_SITE_SLUG = 'wjiis';

const devDomains: Record<string, string> = {
  'wjiis.local': 'wjiis',
  'ijarcm.local': 'ijarcm',
};

export function getSiteConfig(slug: string): SiteConfig | null {
  return sites[slug] ?? null;
}

export function getSiteConfigByDomain(host: string): SiteConfig | null {
  const domain = host.split(':')[0];

  for (const site of Object.values(sites)) {
    if (site.domain === domain) return site;
  }

  if (devDomains[domain]) {
    return sites[devDomains[domain]];
  }

  if (domain === 'localhost' || domain === '127.0.0.1') {
    return sites[DEV_SITE_SLUG];
  }

  return null;
}

export function getAllSites(): SiteConfig[] {
  return Object.values(sites);
}
