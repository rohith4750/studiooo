'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  ShieldCheck, Plus, Edit3, Trash2, Shield, Lock, CheckCircle2,
  RefreshCw, Check, X, KeyRound, Layers, LayoutGrid, Eye, PenTool,
  DollarSign, ShieldAlert, Sparkles, SlidersHorizontal, LockKeyhole
} from 'lucide-react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Checkbox, FormControlLabel, Chip, Paper, Grid, Typography, Box, Stack,
  Tooltip, Switch, Badge
} from '@mui/material';
import { parseRolePermissions, GranularPermissionsMap, ModulePermissionRule } from '@/lib/permissions';

interface ModuleDef {
  group: string;
  name: string;
  path: string;
  hasFinancials?: boolean;
}

const ALL_MODULES: ModuleDef[] = [
  { group: 'Overview', name: 'Dashboard Overview', path: '/dashboard', hasFinancials: true },
  { group: 'Overview', name: 'Reports & Analytics', path: '/dashboard/reports', hasFinancials: true },
  
  { group: 'Sales & Customers', name: 'Inquiries & Leads', path: '/dashboard/leads', hasFinancials: true },
  { group: 'Sales & Customers', name: 'Marketing Studio', path: '/dashboard/marketing', hasFinancials: false },
  { group: 'Sales & Customers', name: 'Client Directory', path: '/dashboard/clients', hasFinancials: false },
  { group: 'Sales & Customers', name: 'Bookings & Contracts', path: '/dashboard/bookings', hasFinancials: true },
  { group: 'Sales & Customers', name: 'Track Shoot Status', path: '/dashboard/bookings/status', hasFinancials: false },
  { group: 'Sales & Customers', name: 'Invoices & Billing', path: '/dashboard/billing', hasFinancials: true },
  { group: 'Sales & Customers', name: 'Quotation Studio', path: '/dashboard/quotations', hasFinancials: true },

  { group: 'Work & Operations', name: 'Staff Work Updates', path: '/dashboard/work-updates', hasFinancials: false },
  { group: 'Work & Operations', name: 'Shoot Schedule & Assignments', path: '/dashboard/assignments', hasFinancials: false },
  { group: 'Work & Operations', name: 'Editing Tasks & Workflows', path: '/dashboard/workflows', hasFinancials: false },
  { group: 'Work & Operations', name: 'Pricing Packages', path: '/dashboard/packages', hasFinancials: true },
  { group: 'Work & Operations', name: 'Event Types Master', path: '/dashboard/events', hasFinancials: true },

  { group: 'Finance & Gear', name: 'Equipment & Inventory', path: '/dashboard/inventory', hasFinancials: true },
  { group: 'Finance & Gear', name: 'Expense Ledger', path: '/dashboard/expenses', hasFinancials: true },

  { group: 'Team & Directory', name: 'Photographers Roster', path: '/dashboard/photographers', hasFinancials: false },
  { group: 'Team & Directory', name: 'All Staff Directory', path: '/dashboard/employees', hasFinancials: true },
  { group: 'Team & Directory', name: 'Attendance & Payroll', path: '/dashboard/attendance', hasFinancials: true },
  { group: 'Team & Directory', name: 'System User Accounts', path: '/dashboard/users', hasFinancials: false },

  { group: 'System', name: 'Roles & Dynamic Permissions', path: '/dashboard/roles', hasFinancials: false },
  { group: 'System', name: 'Studio Settings', path: '/dashboard/settings', hasFinancials: false },
];

const DEFAULT_FULL_PERMISSIONS = ALL_MODULES.reduce((acc, m) => {
  acc[m.path] = { read: true, write: true, delete: true, hideFinancials: false };
  return acc;
}, {} as GranularPermissionsMap);

