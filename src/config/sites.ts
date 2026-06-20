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

// all journals

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
  insightonix: {
    slug: 'insightonix',
    domain: 'insightonix.com',
    name: 'Global Insights Journal',
    shortName: 'INSIGHTONIX',
    description: 'International Peer-Reviewed Research',
    dbEnvVar: 'DATABASE_URL_INSIGHTONIX',
    smtpUserEnvVar: 'SMTP_USER_INSIGHTONIX',
    smtpPassEnvVar: 'SMTP_PASS_INSIGHTONIX',
    smtpFromEnvVar: 'SMTP_FROM_INSIGHTONIX',
    r2BucketEnvVar: 'R2_BUCKET_INSIGHTONIX',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_INSIGHTONIX',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_INSIGHTONIX',
  },
  ajoams: {
    slug: 'ajoams',
    domain: 'ajoams.com',
    name: 'American Journal of Advanced Medical and Surgical Sciences',
    shortName: 'AJOAMS',
    description: 'Advanced Medical and Surgical Research',
    dbEnvVar: 'DATABASE_URL_AJOAMS',
    smtpUserEnvVar: 'SMTP_USER_AJOAMS',
    smtpPassEnvVar: 'SMTP_PASS_AJOAMS',
    smtpFromEnvVar: 'SMTP_FROM_AJOAMS',
    r2BucketEnvVar: 'R2_BUCKET_AJOAMS',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_AJOAMS',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_AJOAMS',
  },
  ejoas: {
    slug: 'ejoas',
    domain: 'ejoas.com',
    name: 'European Journal of Agricultural Sciences',
    shortName: 'EJOAS',
    description: 'Agricultural Sciences Research',
    dbEnvVar: 'DATABASE_URL_EJOAS',
    smtpUserEnvVar: 'SMTP_USER_EJOAS',
    smtpPassEnvVar: 'SMTP_PASS_EJOAS',
    smtpFromEnvVar: 'SMTP_FROM_EJOAS',
    r2BucketEnvVar: 'R2_BUCKET_EJOAS',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_EJOAS',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_EJOAS',
  },
};

const DEV_SITE_SLUG = 'wjiis';

export function getSiteConfig(slug: string): SiteConfig | null {
  return sites[slug] ?? null;
}

export function getSiteConfigByDomain(host: string): SiteConfig | null {
  const domain = host.split(':')[0];

  for (const site of Object.values(sites)) {
    if (site.domain === domain) return site;
  }

  if (domain === 'localhost' || domain === '127.0.0.1') {
    return sites[DEV_SITE_SLUG];
  }

  // Admin panel domain — default to first site; actual site resolved via x-active-site header
  if (domain.includes('universal-admin-backend') || domain.includes('vercel.app')) {
    return sites[DEV_SITE_SLUG];
  }

  return null;
}

export function getAllSites(): SiteConfig[] {
  return Object.values(sites);
}
