'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Settings, Building, Percent, FileText, Database, Shield, 
  Sparkles, CheckCircle2, Save, Download 
} from 'lucide-react';
import { TextField } from '@mui/material';

export default function SettingsPage() {
  const { clients, bookings, leads, payments, expenses } = useStore();
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [studioName, setStudioName] = useState('R2R Studio');
  const [studioEmail, setStudioEmail] = useState('contact@r2rstudio.com');
  const [studioPhone, setStudioPhone] = useState('+91 98765 43210');
  const [studioAddress, setStudioAddress] = useState('102, Shanti Vihar, Jayanagar, Bengaluru');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [bookingPrefix, setBookingPrefix] = useState('R2R-');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('ERP Configuration saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Mock backup generator
  const handleBackupDatabase = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      studio: { name: studioName, email: studioEmail, phone: studioPhone, address: studioAddress },
      metrics: { invoicePrefix, bookingPrefix },
      data: { clients, bookings, leads, payments, expenses }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `r2r_studio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-800">ERP Configurations</h2>
        <p className="text-xs text-neutral-500 mt-0.5 font-medium">Configure corporate details, HSN tax configurations, and system backups.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded flex items-center space-x-2 text-xs">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Grid: Forms & Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-5 text-xs text-neutral-700">
        
        {/* Core settings form (Left) */}
        <div className="glass-card p-5 rounded border border-neutral-200/50 lg:col-span-2">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* Studio Identity */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-neutral-800 flex items-center space-x-1.5 border-b border-neutral-100 pb-2">
                <Building className="h-4.5 w-4.5 text-primary-500" />
                <span>Studio Corporate Profile</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Studio Corporate Name"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Support Email"
                    type="email"
                    value={studioEmail}
                    onChange={(e) => setStudioEmail(e.target.value)}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Corporate Hotline"
                    value={studioPhone}
                    onChange={(e) => setStudioPhone(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Registered Address"
                    value={studioAddress}
                    onChange={(e) => setStudioAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Prefix & Booking settings */}
            <div className="space-y-3">
              <h3 className="font-bold text-neutral-800 flex items-center space-x-1.5 border-b border-neutral-100 pb-2">
                <Percent className="h-4.5 w-4.5 text-primary-500" />
                <span>Invoice & Booking Settings</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Invoice Code Prefix"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    label="Booking Number Prefix"
                    value={bookingPrefix}
                    onChange={(e) => setBookingPrefix(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="submit"
                className="inline-flex items-center space-x-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save ERP Settings</span>
              </button>
            </div>

          </form>
        </div>

        {/* Database backups & System specifications (Right) */}
        <div className="space-y-4">
          
          {/* Backup Database */}
          <div className="glass-card p-5 rounded border border-neutral-200/50 space-y-4">
            <h3 className="font-bold text-neutral-800 flex items-center space-x-1.5 border-b border-neutral-100 pb-2">
              <Database className="h-4.5 w-4.5 text-primary-500" />
              <span>Backups & recovery</span>
            </h3>
            
            <p className="text-[10px] text-neutral-400">
              Export a snapshot of all Clients, Bookings, Leads, Payments, and Expenses into a local JSON backup file.
            </p>

            <button
              onClick={handleBackupDatabase}
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded font-bold cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Database JSON</span>
            </button>
          </div>

          {/* Role access brief matrix */}
          <div className="glass-card p-5 rounded border border-neutral-200/50 space-y-4">
            <h3 className="font-bold text-neutral-800 flex items-center space-x-1.5 border-b border-neutral-100 pb-2">
              <Shield className="h-4.5 w-4.5 text-primary-500" />
              <span>Authorization Roles Matrix</span>
            </h3>
            
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between border-b border-neutral-100 pb-1 font-bold text-neutral-800">
                <span>Role Name</span>
                <span>Access Coverage</span>
              </div>
              <div className="flex justify-between">
                <span>Admin</span>
                <span className="text-primary-600 font-bold">100% Full Access</span>
              </div>
              <div className="flex justify-between">
                <span>Manager</span>
                <span className="text-neutral-500 font-semibold">Director & Bookings</span>
              </div>
              <div className="flex justify-between">
                <span>Photographer</span>
                <span className="text-neutral-500 font-semibold">Assigns & Schedules</span>
              </div>
              <div className="flex justify-between">
                <span>Editor</span>
                <span className="text-neutral-500 font-semibold">Editing & Raw Uploads</span>
              </div>
              <div className="flex justify-between">
                <span>Accountant</span>
                <span className="text-neutral-500 font-semibold">Invoices & Cash Ledger</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