const DEFAULT_ROLES_SEED = [
  {
    roleName: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Unrestricted top-level access to all system modules, security, financial data, and configuration.',
    isSystem: true,
    permissions: DEFAULT_FULL_PERMISSIONS,
  },
  {
    roleName: 'ADMIN',
    displayName: 'Studio Administrator',
    description: 'Full operational access to manage studio bookings, staff, billing, shoot schedules, and workflows.',
    isSystem: true,
    permissions: DEFAULT_FULL_PERMISSIONS,
  },
  {
    roleName: 'MANAGER',
    displayName: 'Studio Manager',
    description: 'Operational manager for bookings, client communications, shoot assignments, and staff workflow.',
    isSystem: false,
    permissions: ALL_MODULES.reduce((acc, m) => {
      if (!['/dashboard/roles', '/dashboard/settings'].includes(m.path)) {
        acc[m.path] = { read: true, write: true, delete: false, hideFinancials: false };
      }
      return acc;
    }, {} as GranularPermissionsMap),
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
    ].reduce((acc, path) => {
      acc[path] = { read: true, write: true, delete: false, hideFinancials: false };
      return acc;
    }, {} as GranularPermissionsMap),
  },
  {
    roleName: 'PHOTOGRAPHER',
    displayName: 'Lead Photographer & Crew',
    description: 'Access to shoot schedules, daily work logs, assigned bookings, and equipment. Financial details are masked.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/assignments', '/dashboard/work-updates',
      '/dashboard/inventory', '/dashboard/photographers', '/dashboard/bookings/status'
    ].reduce((acc, path) => {
      acc[path] = { read: true, write: true, delete: false, hideFinancials: true };
      return acc;
    }, {} as GranularPermissionsMap),
  },
  {
    roleName: 'EDITOR',
    displayName: 'Post-Production Editor',
    description: 'Access to post-production editing tasks, album reviewing, raw backups, and work updates with financial privacy.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/workflows', '/dashboard/work-updates', '/dashboard/bookings/status'
    ].reduce((acc, path) => {
      acc[path] = { read: true, write: true, delete: false, hideFinancials: true };
      return acc;
    }, {} as GranularPermissionsMap),
  },
  {
    roleName: 'ACCOUNTANT',
    displayName: 'Finance & Accountant',
    description: 'Access to billing, invoices, quotes, cash ledger, expenses, and payroll reports.',
    isSystem: false,
    permissions: [
      '/dashboard', '/dashboard/reports', '/dashboard/billing', '/dashboard/quotations',
      '/dashboard/expenses', '/dashboard/attendance'
    ].reduce((acc, path) => {
      acc[path] = { read: true, write: true, delete: true, hideFinancials: false };
      return acc;
    }, {} as GranularPermissionsMap),
  },
];

