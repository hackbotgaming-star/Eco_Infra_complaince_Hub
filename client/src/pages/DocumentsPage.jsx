import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  Download,
  Trash2,
  Cloud,
} from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    category: 'Compliance Evidence',
    tags: '',
  });

  useEffect(() => {
    fetchData();
  }, [search, category]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDocs, resProj] = await Promise.all([
        api.getDocuments({ search, category }),
        api.getProjects(),
      ]);
      if (resDocs.success) setDocuments(resDocs.data);
      if (resProj.success) setProjects(resProj.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('project', formData.project);
      formPayload.append('category', formData.category);
      formPayload.append('tags', formData.tags);
      if (file) {
        formPayload.append('file', file);
      }

      const res = await api.uploadDocument(formPayload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          project: '',
          category: 'Compliance Evidence',
          tags: '',
        });
        setFile(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error uploading document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this compliance document?')) return;
    try {
      await api.deleteDocument(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting document');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Compliance Document Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized archive for official MoEFCC letters, SPCB consents, EIA technical volumes, and test certificates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title, file name or tags..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
        >
          <option value="all">All Document Categories</option>
          <option value="Environmental Assessment">Environmental Assessment</option>
          <option value="Approval">Clearance & Approval</option>
          <option value="Compliance Evidence">Compliance Evidence</option>
          <option value="Inspection Report">Inspection Report</option>
          <option value="Monitoring Report">Monitoring Report</option>
          <option value="Permit">Permit</option>
          <option value="Certificate">Certificate</option>
        </select>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No compliance documents found"
          description="Upload formal environmental clearances, certificates, or lab analysis reports."
          actionLabel="Upload First Document"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-soft transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {(doc.storageProvider === 'cloudinary' || (doc.fileUrl && doc.fileUrl.includes('cloudinary'))) && (
                      <span className="text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" />
                        <span>Cloudinary</span>
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {doc.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{doc.fileName}</p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {doc.description || 'Uploaded for statutory compliance verification.'}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Project: <strong className="text-slate-700 dark:text-slate-300">{doc.project?.name || 'Corridor'}</strong></span>
                  <span>{doc.fileSize}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={api.downloadDocument ? api.downloadDocument(doc._id) : `${doc.fileUrl}?token=${localStorage.getItem('ecohub_token') || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition flex items-center gap-1 font-semibold text-xs"
                    title="Download / View with Authorized Clearance"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  {user && ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Compliance File or Regulatory Certificate"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex items-center gap-2.5 text-xs text-sky-800 dark:text-sky-300">
            <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span>Files are encrypted and stored via Cloudinary Cloud Storage for instant global streaming and authorized downloads.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. SPCB Consent to Operate (CTO) 2026 Renewal"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project *
              </label>
              <select
                required
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Environmental Assessment">Environmental Assessment</option>
                <option value="Approval">Clearance & Approval</option>
                <option value="Compliance Evidence">Compliance Evidence</option>
                <option value="Inspection Report">Inspection Report</option>
                <option value="Monitoring Report">Monitoring Report</option>
                <option value="Permit">Permit</option>
                <option value="Certificate">Certificate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Document File (PDF, DOCX, XLSX, Images)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/50 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline verification details..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Save Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
