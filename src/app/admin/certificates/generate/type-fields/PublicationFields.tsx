'use client';
import { adminFetch } from '@/lib/admin-fetch';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Issue, IssuePaper, TypeFieldsData } from '../types';

interface PublicationFieldsProps {
  onChange: (data: TypeFieldsData) => void;
}

export default function PublicationFields({ onChange }: PublicationFieldsProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuePapers, setIssuePapers] = useState<IssuePaper[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [addIssueForm, setAddIssueForm] = useState({ title: '', description: '', volume: '', issueNumber: '', year: new Date().getFullYear().toString(), publishDate: new Date().toISOString().split('T')[0], coverImage: '', isPublished: false });
  const [addIssueSubmitting, setAddIssueSubmitting] = useState(false);
  const [generatingIssueCover, setGeneratingIssueCover] = useState(false);

  useEffect(() => { fetchIssues(); }, []);

  const handleIssueSelect = async (issueId: string) => {
    setSelectedIssueId(issueId);
    setSelectedPaperId('');
    setIssuePapers([]);
    onChange({});

    if (!issueId) return;

    setLoadingPapers(true);
    try {
      // Use admin papers API to get uniqueNumber, volumeNumber, issueNumber
      const res = await adminFetch(`/api/admin/papers?issueId=${issueId}&status=PUBLISHED&limit=100`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIssuePapers(data.papers || []);
      }
    } finally {
      setLoadingPapers(false);
    }
  };

  const handlePaperSelect = (paperId: string) => {
    setSelectedPaperId(paperId);
    const paper = issuePapers.find(p => p.id === paperId);
    if (paper) {
      onChange({
        paperId: paper.id,
        paperTitle: paper.title,
        paperNumber: paper.uniqueNumber || '',
      });
    } else {
      onChange({});
    }
  };

  const fetchIssues = () => {
    setLoadingIssues(true);
    adminFetch('/api/issues?limit=100')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setIssues(data.issues || []); })
      .finally(() => setLoadingIssues(false));
  };

  const handleAddIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddIssueSubmitting(true);
    try {
      const response = await adminFetch('/api/admin/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addIssueForm, year: parseInt(addIssueForm.year), coverImage: addIssueForm.coverImage || undefined }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowAddIssueModal(false);
        setAddIssueForm({ title: '', description: '', volume: '', issueNumber: '', year: new Date().getFullYear().toString(), publishDate: new Date().toISOString().split('T')[0], coverImage: '', isPublished: false });
        fetchIssues();
      } else {
        alert(data.error || 'Failed to create issue');
      }
    } catch {
      alert('Failed to create issue');
    } finally {
      setAddIssueSubmitting(false);
    }
  };

  const handleGenerateIssueCover = async () => {
    if (!addIssueForm.title || !addIssueForm.volume || !addIssueForm.issueNumber || !addIssueForm.year) {
      alert('Please fill in Title, Volume, Issue Number and Year first');
      return;
    }
    setGeneratingIssueCover(true);
    try {
      const response = await adminFetch('/api/admin/issues/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: addIssueForm.volume, issueNumber: addIssueForm.issueNumber, year: addIssueForm.year, title: addIssueForm.title }),
      });
      const data = await response.json();
      if (response.ok) setAddIssueForm(prev => ({ ...prev, coverImage: data.coverUrl }));
      else alert(data.error || 'Failed to generate cover');
    } catch {
      alert('Failed to generate cover');
    } finally {
      setGeneratingIssueCover(false);
    }
  };

  const selectedIssue = issues.find(i => i.id === selectedIssueId);
  const selectedPaper = issuePapers.find(p => p.id === selectedPaperId);

  if (loadingIssues) {
    return <div className="py-4 text-sm text-gray-500">Loading issues...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Issue select */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Select Issue <span className="text-red-500">*</span></label>
          <button type="button" onClick={() => setShowAddIssueModal(true)} className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
            <Plus className="h-3 w-3 mr-1" />
            Add
          </button>
        </div>
        <select
          value={selectedIssueId}
          onChange={(e) => handleIssueSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose an issue...</option>
          {issues.map((issue) => (
            <option key={issue.id} value={issue.id}>
              Volume {issue.volume} / Issue {issue.issue} — {issue.year} ({issue.paperCount} papers)
            </option>
          ))}
        </select>

        {/* Issue info box */}
        {selectedIssue && (
          <div className="mt-2 border border-gray-200 rounded-md bg-gray-50 p-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
            <span><span className="font-medium">Volume:</span> {selectedIssue.volume}</span>
            <span><span className="font-medium">Issue:</span> {selectedIssue.issue}</span>
            <span><span className="font-medium">Year:</span> {selectedIssue.year}</span>
            <span><span className="font-medium">Papers:</span> {selectedIssue.paperCount}</span>
          </div>
        )}
      </div>

      {/* Step 2: Paper select — shown after issue selected */}
      {selectedIssueId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Paper <span className="text-red-500">*</span>
          </label>

          {loadingPapers ? (
            <div className="py-3 text-sm text-gray-500">Loading papers...</div>
          ) : issuePapers.length === 0 ? (
            <div className="py-3 text-sm text-gray-500">No published papers found in this issue.</div>
          ) : (
            <>
              <select
                value={selectedPaperId}
                onChange={(e) => handlePaperSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a paper...</option>
                {issuePapers.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.uniqueNumber ? `[${paper.uniqueNumber}] ` : ''}{paper.title}
                  </option>
                ))}
              </select>

              {/* Paper info box */}
              {selectedPaper && (
                <div className="mt-3 border border-gray-200 rounded-md bg-gray-50 p-3 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Paper Title</p>
                    <p className="text-sm text-gray-800 font-medium leading-snug">{selectedPaper.title}</p>
                  </div>
                  {selectedPaper.uniqueNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Paper Number</p>
                      <p className="text-sm font-mono text-gray-700">{selectedPaper.uniqueNumber}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPaper.volumeNumber && (
                      <div>
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-sm text-gray-700">{selectedPaper.volumeNumber}</p>
                      </div>
                    )}
                    {selectedPaper.issueNumber && (
                      <div>
                        <p className="text-xs text-gray-500">Issue</p>
                        <p className="text-sm text-gray-700">{selectedPaper.issueNumber}</p>
                      </div>
                    )}
                  </div>
                  {selectedPaper.publishedAt && (
                    <div>
                      <p className="text-xs text-gray-500">Published</p>
                      <p className="text-sm text-gray-700">
                        {new Date(selectedPaper.publishedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}
                  {selectedPaper.paperAuthors && selectedPaper.paperAuthors.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Authors</p>
                      <p className="text-sm text-gray-700">
                        {selectedPaper.paperAuthors.map(a => `${a.user.firstName} ${a.user.lastName}`).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {showAddIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Issue</h2>
                <button onClick={() => setShowAddIssueModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleAddIssueSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" required value={addIssueForm.title} onChange={(e) => setAddIssueForm({ ...addIssueForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., January - March 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea value={addIssueForm.description} onChange={(e) => setAddIssueForm({ ...addIssueForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Brief description of this issue" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Volume *</label>
                    <input type="text" required value={addIssueForm.volume} onChange={(e) => setAddIssueForm({ ...addIssueForm, volume: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Number *</label>
                    <input type="text" required value={addIssueForm.issueNumber} onChange={(e) => setAddIssueForm({ ...addIssueForm, issueNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <input type="number" required min="1900" max="2100" value={addIssueForm.year} onChange={(e) => setAddIssueForm({ ...addIssueForm, year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date *</label>
                    <input type="date" required value={addIssueForm.publishDate} onChange={(e) => setAddIssueForm({ ...addIssueForm, publishDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                  <div className="flex gap-2">
                    <input type="text" value={addIssueForm.coverImage} onChange={(e) => setAddIssueForm({ ...addIssueForm, coverImage: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Enter URL or click Generate Cover" />
                    <button type="button" onClick={handleGenerateIssueCover} disabled={generatingIssueCover} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 whitespace-nowrap">
                      {generatingIssueCover ? 'Generating...' : 'Generate Cover'}
                    </button>
                  </div>
                  {addIssueForm.coverImage && <img src={addIssueForm.coverImage} alt="Cover Preview" className="mt-3 h-40 object-contain rounded border border-gray-200" />}
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="certAddIssuePublished" checked={addIssueForm.isPublished} onChange={(e) => setAddIssueForm({ ...addIssueForm, isPublished: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="certAddIssuePublished" className="ml-2 block text-sm text-gray-700">Publish this issue (make it available for paper assignment)</label>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" disabled={addIssueSubmitting} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    {addIssueSubmitting ? 'Creating...' : 'Create Issue'}
                  </button>
                  <button type="button" onClick={() => setShowAddIssueModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
