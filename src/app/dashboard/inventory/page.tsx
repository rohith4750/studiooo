'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Plus, Search, Trash2, Edit3, Wrench, CheckCircle, Filter
} from 'lucide-react';
import { TextField, Select, MenuItem, InputAdornment, FormControl } from '@mui/material';

const CATEGORIES = ['CAMERA', 'LENS', 'DRONE', 'GIMBAL', 'LIGHT', 'BATTERY', 'MEMORY_CARD', 'TRIPOD'];
const STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'LOST'];

export default function InventoryPage() {
  const router = useRouter();
  const { inventory, fetchData, updateRecord, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { fetchData('inventory').finally(() => setLoading(false)); }, [fetchData]);

  const handleDeleteItem = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to remove this equipment from studio inventory?', { title: 'Confirm Removal' });
    if (ok) {
      try { await deleteRecord('inventory', id); toast('Equipment removed.', 'success'); }
      catch (err) { toast('Failed to delete item: ' + err, 'error'); }
    }
  };

  const handleUpdateStatus = async (item: any, status: string) => {
    try {
      await updateRecord('inventory', { id: item.id, status });
      toast(`Equipment status updated to ${status}`, 'success');
    } catch (e) { toast('Status update failed: ' + e, 'error'); }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ASSIGNED': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'MAINTENANCE': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'LOST': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const totalCount = inventory.length;
  const availableCount = inventory.filter(i => i.status === 'AVAILABLE').length;
  const maintenanceCount = inventory.filter(i => i.status === 'MAINTENANCE').length;
  const lostCount = inventory.filter(i => i.status === 'LOST').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">Studio Inventory Ledger</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Track cameras, lenses, drones, and equipment health logs.</p>
        </div>
        <button onClick={() => router.push('/dashboard/inventory/create')} className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded transition duration-150 cursor-pointer shadow-xs">
          <Plus className="h-4 w-4" /><span>Add Equipment</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded text-center"><span className="text-[10px] uppercase font-bold text-neutral-400">Total Assets</span><p className="text-xl font-extrabold text-neutral-700 mt-1">{totalCount}</p></div>
        <div className="glass-card p-4 rounded text-center"><span className="text-[10px] uppercase font-bold text-emerald-500">Available</span><p className="text-xl font-extrabold text-emerald-600 mt-1">{availableCount}</p></div>
        <div className="glass-card p-4 rounded text-center"><span className="text-[10px] uppercase font-bold text-amber-500">Under Repair</span><p className="text-xl font-extrabold text-amber-600 mt-1">{maintenanceCount}</p></div>
        <div className="glass-card p-4 rounded text-center"><span className="text-[10px] uppercase font-bold text-red-500">Marked Lost</span><p className="text-xl font-extrabold text-red-600 mt-1">{lostCount}</p></div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <TextField 
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search by equipment name or serial..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ '& .MuiInputBase-root': { height: 36, fontSize: '0.75rem' } }}
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-500 font-medium">Category:</span>
            <FormControl size="small">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 120, height: 36, fontSize: '0.75rem' }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-neutral-500 font-medium">Status:</span>
            <FormControl size="small">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 120, height: 36, fontSize: '0.75rem' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="glass-card rounded overflow-hidden border border-neutral-200/50">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading inventory database...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No equipment items found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Asset Details</th><th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Serial Code</th><th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4">Notes</th><th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-neutral-800">{item.name}</td>
                    <td className="py-3.5 px-4"><span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold">{item.category}</span></td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-neutral-400">{item.serialNumber}</td>
                    <td className="py-3.5 px-4"><span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-wide ${getStatusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3.5 px-4 text-neutral-500 truncate max-w-[150px]">{item.notes || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {item.status !== 'MAINTENANCE' && <button onClick={() => handleUpdateStatus(item, 'MAINTENANCE')} title="Send to Maintenance" className="p-1.5 hover:bg-neutral-100 text-amber-500 rounded"><Wrench className="h-4 w-4" /></button>}
                        {item.status !== 'AVAILABLE' && <button onClick={() => handleUpdateStatus(item, 'AVAILABLE')} title="Mark Available" className="p-1.5 hover:bg-neutral-100 text-emerald-600 rounded"><CheckCircle className="h-4 w-4" /></button>}
                        <button onClick={() => router.push(`/dashboard/inventory/create?itemId=${item.id}`)} title="Edit Details" className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteItem(item.id)} title="Remove Asset" className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
