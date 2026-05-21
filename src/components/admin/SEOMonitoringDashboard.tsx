'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Zap, 
  Eye, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { runSEOAudit, generateSEOReport, type SEOAuditResult } from '@/utils/seoTesting';
import { measureWebVitals, type WebVitalsMetrics } from '@/utils/performance';

interface SEOMetrics {
  overallScore: number;
  metaTags: number;
  structuredData: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface PageAnalysis {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  issues: string[];
  score: number;
}

const SEOMonitoringDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics>({
    overallScore: 0,
    metaTags: 0,
    structuredData: 0,
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0
  });
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics | null>(null);
  const [auditResults, setAuditResults] = useState<SEOAuditResult | null>(null);
  const [pageAnalyses, setPageAnalyses] = useState<PageAnalysis[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock data for demonstration
  const mockSEOMetrics: SEOMetrics = useMemo(() => ({
    overallScore: 95,
    metaTags: 98,
    structuredData: 92,
    performance: 88,
    accessibility: 94,
    bestPractices: 96,
    seo: 97
  }), []);

  const mockPageAnalyses: PageAnalysis[] = useMemo(() => [
    {
      url: '/',
      title: 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
      description: 'Premier international journal for computer applications and management research',
      keywords: ['research', 'journal', 'computer applications', 'management'],
      issues: [],
      score: 98
    },
    {
      url: '/papers',
      title: 'Research Papers - IJARCM',
      description: 'Browse published research papers in computer applications and management',
      keywords: ['papers', 'research', 'publications'],
      issues: ['Missing H2 tags', 'Image alt text could be improved'],
      score: 85
    },
    {
      url: '/authors',
      title: 'Authors - IJARCM',
      description: 'Meet our distinguished authors and researchers',
      keywords: ['authors', 'researchers', 'academics'],
      issues: ['Meta description too short'],
      score: 90
    }
  ], []);

  useEffect(() => {
    // Initialize with mock data
    setSeoMetrics(mockSEOMetrics);
    setPageAnalyses(mockPageAnalyses);
    setLastUpdated(new Date());

    // Measure Web Vitals
    measureWebVitals((metrics) => {
      setWebVitals(metrics);
    });
  }, [mockSEOMetrics, mockPageAnalyses]);

  const runFullAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate audit process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAuditResult: SEOAuditResult = {
        score: 95,
        passed: 87,
        failed: 3,
        warnings: 5,
        details: {
          metaTags: { score: 98, issues: [] },
          openGraph: { score: 95, issues: ['Missing og:image for some pages'] },
          twitterCards: { score: 92, issues: ['Twitter card type could be optimized'] },
          structuredData: { score: 90, issues: ['Add more specific schema types'] },
          headingStructure: { score: 88, issues: ['Some pages missing H2 tags'] },
          internalLinking: { score: 85, issues: ['Could improve internal link distribution'] },
          performance: { score: 88, issues: ['Optimize image loading', 'Reduce JavaScript bundle size'] },
          accessibility: { score: 94, issues: ['Improve color contrast in some areas'] }
        }
      };
      
      setAuditResults(mockAuditResult);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadReport = () => {
    if (auditResults) {
      const report = generateSEOReport(auditResults);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your website&apos;s search engine performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runFullAudit} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Running Audit...' : 'Run SEO Audit'}
          </Button>
          {auditResults && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall SEO Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoMetrics.overallScore}%</div>
            <Progress value={seoMetrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoMetrics.performance}%</div>
            <Progress value={seoMetrics.performance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoMetrics.accessibility}%</div>
            <Progress value={seoMetrics.accessibility} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Practices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seoMetrics.bestPractices}%</div>
            <Progress value={seoMetrics.bestPractices} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Web Vitals */}
      {webVitals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Core Web Vitals
            </CardTitle>
            <CardDescription>
              Real-time performance metrics from your users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                  <Badge variant={webVitals.lcp <= 2500 ? 'default' : 'destructive'}>
                    {webVitals.lcp}ms
                  </Badge>
                </div>
                <Progress value={Math.min((2500 - webVitals.lcp) / 25, 100)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FID (First Input Delay)</span>
                  <Badge variant={webVitals.fid <= 100 ? 'default' : 'destructive'}>
                    {webVitals.fid}ms
                  </Badge>
                </div>
                <Progress value={Math.min((100 - webVitals.fid) / 1, 100)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                  <Badge variant={webVitals.cls <= 0.1 ? 'default' : 'destructive'}>
                    {webVitals.cls.toFixed(3)}
                  </Badge>
                </div>
                <Progress value={Math.min((0.1 - webVitals.cls) * 1000, 100)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="issues">Issues & Recommendations</TabsTrigger>
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page-by-Page Analysis</CardTitle>
              <CardDescription>
                SEO performance analysis for individual pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageAnalyses.map((page, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{page.url}</span>
                        <Badge variant={getScoreBadgeVariant(page.score)}>
                          {page.score}%
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium">{page.title}</h4>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {page.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    {page.issues.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Issues: {page.issues.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Issues & Recommendations</CardTitle>
              <CardDescription>
                Prioritized list of SEO improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High Priority:</strong> Optimize image loading for better LCP scores
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Medium Priority:</strong> Add more specific structured data schemas
                  </AlertDescription>
                </Alert>
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Low Priority:</strong> Improve internal linking distribution
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Technical SEO Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Sitemap.xml</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Robots.txt</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>RSS Feeds</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>SSL Certificate</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Mobile Friendly</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indexing Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Pages Indexed</span>
                  <span className="font-medium">247 / 250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Coverage Issues</span>
                  <span className="font-medium text-yellow-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Crawl</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Crawl Errors</span>
                  <span className="font-medium text-green-600">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Monitoring Setup</CardTitle>
              <CardDescription>
                Configure automated SEO monitoring and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Daily SEO Audits</h4>
                    <p className="text-sm text-muted-foreground">Automated daily SEO health checks</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Performance Monitoring</h4>
                    <p className="text-sm text-muted-foreground">Core Web Vitals tracking</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Ranking Alerts</h4>
                    <p className="text-sm text-muted-foreground">Keyword ranking change notifications</p>
                  </div>
                  <Badge variant="secondary">Pending Setup</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SEOMonitoringDashboard;