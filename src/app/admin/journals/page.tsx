'use client';
import { adminFetch } from '@/lib/admin-fetch';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import Link from 'next/link';
import { Globe, Plus, Pencil, Trash2, CheckCircle, XCircle, X } from 'lucide-react';

interface Journal {
  id: string;
  name: string;
  abbreviation: string;
  website?: string | null;
  issnPrint?: string | null;
  issnOnline?: string | null;
  origin?: string | null;
  doiAllotted: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export default function JournalsPage() {
  const { journals: cachedJournals, journalsLoaded, setJournals: saveJournals, invalidateJournals } = useAdminStore();
  const [journals, setJournals] = useState<Journal[]>(cachedJournals);
  const [loading, setLoading] = useState(!journalsLoaded);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', abbreviation: '', website: '', issnPrint: '', issnOnline: '', origin: '', doiAllotted: false });
  const [addSubmitting, setAddSubmitting] = useState(false);

  const fetchJournals = async () => {
    if (journalsLoaded && cachedJournals.length > 0) {
      setJournals(cachedJournals);
      setLoading(false);
      return;
    }
    try {
      const res = await adminFetch('/api/admin/journals', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setJournals(data.journals || []);
        saveJournals(data.journals || []);
      }
    } catch (error) {
      console.error('Failed to fetch journals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJournals(); }, []);

  const handleDelete = async (id: string, abbr: string) => {
    if (!confirm(`Are you sure you want to deactivate "${abbr}"? This will not delete existing certificates.`)) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/admin/journals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        invalidateJournals();
        fetchJournals();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to deactivate journal');
      }
    } catch {
      alert('Failed to deactivate journal');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.abbreviation.trim()) {
      alert('Name and abbreviation are required');
      return;
    }
    setAddSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: '', abbreviation: '', website: '', issnPrint: '', issnOnline: '', origin: '', doiAllotted: false });
        invalidateJournals();
        fetchJournals();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create journal');
      }
    } catch {
      alert('Failed to create journal');
    } finally {
      setAddSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sites / Journals</h1>
              <p className="mt-1 text-gray-600">Manage all journals for certificate generation</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Journal
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abbreviation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journal Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISSN Print</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISSN Online</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journals.map((journal, index) => (
                <tr key={journal.id} className={!journal.isActive ? 'opacity-50' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{journal.abbreviation}</span>
                      {journal.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 max-w-xs truncate">{journal.name}</p>
                      {journal.website && (
                        <a href={journal.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3" />
                          {journal.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{journal.issnPrint || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{journal.issnOnline || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{journal.origin || '—'}</td>
                  <td className="px-4 py-3">
                    {journal.doiAllotted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      journal.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {journal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/journals/${journal.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {!journal.isDefault && (
                        <button
                          onClick={() => handleDelete(journal.id, journal.abbreviation)}
                          disabled={deletingId === journal.id}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Deactivate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {journals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No journals found. <button onClick={() => setShowAddModal(true)} className="text-blue-600 hover:underline">Add one</button>.
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Journal</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Journal Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={addForm.name} onChange={(e) => setAddForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. American Journal of Advanced Medical and Surgical Sciences" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation <span className="text-red-500">*</span></label>
                    <input type="text" required value={addForm.abbreviation} onChange={(e) => setAddForm(p => ({ ...p, abbreviation: e.target.value.toUpperCase() }))} placeholder="e.g. AJOAMS" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <select value={addForm.origin} onChange={(e) => setAddForm(p => ({ ...p, origin: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select origin</option>
                      <option value="Indian">Indian</option>
                      <option value="American">American</option>
                      <option value="Netherland">Netherland</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input type="url" value={addForm.website} onChange={(e) => setAddForm(p => ({ ...p, website: e.target.value }))} placeholder="https://example.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ISSN (Print)</label>
                    <input type="text" value={addForm.issnPrint} onChange={(e) => setAddForm(p => ({ ...p, issnPrint: e.target.value }))} placeholder="e.g. 2455-0116" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                    <p className="text-xs text-gray-500 mt-1">Leave blank if not applicable (e.g. American journals)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ISSN (Online)</label>
                    <input type="text" value={addForm.issnOnline} onChange={(e) => setAddForm(p => ({ ...p, issnOnline: e.target.value }))} placeholder="e.g. 2395-6410" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="doiAllotted" checked={addForm.doiAllotted} onChange={(e) => setAddForm(p => ({ ...p, doiAllotted: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="doiAllotted" className="text-sm font-medium text-gray-700">DOI Allotted</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={addSubmitting} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    {addSubmitting ? 'Saving...' : 'Save Journal'}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
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