export default function UpgradedDynamicRolesPage() {
  const { rolePermissions, fetchData, createRecord, updateRecord, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formRoleName, setFormRoleName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSystemRole, setIsSystemRole] = useState(false);
  const [permMap, setPermMap] = useState<GranularPermissionsMap>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchData('rolePermissions');
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
    setPermMap(DEFAULT_FULL_PERMISSIONS);
    setIsSystemRole(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (roleItem: any) => {
    setEditingRoleId(roleItem.id);
    setFormRoleName(roleItem.roleName);
    setFormDisplayName(roleItem.displayName || roleItem.roleName);
    setFormDescription(roleItem.description || '');
    setIsSystemRole(roleItem.isSystem || false);
    
    const parsedMap = parseRolePermissions(roleItem.permissions);
    setPermMap(parsedMap);
    setModalOpen(true);
  };

  // Granular Toggle Handlers
  const handleToggleRead = (path: string) => {
    setPermMap((prev) => {
      const current = prev[path] || { read: false, write: false, delete: false, hideFinancials: false };
      const nextRead = !current.read;
      return {
        ...prev,
        [path]: {
          ...current,
          read: nextRead,
          // If read is disabled, write & delete should be disabled as well
          write: nextRead ? current.write : false,
          delete: nextRead ? current.delete : false,
        },
      };
    });
  };

  const handleToggleWrite = (path: string) => {
    setPermMap((prev) => {
      const current = prev[path] || { read: false, write: false, delete: false, hideFinancials: false };
      const nextWrite = !current.write;
      return {
        ...prev,
        [path]: {
          ...current,
          read: nextWrite ? true : current.read, // Writing requires Read access
          write: nextWrite,
        },
      };
    });
  };

  const handleToggleDelete = (path: string) => {
    setPermMap((prev) => {
      const current = prev[path] || { read: false, write: false, delete: false, hideFinancials: false };
      const nextDelete = !current.delete;
      return {
        ...prev,
        [path]: {
          ...current,
          read: nextDelete ? true : current.read,
          write: nextDelete ? true : current.write,
          delete: nextDelete,
        },
      };
    });
  };

  const handleToggleHideFinancials = (path: string) => {
    setPermMap((prev) => {
      const current = prev[path] || { read: true, write: false, delete: false, hideFinancials: false };
      return {
        ...prev,
        [path]: {
          ...current,
          hideFinancials: !current.hideFinancials,
        },
      };
    });
  };

  // Presets
  const applyPreset = (type: 'FULL' | 'OPERATIONS_MASKED' | 'VIEW_ONLY' | 'CLEAR') => {
    if (type === 'FULL') {
      setPermMap(DEFAULT_FULL_PERMISSIONS);
    } else if (type === 'OPERATIONS_MASKED') {
      const map: GranularPermissionsMap = {};
      ALL_MODULES.forEach((m) => {
        if (!['/dashboard/roles', '/dashboard/settings', '/dashboard/users'].includes(m.path)) {
          map[m.path] = { read: true, write: true, delete: false, hideFinancials: true };
        }
      });
      setPermMap(map);
    } else if (type === 'VIEW_ONLY') {
      const map: GranularPermissionsMap = {};
      ALL_MODULES.forEach((m) => {
        if (!['/dashboard/roles', '/dashboard/settings'].includes(m.path)) {
          map[m.path] = { read: true, write: false, delete: false, hideFinancials: true };
        }
      });
      setPermMap(map);
    } else if (type === 'CLEAR') {
      setPermMap({});
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
        permissions: JSON.stringify(permMap),
        isSystem: isSystemRole,
      };

      if (editingRoleId) {
        await updateRecord('rolePermissions', { id: editingRoleId, ...payload });
        toast('Granular role permissions updated successfully!', 'success');
      } else {
        await createRecord('rolePermissions', payload);
        toast('Dynamic role created with granular permissions!', 'success');
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

  const moduleGroups = Array.from(new Set(ALL_MODULES.map(m => m.group)));

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Page Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                Upgraded Dynamic Roles & Permissions
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Define custom roles with action-level access control (<span className="font-semibold text-neutral-700">Read</span>, <span className="font-semibold text-neutral-700">Write</span>, <span className="font-semibold text-neutral-700">Delete</span>) and <span className="font-bold text-amber-700">🔒 Financial Privacy Masking</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 text-neutral-600 transition"
            title="Reload Roles"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Upgraded Role</span>
          </button>
        </div>
      </div>

      {/* Roles Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full bg-white p-12 text-center text-xs font-semibold text-neutral-400 rounded-md border border-neutral-200">
            Loading dynamic role definitions...
          </div>
        ) : rolePermissions.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-neutral-400 rounded-md border border-neutral-200">
            No dynamic roles configured. Click "Create Upgraded Role" or refresh to seed defaults.
          </div>
        ) : (
          rolePermissions.map((roleItem: any) => {
            const rolePermMap = parseRolePermissions(roleItem.permissions);
            const allowedEntries = Object.entries(rolePermMap).filter(([_, rule]) => rule.read);
            
            const readCount = allowedEntries.length;
            const writeCount = allowedEntries.filter(([_, r]) => r.write).length;
            const deleteCount = allowedEntries.filter(([_, r]) => r.delete).length;
            const maskedCount = allowedEntries.filter(([_, r]) => r.hideFinancials).length;

            return (
              <div
                key={roleItem.id}
                className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
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
                        className="p-1.5 text-neutral-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        title="Edit Role & Permissions"
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
                    {roleItem.description || 'Custom studio role with granular permissions.'}
                  </p>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="bg-neutral-50 p-1.5 rounded border border-neutral-100">
                      <span className="block text-[9px] font-bold uppercase text-neutral-400">Read</span>
                      <span className="text-xs font-bold text-neutral-800">{readCount}</span>
                    </div>
                    <div className="bg-neutral-50 p-1.5 rounded border border-neutral-100">
                      <span className="block text-[9px] font-bold uppercase text-neutral-400">Write</span>
                      <span className="text-xs font-bold text-blue-600">{writeCount}</span>
                    </div>
                    <div className="bg-neutral-50 p-1.5 rounded border border-neutral-100">
                      <span className="block text-[9px] font-bold uppercase text-neutral-400">Delete</span>
                      <span className="text-xs font-bold text-rose-600">{deleteCount}</span>
                    </div>
                    <div className={`p-1.5 rounded border ${maskedCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-neutral-50 border-neutral-100 text-neutral-400'}`}>
                      <span className="block text-[9px] font-bold uppercase">Masked</span>
                      <span className="text-xs font-bold">{maskedCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-700">
                    <span>Module Access</span>
                    <span className="text-amber-600 font-bold">
                      {readCount} / {ALL_MODULES.length} Pages Allowed
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1 pr-1">
                    {ALL_MODULES.map((m) => {
                      const rule = rolePermMap[m.path];
                      const isAllowed = rule?.read;
                      const isMasked = rule?.hideFinancials;

                      return (
                        <span
                          key={m.path}
                          className={`text-[9px] px-2 py-0.5 rounded font-medium inline-flex items-center space-x-1 ${
                            isAllowed
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-neutral-50 text-neutral-400 line-through opacity-50'
                          }`}
                        >
                          <span>{m.name}</span>
                          {isAllowed && isMasked && (
                            <span title="Financials Masked">
                              <Lock className="h-2.5 w-2.5 text-amber-600 ml-0.5 inline-block" />
                            </span>
                          )}
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
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', pb: 1 }}>
          {editingRoleId ? `Configure Permissions for ${formDisplayName}` : 'Create Upgraded Dynamic Role'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Role Key Identifier *"
                placeholder="e.g. STUDIO_MANAGER, SENIOR_PHOTOGRAPHER"
                value={formRoleName}
                onChange={(e) => setFormRoleName(e.target.value)}
                disabled={isSystemRole}
                required
                size="small"
                helperText="Stored as unique key (uppercase)."
              />

              <TextField
                fullWidth
                label="Display Name *"
                placeholder="e.g. Senior Lead Photographer"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                required
                size="small"
                helperText="User-facing title in dropdowns."
              />
            </div>

            <TextField
              fullWidth
              label="Role Scope Description"
              placeholder="Detailed responsibilities, operational boundary, and privacy rules..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              size="small"
            />

            {/* Quick Action Presets Bar */}
            <div className="bg-neutral-50 p-3 rounded.lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wide flex items-center space-x-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
                  <span>Quick Permission Presets</span>
                </span>
                <span className="text-[10px] text-neutral-500">Apply standard template permission configurations with 1 click</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => applyPreset('FULL')}
                  startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  sx={{ textTransform: 'none', fontSize: '0.725rem' }}
                >
                  👑 Full Administrator (All Perms + Financials Visible)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => applyPreset('OPERATIONS_MASKED')}
                  startIcon={<LockKeyhole className="h-3.5 w-3.5" />}
                  sx={{ textTransform: 'none', fontSize: '0.725rem' }}
                >
                  🛡️ Operational Crew (Read + Write, No Delete, 🔒 Mask Finances)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={() => applyPreset('VIEW_ONLY')}
                  startIcon={<Eye className="h-3.5 w-3.5" />}
                  sx={{ textTransform: 'none', fontSize: '0.725rem' }}
                >
                  👁️ Strict View Only (Read Only, 🔒 Mask Finances)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => applyPreset('CLEAR')}
                  sx={{ textTransform: 'none', fontSize: '0.725rem' }}
                >
                  🧹 Clear All
                </Button>
              </div>
            </div>

            {/* Granular Module Configuration Matrix */}
            <div className="space-y-4 pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">Module Access & Granular Actions Matrix</h4>
                  <p className="text-xs text-neutral-500">Configure exact access rules per module route.</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {moduleGroups.map((groupName) => {
                  const groupModules = ALL_MODULES.filter(m => m.group === groupName);

                  return (
                    <Paper key={groupName} variant="outlined" sx={{ p: 2, bgcolor: '#ffffff', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200">
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-700">{groupName}</span>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {groupModules.length} Modules
                        </div>
                      </div>

                      <div className="space-y-3">
                        {groupModules.map((mod) => {
                          const rule = permMap[mod.path] || { read: false, write: false, delete: false, hideFinancials: false };

                          return (
                            <div
                              key={mod.path}
                              className={`p-2.5 rounded-md border transition ${
                                rule.read ? 'bg-amber-50/20 border-amber-200/80' : 'bg-neutral-50/50 border-neutral-200/60 opacity-70'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-bold ${rule.read ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                      {mod.name}
                                    </span>
                                    <code className="text-[9px] text-neutral-400 font-mono">{mod.path}</code>
                                    {mod.hasFinancials && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                                        Includes Financials
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Granular Action Switches */}
                                <div className="flex flex-wrap items-center gap-3 bg-white px-3 py-1.5 rounded border border-neutral-200 shadow-2xs">
                                  {/* Read / Access Switch */}
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={rule.read}
                                        onChange={() => handleToggleRead(mod.path)}
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <span className={`text-[11px] ${rule.read ? 'font-bold text-neutral-900' : 'text-neutral-400'}`}>
                                        👁️ Read
                                      </span>
                                    }
                                    sx={{ m: 0 }}
                                  />

                                  {/* Write / Edit Switch */}
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={rule.write}
                                        disabled={!rule.read}
                                        onChange={() => handleToggleWrite(mod.path)}
                                        color="info"
                                      />
                                    }
                                    label={
                                      <span className={`text-[11px] ${rule.write ? 'font-bold text-blue-700' : 'text-neutral-400'}`}>
                                        ✏️ Write
                                      </span>
                                    }
                                    sx={{ m: 0 }}
                                  />

                                  {/* Delete Switch */}
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={rule.delete}
                                        disabled={!rule.read}
                                        onChange={() => handleToggleDelete(mod.path)}
                                        color="error"
                                      />
                                    }
                                    label={
                                      <span className={`text-[11px] ${rule.delete ? 'font-bold text-red-700' : 'text-neutral-400'}`}>
                                        🗑️ Delete
                                      </span>
                                    }
                                    sx={{ m: 0 }}
                                  />

                                  {/* Hide Financials Switch (Highlighted Privacy Guard) */}
                                  <div className="pl-2 border-l border-neutral-200">
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          size="small"
                                          checked={rule.hideFinancials}
                                          disabled={!rule.read}
                                          onChange={() => handleToggleHideFinancials(mod.path)}
                                          color="warning"
                                        />
                                      }
                                      label={
                                        <span className={`text-[11px] inline-flex items-center space-x-1 ${rule.hideFinancials ? 'font-extrabold text-amber-700' : 'text-neutral-400'}`}>
                                          <Lock className="h-3 w-3 text-amber-600 mr-0.5 inline" />
                                          <span>Mask Finances</span>
                                        </span>
                                      }
                                      sx={{ m: 0 }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Paper>
                  );
                })}
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#fafafa', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setModalOpen(false)} size="small" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving} size="small" sx={{ fontWeight: 700, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}>
              {saving ? 'Saving...' : 'Save Upgraded Permissions'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
