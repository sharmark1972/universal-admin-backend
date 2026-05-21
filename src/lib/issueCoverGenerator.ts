import * as fs from 'fs';
import * as path from 'path';

interface IssueCoverOptions {
  volume: string;
  issueNumber: string;
  year: number;
  title: string;
  paperCount?: number;
}

export function generateIssueCoverSVG(options: IssueCoverOptions): string {
  const { volume, issueNumber, year, title, paperCount } = options;

  // Simple escape - just handle the most common cases
  const escapedTitle = title
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');

  // Truncate title if too long
  const maxTitleLength = 60;
  const displayTitle = escapedTitle.length > maxTitleLength
    ? escapedTitle.substring(0, maxTitleLength) + '...'
    : escapedTitle;

  const paperCountText = paperCount !== undefined
    ? `<text x="400" y="670" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)">${paperCount} Research Papers</text>`
    : '';

  const publishDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="1200" fill="url(#bgGradient)" />
  
  <!-- Decorative circles -->
  <circle cx="640" cy="240" r="200" fill="rgba(255,255,255,0.05)" />
  <circle cx="160" cy="960" r="300" fill="rgba(255,255,255,0.03)" />
  
  <!-- Header - Journal Name -->
  <text x="400" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">IJARCM</text>
  <text x="400" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-style="italic" fill="rgba(255,255,255,0.9)">International Journal of Academic Research</text>
  <text x="400" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-style="italic" fill="rgba(255,255,255,0.9)">in Commerce and Management</text>
  
  <!-- Divider line -->
  <line x1="100" y1="160" x2="700" y2="160" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
  
  <!-- Volume and Issue Number -->
  <text x="400" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#ffffff">Vol. ${volume}</text>
  <text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#ffffff">Issue ${issueNumber}</text>
  
  <!-- Year -->
  <text x="400" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#fbbf24">${year}</text>
  
  <!-- Decorative underline for year -->
  <line x1="300" y1="520" x2="500" y2="520" stroke="#fbbf24" stroke-width="4" />
  
  <!-- Issue Title -->
  <text x="400" y="620" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">${displayTitle}</text>
  
  ${paperCountText}
  
  <!-- Bottom section - decorative box -->
  <rect x="100" y="950" width="600" height="180" rx="20" ry="20" fill="rgba(255,255,255,0.1)" />
  
  <!-- ISSN -->
  <text x="400" y="980" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">ISSN: 2455-0116 (Print)</text>
  <text x="400" y="1005" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)">ISSN: 2395-6410 (Online)</text>
  
  <!-- DOI info -->
  <text x="400" y="1040" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.8)">Peer Reviewed | Open Access</text>
  
  <!-- Publication date -->
  <text x="400" y="1080" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.8)">Published: ${publishDate}</text>
  
  <!-- Footer -->
  <text x="400" y="1170" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)">© IJARCM - All Rights Reserved</text>
</svg>`;
}

export async function generateIssueCover(options: IssueCoverOptions): Promise<string> {
  const svgContent = generateIssueCoverSVG(options);
  const filename = `issue_cover_${Date.now()}.svg`;
  const filepath = path.join(process.cwd(), 'public', 'uploads', 'covers', filename);
  
  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write SVG file
  fs.writeFileSync(filepath, svgContent, 'utf-8');
  
  return `/uploads/covers/${filename}`;
}

export function generateIssueCoverFilename(issueId: string): string {
  return `issue_cover_${issueId}_${Date.now()}.svg`;
}

export function getIssueCoverPath(filename: string): string {
  return `/uploads/covers/${filename}`;
}
