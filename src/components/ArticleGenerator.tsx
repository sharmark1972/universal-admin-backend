'use client';

import { useState } from 'react';
import { Download, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface ArticleFormData {
  title: string;
  author: string;
  material: string;
  site: string;
  volume: string;
  issue: string;
  keywords: string;
  abstract: string;
  introduction: string;
  methodology: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string;
}

export default function ArticleGenerator() {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    author: '',
    material: '',
    site: '',
    volume: '',
    issue: '',
    keywords: '',
    abstract: '',
    introduction: '',
    methodology: '',
    results: '',
    discussion: '',
    conclusion: '',
    references: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof ArticleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const generateArticle = async () => {
    if (!formData.title || !formData.material || !formData.site) {
      setError('Please fill in at least the title, material, and site fields.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/article-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate article');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setSuccess(true);
    } catch (err) {
      setError('Failed to generate article. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch('/api/article-generator/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          title: formData.title || 'Article',
          author: formData.author || 'Unknown Author',
          volume: formData.volume,
          issue: formData.issue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.title.replace(/\s+/g, '_')}_article.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download PDF. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-600 dark:text-green-400">Article generated successfully!</p>
        </div>
      )}

      {/* Main Form */}
      <Card className="p-6 bg-white dark:bg-slate-800 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Article Information
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
              Article Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter the article title"
              className="mt-1"
            />
          </div>

          {/* Author */}
          <div>
            <Label htmlFor="author" className="text-gray-700 dark:text-gray-300">
              Author Name
            </Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Enter author name"
              className="mt-1"
            />
          </div>

          {/* Volume and Issue */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="volume" className="text-gray-700 dark:text-gray-300">
                Volume
              </Label>
              <Input
                id="volume"
                value={formData.volume}
                onChange={(e) => handleInputChange('volume', e.target.value)}
                placeholder="e.g., 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="issue" className="text-gray-700 dark:text-gray-300">
                Issue
              </Label>
              <Input
                id="issue"
                value={formData.issue}
                onChange={(e) => handleInputChange('issue', e.target.value)}
                placeholder="e.g., 1"
                className="mt-1"
              />
            </div>
          </div>

          {/* Material */}
          <div>
            <Label htmlFor="material" className="text-gray-700 dark:text-gray-300">
              Material / Subject *
            </Label>
            <Textarea
              id="material"
              value={formData.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              placeholder="Describe the material or subject of the article"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Site */}
          <div>
            <Label htmlFor="site" className="text-gray-700 dark:text-gray-300">
              Site / Context *
            </Label>
            <Textarea
              id="site"
              value={formData.site}
              onChange={(e) => handleInputChange('site', e.target.value)}
              placeholder="Describe the site, location, or context of the article"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Keywords */}
          <div>
            <Label htmlFor="keywords" className="text-gray-700 dark:text-gray-300">
              Keywords
            </Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="Enter keywords separated by commas"
              className="mt-1"
            />
          </div>

          {/* Abstract */}
          <div>
            <Label htmlFor="abstract" className="text-gray-700 dark:text-gray-300">
              Abstract
            </Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              placeholder="Provide a brief abstract of the article"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Introduction */}
          <div>
            <Label htmlFor="introduction" className="text-gray-700 dark:text-gray-300">
              Introduction
            </Label>
            <Textarea
              id="introduction"
              value={formData.introduction}
              onChange={(e) => handleInputChange('introduction', e.target.value)}
              placeholder="Write the introduction section"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Methodology */}
          <div>
            <Label htmlFor="methodology" className="text-gray-700 dark:text-gray-300">
              Methodology
            </Label>
            <Textarea
              id="methodology"
              value={formData.methodology}
              onChange={(e) => handleInputChange('methodology', e.target.value)}
              placeholder="Describe the methodology used"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Results */}
          <div>
            <Label htmlFor="results" className="text-gray-700 dark:text-gray-300">
              Results
            </Label>
            <Textarea
              id="results"
              value={formData.results}
              onChange={(e) => handleInputChange('results', e.target.value)}
              placeholder="Present the results"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Discussion */}
          <div>
            <Label htmlFor="discussion" className="text-gray-700 dark:text-gray-300">
              Discussion
            </Label>
            <Textarea
              id="discussion"
              value={formData.discussion}
              onChange={(e) => handleInputChange('discussion', e.target.value)}
              placeholder="Discuss the findings"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Conclusion */}
          <div>
            <Label htmlFor="conclusion" className="text-gray-700 dark:text-gray-300">
              Conclusion
            </Label>
            <Textarea
              id="conclusion"
              value={formData.conclusion}
              onChange={(e) => handleInputChange('conclusion', e.target.value)}
              placeholder="Write the conclusion"
              rows={4}
              className="mt-1"
            />
          </div>

          {/* References */}
          <div>
            <Label htmlFor="references" className="text-gray-700 dark:text-gray-300">
              References
            </Label>
            <Textarea
              id="references"
              value={formData.references}
              onChange={(e) => handleInputChange('references', e.target.value)}
              placeholder="List references (one per line)"
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={generateArticle}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Article
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card className="p-6 bg-white dark:bg-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated Article Preview
            </h2>
            <Button
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: generatedContent }}
              className="whitespace-pre-wrap text-gray-700 dark:text-gray-300"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
