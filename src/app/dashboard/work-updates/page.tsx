'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Activity, Plus, Search, Filter, Calendar, User, Clock, CheckCircle2,
  AlertTriangle, RefreshCw, Trash2, Tag, FileText, CheckSquare, MessageSquare
} from 'lucide-react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Button, Chip, Stack, Box
} from '@mui/material';

const CATEGORIES = [
  { label: 'General Update', value: 'GENERAL' },
  { label: 'Shoot Update', value: 'SHOOT_UPDATE' },
  { label: 'Editing Update', value: 'EDITING_UPDATE' },
  { label: 'Attendance / Shift Note', value: 'ATTENDANCE_NOTE' },
];

const STATUSES = [
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Blocked / Help Needed', value: 'BLOCKED' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
];

const AUTHOR_ROLES = [
  'SUPER_ADMIN', 'ADMIN', 'PHOTOGRAPHER', 'VIDEOGRAPHER', 'EDITOR',
  'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST', 'HR', 'ASSISTANT'
];

export default function WorkUpdatesPage() {
  const { workUpdates, employees, users, user, fetchData, createRecord, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('GENERAL');
  const [formStatus, setFormStatus] = useState('COMPLETED');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formAuthorRole, setFormAuthorRole] = useState('PHOTOGRAPHER');

  useEffect(() => {
    fetchData('workUpdates');
    fetchData('employees');
    fetchData('users').finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    if (user) {
      setFormAuthorName(user.name || 'Admin User');
      setFormAuthorRole(user.role || 'ADMIN');
    }
  }, [user]);

  const handleOpenModal = () => {
    if (user) {
      setFormAuthorName(user.name || '');
      setFormAuthorRole(user.role || 'ADMIN');
    }
    setFormTitle('');
    setFormDescription('');
    setFormCategory('GENERAL');
    setFormStatus('COMPLETED');
    setOpenModal(true);
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription) {
      toast('Please enter a title and description.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createRecord('workUpdates', {
        authorName: formAuthorName || user?.name || 'Staff Member',
        authorRole: formAuthorRole || user?.role || 'ADMIN',
        title: formTitle,
        description: formDescription,
        category: formCategory,
        status: formStatus,
        userId: user?.id,
      });
      toast('Work update submitted successfully!', 'success');
      setOpenModal(false);
      fetchData('workUpdates');
    } catch (err: any) {
      toast('Failed to submit work update: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to delete this work update log?', { title: 'Delete Work Log' });
    if (ok) {
      try {
        await deleteRecord('workUpdates', id);
        toast('Work update deleted.', 'success');
        fetchData('workUpdates');
      } catch (err: any) {
        toast('Failed to delete work update.', 'error');
      }
    }
  };

  // Filter updates
  const filteredUpdates = (workUpdates || []).filter((u: any) => {
    const matchesSearch =
      (u.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.authorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || u.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusChip = (st: string) => {
    switch (st) {
      case 'COMPLETED':
        return <Chip label="Completed" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.65rem' }} />;
      case 'IN_PROGRESS':
        return <Chip label="In Progress" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.65rem' }} />;
      case 'BLOCKED':
        return <Chip label="Blocked" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '0.65rem' }} />;
      default:
        return <Chip label="Pending Review" size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700, fontSize: '0.65rem' }} />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary-500" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-800">Staff Work Updates & Activity Feed</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time daily progress, shoot updates, and editing logs submitted by studio logins & company staff.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchData('workUpdates')}
            className="p-2.5 bg-white border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 transition"
            title="Refresh Feed"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Work Update</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded border border-neutral-200/50 flex items-center space-x-3.5">
          <div className="p-3 bg-primary-50 text-primary-600 rounded">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Total Work Updates</span>
            <p className="text-xl font-extrabold text-neutral-700">{workUpdates?.length || 0}</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded border border-neutral-200/50 flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Completed Tasks</span>
            <p className="text-xl font-extrabold text-neutral-700">
              {workUpdates?.filter((u: any) => u.status === 'COMPLETED').length || 0}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded border border-neutral-200/50 flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">In Progress</span>
            <p className="text-xl font-extrabold text-neutral-700">
              {workUpdates?.filter((u: any) => u.status === 'IN_PROGRESS').length || 0}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded border border-neutral-200/50 flex items-center space-x-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Blocked / Review</span>
            <p className="text-xl font-extrabold text-neutral-700">
              {workUpdates?.filter((u: any) => u.status === 'BLOCKED' || u.status === 'PENDING_REVIEW').length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded border border-neutral-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by author, title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="SHOOT_UPDATE">Shoot Update</option>
              <option value="EDITING_UPDATE">Editing Update</option>
              <option value="ATTENDANCE_NOTE">Attendance Note</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-neutral-500">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="PENDING_REVIEW">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Updates Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-card p-12 text-center text-xs font-semibold text-neutral-400 rounded border border-neutral-200/50">
            Loading work updates stream...
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="glass-card p-12 text-center text-neutral-400 rounded border border-neutral-200/50 space-y-2">
            <MessageSquare className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="text-sm font-semibold">No work updates found matching filters.</p>
            <p className="text-xs text-neutral-500">Click "Submit Work Update" to record daily logs.</p>
          </div>
        ) : (
          filteredUpdates.map((update: any) => (
            <div
              key={update.id}
              className="glass-card p-5 rounded border border-neutral-200/60 shadow-xs hover:shadow-md transition bg-white space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {(update.authorName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-neutral-800 text-sm">{update.authorName}</span>
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                        {update.authorRole || 'STAFF'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(update.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Chip
                    label={update.category?.replace('_', ' ') || 'GENERAL'}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.62rem', fontWeight: 600, height: 20 }}
                  />
                  {getStatusChip(update.status)}
                  {['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '') && (
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition"
                      title="Delete Update"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900">{update.title}</h4>
                <p className="text-xs text-neutral-600 mt-1 whitespace-pre-wrap leading-relaxed">
                  {update.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Work Update Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Submit Daily Work Update</DialogTitle>
        <form onSubmit={handleCreateUpdate}>
          <DialogContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Author / Employee Name"
                value={formAuthorName}
                onChange={(e) => setFormAuthorName(e.target.value)}
                required
                size="small"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Designated Role</InputLabel>
                <Select
                  value={formAuthorRole}
                  label="Designated Role"
                  onChange={(e) => setFormAuthorRole(e.target.value)}
                >
                  {AUTHOR_ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Work Category</InputLabel>
                <Select
                  value={formCategory}
                  label="Work Category"
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Task Status</InputLabel>
                <Select
                  value={formStatus}
                  label="Task Status"
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <TextField
              fullWidth
              label="Update Summary Title *"
              placeholder="e.g. Completed Raw Backup for Simran Wedding Shoot"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              size="small"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detailed Work Log & Notes *"
              placeholder="Describe tasks completed, shoot highlights, equipment checked, or any assistance needed..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} size="small" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} size="small" sx={{ fontWeight: 700 }}>
              {submitting ? 'Submitting...' : 'Post Work Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
