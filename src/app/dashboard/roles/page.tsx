'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  ShieldCheck, Plus, Edit3, Trash2, Shield, Lock, CheckCircle2,
  RefreshCw, Check, X, KeyRound, Layers, LayoutGrid, Users, FileText
} from 'lucide-react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Checkbox, FormControlLabel, Chip, Paper, Grid, Typography, Box, Stack
} from '@mui/material';

const ALL_MODULES = [
  { group: 'Overview', name: 'Dashboard Overview', path: '/dashboard' },
  { group: 'Overview', name: 'Reports & Analytics', path: '/dashboard/reports' },
  
  { group: 'Sales & Customers', name: 'Inquiries & Leads', path: '/dashboard/leads' },
  { group: 'Sales & Customers', name: 'Marketing Studio', path: '/dashboard/marketing' },
  { group: 'Sales & Customers', name: 'Client Directory', path: '/dashboard/clients' },
  { group: 'Sales & Customers', name: 'Bookings & Contracts', path: '/dashboard/bookings' },
  { group: 'Sales & Customers', name: 'Track Shoot Status', path: '/dashboard/bookings/status' },
  { group: 'Sales & Customers', name: 'Invoices & Billing', path: '/dashboard/billing' },
  { group: 'Sales & Customers', name: 'Quotation Studio', path: '/dashboard/quotations' },

  { group: 'Work & Operations', name: 'Staff Work Updates', path: '/dashboard/work-updates' },
  { group: 'Work & Operations', name: 'Shoot Schedule & Assignments', path: '/dashboard/assignments' },
  { group: 'Work & Operations', name: 'Editing Tasks & Workflows', path: '/dashboard/workflows' },
  { group: 'Work & Operations', name: 'Pricing Packages', path: '/dashboard/packages' },
  { group: 'Work & Operations', name: 'Event Types Master', path: '/dashboard/events' },

  { group: 'Finance & Gear', name: 'Equipment & Inventory', path: '/dashboard/inventory' },
  { group: 'Finance & Gear', name: 'Expense Ledger', path: '/dashboard/expenses' },

  { group: 'Team & Directory', name: 'Photographers Roster', path: '/dashboard/photographers' },
  { group: 'Team & Directory', name: 'All Staff Directory', path: '/dashboard/employees' },
  { group: 'Team & Directory', name: 'Attendance & Payroll', path: '/dashboard/attendance' },
  { group: 'Team & Directory', name: 'System User Accounts', path: '/dashboard/users' },

  { group: 'System', name: 'Roles & Dynamic Permissions', path: '/dashboard/roles' },
  { group: 'System', name: 'Studio Settings', path: '/dashboard/settings' },
];

const DEFAULT_ROLES_SEED = [
  {
    roleName: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Unrestricted top-level access to all system modules, security, financial data, and configuration.',
    isSystem: true,
    permissions: ALL_MODULES.map(m => m.path),
  },
  {
    roleName: 'ADMIN',
    displayName: 'Studio Administrator',
    description: 'Full operational access to manage studio bookings, staff, billing, shoot schedules, and workflows.',
    isSystem: true,
    permissions: ALL_MODULES.map(m => m.path),
  },
  {
    roleName: 'MANAGER',
    displayName: 'Studio Manager',
    description: 'Operational manager for bookings, client communications, shoot assignments, and staff workflow.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/leads', '/dashboard/marketing', '/dashboard/clients',
      '/dashboard/bookings', '/dashboard/bookings/status', '/dashboard/billing',
      '/dashboard/quotations', '/dashboard/work-updates', '/dashboard/assignments',
      '/dashboard/workflows', '/dashboard/packages', '/dashboard/events',
      '/dashboard/inventory', '/dashboard/photographers', '/dashboard/employees', '/dashboard/attendance'
    ],
  },
  {
    roleName: 'RECEPTIONIST',
    displayName: 'Front Desk Receptionist',
    description: 'Handles client inquiries, booking contracts, basic invoicing, quotation studio, and packages.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/leads', '/dashboard/marketing', '/dashboard/clients',
      '/dashboard/bookings', '/dashboard/bookings/status', '/dashboard/billing',
      '/dashboard/quotations', '/dashboard/packages', '/dashboard/events', '/dashboard/work-updates'
    ],
  },
  {
    roleName: 'PHOTOGRAPHER',
    displayName: 'Lead Photographer & Crew',
    description: 'Access to shoot schedules, daily work logs, assigned bookings, and equipment checklist.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/assignments', '/dashboard/work-updates',
      '/dashboard/inventory', '/dashboard/photographers', '/dashboard/bookings/status'
    ],
  },
  {
    roleName: 'EDITOR',
    displayName: 'Post-Production Editor',
    description: 'Access to post-production editing tasks, album reviewing, raw backups, and work updates.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/workflows', '/dashboard/work-updates', '/dashboard/bookings/status'
    ],
  },
  {
    roleName: 'ACCOUNTANT',
    displayName: 'Finance & Accountant',
    description: 'Access to billing, invoices, quotes, cash ledger, expenses, and payroll reports.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/reports', '/dashboard/billing', '/dashboard/quotations',
      '/dashboard/expenses', '/dashboard/attendance'
    ],
  },
];

