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
  issnPrint?: string;
  issnOnline?: string;
  subtitle?: string;
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
    issnPrint: '2278-0505 (Print)',
    issnOnline: '2278-5388 (Online)',
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
    issnPrint: '2455-0116 (Print)',
    issnOnline: '2395-6410 (Online)',
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
    issnPrint: '2456-7175 (Print)',
    issnOnline: '2456-9380 (Online)',
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
    issnPrint: '2768-5624 (Print)',
    issnOnline: '2768-5632 (Online)',
  },
  ajomait: {
    slug: 'ajomait',
    domain: 'ajomait.com',
    name: 'American Journal of Multidisciplinary AI & Technology',
    shortName: 'AJOMAIT',
    description: 'Multidisciplinary AI and Technology Research',
    dbEnvVar: 'DATABASE_URL_AJOMAIT',
    smtpUserEnvVar: 'SMTP_USER_AJOMAIT',
    smtpPassEnvVar: 'SMTP_PASS_AJOMAIT',
    smtpFromEnvVar: 'SMTP_FROM_AJOMAIT',
    r2BucketEnvVar: 'R2_BUCKET_AJOMAIT',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_AJOMAIT',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_AJOMAIT',
    issnPrint: '2768-9379 (Print)',
    issnOnline: '2768-9387 (Online)',
  },
  ijipal: {
    slug: 'ijipal',
    domain: 'ijipal.com',
    name: 'International Journal of Innovative Pedagogy & Learning',
    shortName: 'IJIPAL',
    description: 'Educational Research and Innovation in Learning Sciences',
    dbEnvVar: 'DATABASE_URL_IJIPAL',
    smtpUserEnvVar: 'SMTP_USER_IJIPAL',
    smtpPassEnvVar: 'SMTP_PASS_IJIPAL',
    smtpFromEnvVar: 'SMTP_FROM_IJIPAL',
    r2BucketEnvVar: 'R2_BUCKET_IJIPAL',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_IJIPAL',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_IJIPAL',
    issnPrint: '2456-7396 (Print)',
    issnOnline: '2456-8171 (Online)',
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
    issnPrint: '2768-6493 (Print)',
    issnOnline: '2768-6507 (Online)',
  },
  ijlscl: {
    slug: 'ijlscl',
    domain: 'ijlscl.com',
    name: 'International Journal of Legal Studies and Contemporary Law',
    shortName: 'IJLSCL',
    description: 'Legal Studies and Contemporary Law Research',
    dbEnvVar: 'DATABASE_URL_IJLSCL',
    smtpUserEnvVar: 'SMTP_USER_IJLSCL',
    smtpPassEnvVar: 'SMTP_PASS_IJLSCL',
    smtpFromEnvVar: 'SMTP_FROM_IJLSCL',
    r2BucketEnvVar: 'R2_BUCKET_IJLSCL',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_IJLSCL',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_IJLSCL',
    issnPrint: '2456-5156 (Print)',
    issnOnline: '2456-5164 (Online)',
  },
  ejaamss: {
    slug: 'ejaamss',
    domain: 'ejaamss.com',
    name: 'European Journal of Aerospace, Aviation and Maritime Spectrum Studies',
    shortName: 'EJAAMSS',
    description: 'Aerospace, Aviation and Maritime Research',
    dbEnvVar: 'DATABASE_URL_EJAAMSS',
    smtpUserEnvVar: 'SMTP_USER_EJAAMSS',
    smtpPassEnvVar: 'SMTP_PASS_EJAAMSS',
    smtpFromEnvVar: 'SMTP_FROM_EJAAMSS',
    r2BucketEnvVar: 'R2_BUCKET_EJAAMSS',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_EJAAMSS',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_EJAAMSS',
    issnPrint: '2768-7511 (Print)',
    issnOnline: '2768-752X (Online)',
  },
  ejffabls: {
    slug: 'ejffabls',
    domain: 'ejffabls.com',
    name: 'European Journal of Food, Fashion and Allied Bio-Life Sciences',
    shortName: 'EJFFABLS',
    description: 'Food, Fashion and Bio-Life Sciences Research',
    dbEnvVar: 'DATABASE_URL_EJFFABLS',
    smtpUserEnvVar: 'SMTP_USER_EJFFABLS',
    smtpPassEnvVar: 'SMTP_PASS_EJFFABLS',
    smtpFromEnvVar: 'SMTP_FROM_EJFFABLS',
    r2BucketEnvVar: 'R2_BUCKET_EJFFABLS',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_EJFFABLS',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_EJFFABLS',
    issnPrint: '2768-5934 (Print)',
    issnOnline: '2768-5942 (Online)',
  },
  ejlilejgp: {
    slug: 'ejlilejgp',
    domain: 'ejlilejgp.com',
    name: 'European Journal of Law, Interdisciplinary Legal Ethics and Jurisprudence Governance Practices',
    shortName: 'EJLILEJGP',
    description: 'Law, Legal Ethics and Jurisprudence Governance Research',
    dbEnvVar: 'DATABASE_URL_EJLILEJGP',
    smtpUserEnvVar: 'SMTP_USER_EJLILEJGP',
    smtpPassEnvVar: 'SMTP_PASS_EJLILEJGP',
    smtpFromEnvVar: 'SMTP_FROM_EJLILEJGP',
    r2BucketEnvVar: 'R2_BUCKET_EJLILEJGP',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_EJLILEJGP',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_EJLILEJGP',
    issnPrint: '2768-6175 (Print)',
    issnOnline: '2768-6183 (Online)',
  },
  ejimapss: {
    slug: 'ejimapss',
    domain: 'ejimapss.com',
    name: 'European Journal of Integrative Medicinal and Allied Paramedical Spectrum Studies',
    shortName: 'EJIMAPSS',
    description: 'Integrative Medicinal and Allied Paramedical Research',
    dbEnvVar: 'DATABASE_URL_EJIMAPSS',
    smtpUserEnvVar: 'SMTP_USER_EJIMAPSS',
    smtpPassEnvVar: 'SMTP_PASS_EJIMAPSS',
    smtpFromEnvVar: 'SMTP_FROM_EJIMAPSS',
    r2BucketEnvVar: 'R2_BUCKET_EJIMAPSS',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_EJIMAPSS',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_EJIMAPSS',
    issnPrint: '2768-7007 (Print)',
    issnOnline: '2768-7015 (Online)',
  },
  ejauipar: {
    slug: 'ejauipar',
    domain: 'ejauipar.com',
    name: 'European Journal of Ayurvedic, Unani and Interdisciplinary Pharmaceuticals & Allopathic Review',
    shortName: 'EJAUIPAR',
    description: 'Ayurvedic, Unani and Pharmaceuticals Research',
    dbEnvVar: 'DATABASE_URL_EJAUIPAR',
    smtpUserEnvVar: 'SMTP_USER_EJAUIPAR',
    smtpPassEnvVar: 'SMTP_PASS_EJAUIPAR',
    smtpFromEnvVar: 'SMTP_FROM_EJAUIPAR',
    r2BucketEnvVar: 'R2_BUCKET_EJAUIPAR',
    r2PublicUrlEnvVar: 'R2_PUBLIC_URL_EJAUIPAR',
    nextauthSecretEnvVar: 'NEXTAUTH_SECRET_EJAUIPAR',
    issnPrint: '2768-6256 (Print)',
    issnOnline: '2768-6264 (Online)',
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

  // Vercel deployment: extract subdomain (e.g., insightonix from insightonix.vercel.app)
  if (domain.includes('vercel.app')) {
    const subdomain = domain.split('.')[0];
    if (sites[subdomain]) return sites[subdomain];
    // Fallback to default if subdomain not found
    return sites[DEV_SITE_SLUG];
  }

  // Admin panel domain — default to first site; actual site resolved via x-active-site header
  if (domain.includes('universal-admin-backend')) {
    return sites[DEV_SITE_SLUG];
  }

  return null;
}

export function getAllSites(): SiteConfig[] {
  return Object.values(sites);
}
