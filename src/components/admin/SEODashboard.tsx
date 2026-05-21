'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, TrendingUp, Search, Globe, Link } from 'lucide-react';
import { runSEOAudit, generateSEOReport, type SEOAuditResult, type PageSEOData, type SEOTestConfig } from '@/utils/seoTesting';
import { validateHeadingHierarchy, generateTableOfContents } from '@/utils/headingStructure';
import { generateCanonicalUrl, validateCanonicalUrl } from '@/utils/canonicalUrl';
import { generateLinkAttributes, generateBreadcrumbs } from '@/utils/internalLinking';

interface SEODashboardProps {
  currentUrl?: string;
}

export default function SEODashboard({ currentUrl }: SEODashboardProps) {
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  const runAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      const config: SEOTestConfig = {
        baseUrl: currentUrl || window.location.origin,
        pages: ['/'],
        checkExternalLinks: true,
        checkImages: true,
        checkPerformance: true
      };
      const result = await runSEOAudit(config);
      setAuditResult(result);
      setLastAuditTime(new Date());
    } catch (error) {
      console.error('SEO audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl]);

  useEffect(() => {
    // Run initial audit
    runAudit();
  }, [runAudit]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (status: string) => {
    switch (status) {
      case 'pass': return 'default';
      case 'warning': return 'secondary';
      case 'fail': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getCategoryData = (category: string) => {
    const categoryData = auditResult?.details[category];
    if (!categoryData) return { score: 0, issues: [] };
    return categoryData;
  };

  const downloadReport = () => {
    if (!auditResult) return;
    
    const report = generateSEOReport(auditResult);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!auditResult) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className={`h-8 w-8 mx-auto mb-4 ${isLoading ? 'animate-spin' : ''}`} />
          <p className="text-muted-foreground">
            {isLoading ? 'Running SEO audit...' : 'Loading SEO dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  const categorizedResults = {
    technical: getCategoryData('technical'),
    content: getCategoryData('content'), 
    social: getCategoryData('social'),
    performance: getCategoryData('performance'),
    accessibility: getCategoryData('accessibility')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive SEO analysis and optimization recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={downloadReport} variant="outline">
            Download Report
          </Button>
          <Button onClick={runAudit} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Auditing...' : 'Run Audit'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(auditResult.score)}`}>
              {auditResult.score}/100
            </div>
            <Progress value={auditResult.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditResult.passed}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {auditResult.passed + auditResult.failed + auditResult.warnings} tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {auditResult.warnings}
            </div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {auditResult.failed}
            </div>
            <p className="text-xs text-muted-foreground">
              require fixes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Last Audit Info */}
      {lastAuditTime && (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertTitle>Last Audit</AlertTitle>
          <AlertDescription>
            Completed on {lastAuditTime.toLocaleString()}
            {currentUrl && ` for ${currentUrl}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Results */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(auditResult.details).map(([category, data], index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(data.score >= 90 ? 'pass' : data.score >= 70 ? 'warning' : 'fail')}
                      <CardTitle className="text-lg">{category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}</CardTitle>
                      <Badge variant={getScoreBadgeVariant(data.score >= 90 ? 'pass' : data.score >= 70 ? 'warning' : 'fail')}>
                        {data.score >= 90 ? 'PASS' : data.score >= 70 ? 'WARNING' : 'FAIL'}
                      </Badge>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                      {data.score}/100
                    </div>
                  </div>
                  <CardDescription>
                    {data.issues.length === 0 ? 'All checks passed' : `${data.issues.length} issue(s) found`}
                  </CardDescription>
                </CardHeader>
                {data.issues.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Issues:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {data.issues.map((issue, issueIndex) => (
                          <li key={issueIndex} className="flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Technical SEO
              </CardTitle>
              <CardDescription>
                Core technical elements that affect search engine crawling and indexing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(categorizedResults.technical.score >= 90 ? 'pass' : categorizedResults.technical.score >= 70 ? 'warning' : 'fail')}
                  <div>
                    <p className="font-medium">Technical SEO Score</p>
                    <p className="text-sm text-muted-foreground">
                      {categorizedResults.technical.issues.length === 0 ? 'All technical checks passed' : `${categorizedResults.technical.issues.length} issue(s) found`}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(categorizedResults.technical.score)}`}>
                  {categorizedResults.technical.score}/100
                </div>
              </div>
              {categorizedResults.technical.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Issues:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {categorizedResults.technical.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Content SEO
              </CardTitle>
              <CardDescription>
                Content structure and optimization for better search visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(categorizedResults.content.score >= 90 ? 'pass' : categorizedResults.content.score >= 70 ? 'warning' : 'fail')}
                  <div>
                    <p className="font-medium">Content SEO Score</p>
                    <p className="text-sm text-muted-foreground">
                      {categorizedResults.content.issues.length === 0 ? 'All content checks passed' : `${categorizedResults.content.issues.length} issue(s) found`}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(categorizedResults.content.score)}`}>
                  {categorizedResults.content.score}/100
                </div>
              </div>
              {categorizedResults.content.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Issues:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {categorizedResults.content.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Social Media SEO
              </CardTitle>
              <CardDescription>
                Social media optimization for better sharing and engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(categorizedResults.social.score >= 90 ? 'pass' : categorizedResults.social.score >= 70 ? 'warning' : 'fail')}
                  <div>
                    <p className="font-medium">Social Media SEO Score</p>
                    <p className="text-sm text-muted-foreground">
                      {categorizedResults.social.issues.length === 0 ? 'All social media checks passed' : `${categorizedResults.social.issues.length} issue(s) found`}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(categorizedResults.social.score)}`}>
                  {categorizedResults.social.score}/100
                </div>
              </div>
              {categorizedResults.social.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Issues:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {categorizedResults.social.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance SEO
              </CardTitle>
              <CardDescription>
                Page speed and performance metrics that impact SEO rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(categorizedResults.performance.score >= 90 ? 'pass' : categorizedResults.performance.score >= 70 ? 'warning' : 'fail')}
                  <div>
                    <p className="font-medium">Performance SEO Score</p>
                    <p className="text-sm text-muted-foreground">
                      {categorizedResults.performance.issues.length === 0 ? 'All performance checks passed' : `${categorizedResults.performance.issues.length} issue(s) found`}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(categorizedResults.performance.score)}`}>
                  {categorizedResults.performance.score}/100
                </div>
              </div>
              {categorizedResults.performance.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Issues:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {categorizedResults.performance.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Accessibility SEO
              </CardTitle>
              <CardDescription>
                Accessibility improvements that also benefit SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(categorizedResults.accessibility.score >= 90 ? 'pass' : categorizedResults.accessibility.score >= 70 ? 'warning' : 'fail')}
                  <div>
                    <p className="font-medium">Accessibility SEO Score</p>
                    <p className="text-sm text-muted-foreground">
                      {categorizedResults.accessibility.issues.length === 0 ? 'All accessibility checks passed' : `${categorizedResults.accessibility.issues.length} issue(s) found`}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(categorizedResults.accessibility.score)}`}>
                  {categorizedResults.accessibility.score}/100
                </div>
              </div>
              {categorizedResults.accessibility.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Issues:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {categorizedResults.accessibility.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}