export default function DynamicRolesPage() {
  const { rolePermissions, fetchData, createRecord, updateRecord, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formRoleName, setFormRoleName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSystemRole, setIsSystemRole] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchData('rolePermissions');
      // If table is completely empty, auto-seed default standard roles for instant usability!
      if (!data || data.length === 0) {
        for (const seedRole of DEFAULT_ROLES_SEED) {
          await createRecord('rolePermissions', {
            roleName: seedRole.roleName,
            displayName: seedRole.displayName,
            description: seedRole.description,
            isSystem: seedRole.isSystem,
            permissions: JSON.stringify(seedRole.permissions),
          });
        }
        await fetchData('rolePermissions');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingRoleId(null);
    setFormRoleName('');
    setFormDisplayName('');
    setFormDescription('');
    setSelectedPermissions(ALL_MODULES.map(m => m.path));
    setIsSystemRole(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (roleItem: any) => {
    setEditingRoleId(roleItem.id);
    setFormRoleName(roleItem.roleName);
    setFormDisplayName(roleItem.displayName || roleItem.roleName);
    setFormDescription(roleItem.description || '');
    setIsSystemRole(roleItem.isSystem || false);
    
    try {
      const parsed = typeof roleItem.permissions === 'string' ? JSON.parse(roleItem.permissions) : roleItem.permissions;
      setSelectedPermissions(Array.isArray(parsed) ? parsed : ALL_MODULES.map(m => m.path));
    } catch (e) {
      setSelectedPermissions(ALL_MODULES.map(m => m.path));
    }

    setModalOpen(true);
  };

  const handleToggleModule = (path: string) => {
    if (selectedPermissions.includes(path)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== path));
    } else {
      setSelectedPermissions([...selectedPermissions, path]);
    }
  };

  const handleToggleGroup = (groupName: string) => {
    const groupPaths = ALL_MODULES.filter(m => m.group === groupName).map(m => m.path);
    const allSelected = groupPaths.every(p => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter(p => !groupPaths.includes(p)));
    } else {
      const newSelected = new Set([...selectedPermissions, ...groupPaths]);
      setSelectedPermissions(Array.from(newSelected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName || !formDisplayName) {
      toast('Role identifier and display name are required.', 'error');
      return;
    }

    const formattedRoleKey = formRoleName.toUpperCase().replace(/\s+/g, '_');

    setSaving(true);
    try {
      const payload = {
        roleName: formattedRoleKey,
        displayName: formDisplayName,
        description: formDescription,
        permissions: JSON.stringify(selectedPermissions),
        isSystem: isSystemRole,
      };

      if (editingRoleId) {
        await updateRecord('rolePermissions', { id: editingRoleId, ...payload });
        toast('Role permissions updated successfully!', 'success');
      } else {
        await createRecord('rolePermissions', payload);
        toast('Dynamic role created successfully!', 'success');
      }

      setModalOpen(false);
      fetchData('rolePermissions');
    } catch (err: any) {
      toast('Failed to save role permissions: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id: string, roleName: string, isSystem: boolean) => {
    if (isSystem) {
      toast('System built-in roles (SUPER_ADMIN / ADMIN) cannot be deleted.', 'error');
      return;
    }

    const ok = await confirmAction(`Are you sure you want to delete custom role '${roleName}'?`, { title: 'Delete Dynamic Role' });
    if (ok) {
      try {
        await deleteRecord('rolePermissions', id);
        toast('Role deleted successfully.', 'success');
        fetchData('rolePermissions');
      } catch (err: any) {
        toast('Failed to delete role: ' + (err.message || err), 'error');
      }
    }
  };

  // Group modules for clean display in dialog
  const moduleGroups = Array.from(new Set(ALL_MODULES.map(m => m.group)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary-500" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-800">Dynamic Roles & Permissions Manager</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Create custom system roles dynamically and configure granular module access permissions for studio users.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 transition"
            title="Reload Roles"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Roles Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full glass-card p-12 text-center text-xs font-semibold text-neutral-400 rounded border border-neutral-200/50">
            Loading dynamic role definitions...
          </div>
        ) : rolePermissions.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-neutral-400 rounded border border-neutral-200/50">
            No dynamic roles configured. Click "Create Custom Role" or refresh to seed defaults.
          </div>
        ) : (
          rolePermissions.map((roleItem: any) => {
            let permsArr: string[] = [];
            try {
              permsArr = typeof roleItem.permissions === 'string' ? JSON.parse(roleItem.permissions) : roleItem.permissions;
            } catch (e) {
              permsArr = [];
            }

            return (
              <div
                key={roleItem.id}
                className="glass-card p-5 rounded border border-neutral-200/60 shadow-xs hover:shadow-md transition bg-white flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900 text-base">{roleItem.displayName || roleItem.roleName}</span>
                        {roleItem.isSystem && (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-purple-100 text-purple-700 border border-purple-200">
                            Built-in System
                          </span>
                        )}
                      </div>
                      <code className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {roleItem.roleName}
                      </code>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(roleItem)}
                        className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 rounded transition"
                        title="Edit Role Permissions"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {!roleItem.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(roleItem.id, roleItem.roleName, roleItem.isSystem)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed min-h-[36px]">
                    {roleItem.description || 'Custom studio role.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-700">
                    <span>Module Coverage</span>
                    <span className="text-primary-600 font-bold">
                      {permsArr?.length || 0} / {ALL_MODULES.length} Modules Allowed
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                    {ALL_MODULES.map((m) => {
                      const isAllowed = permsArr.includes(m.path);
                      return (
                        <span
                          key={m.path}
                          className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                            isAllowed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-50 text-neutral-400 line-through opacity-60'
                          }`}
                        >
                          {m.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Role Creation / Editing Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
          {editingRoleId ? `Configure Permissions for ${formDisplayName}` : 'Create New Dynamic Role'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Role Key Identifier *"
                placeholder="e.g. STUDIO_MANAGER, RECEPTIONIST"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                disabled={isSystemRole}
                required
                size="small"
                helperText="Stored in database as system code (uppercase)."
              />

              <TextField
                fullWidth
                label="Display Name *"
                placeholder="e.g. Studio Senior Director"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                required
                size="small"
                helperText="Label displayed in dashboard dropdowns and UI."
              />
            </div>

            <TextField
              fullWidth
              label="Role Description"
              placeholder="Summary of responsibilities and scope of access..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              size="small"
            />

            <div className="space-y-4 pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">Module Access & Permissions Checklist</h4>
                  <p className="text-xs text-neutral-500">Select which studio pages & features this role can access.</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedPermissions(ALL_MODULES.map(m => m.path))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => setSelectedPermissions([])}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {moduleGroups.map((groupName) => {
                  const groupModules = ALL_MODULES.filter(m => m.group === groupName);
                  const allGroupSelected = groupModules.every(m => selectedPermissions.includes(m.path));

                  return (
                    <Paper key={groupName} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200">
                        <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">{groupName}</span>
                        <Button
                          size="small"
                          sx={{ fontSize: '0.65rem', py: 0 }}
                          onClick={() => handleToggleGroup(groupName)}
                        >
                          {allGroupSelected ? 'Uncheck Group' : 'Check All Group'}
                        </Button>
                      </div>

                      <Grid container spacing={1.5}>
                        {groupModules.map((mod) => {
                          const isChecked = selectedPermissions.includes(mod.path);
                          return (
                            <Grid size={{ xs: 12, sm: 6 }} key={mod.path}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleToggleModule(mod.path)}
                                    size="small"
                                    color="primary"
                                  />
                                }
                                label={
                                  <span className={`text-xs ${isChecked ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}>
                                    {mod.name}
                                  </span>
                                }
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Paper>
                  );
                })}
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setModalOpen(false)} size="small" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving} size="small" sx={{ fontWeight: 700 }}>
              {saving ? 'Saving...' : 'Save Role Permissions'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
