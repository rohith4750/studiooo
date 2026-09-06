import React from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export interface ModulePermissionRule {
  read: boolean;
  write: boolean;
  delete: boolean;
  hideFinancials: boolean;
}

export type GranularPermissionsMap = Record<string, ModulePermissionRule>;

/**
 * Normalizes raw permissions stored in RolePermission model (either string array or object map)
 */
export function parseRolePermissions(permissionsRaw: any): GranularPermissionsMap {
  if (!permissionsRaw) return {};

  let parsed = permissionsRaw;
  if (typeof permissionsRaw === 'string') {
    try {
      parsed = JSON.parse(permissionsRaw);
    } catch (e) {
      return {};
    }
  }

  const map: GranularPermissionsMap = {};

  // Case 1: Legacy Array of path strings e.g. ["/dashboard", "/dashboard/bookings"]
  if (Array.isArray(parsed)) {
    parsed.forEach((item) => {
      if (typeof item === 'string') {
        map[item] = { read: true, write: true, delete: true, hideFinancials: false };
      } else if (item && typeof item === 'object' && item.path) {
        map[item.path] = {
          read: item.read ?? true,
          write: item.write ?? true,
          delete: item.delete ?? false,
          hideFinancials: item.hideFinancials ?? false,
        };
      }
    });
    return map;
  }

  // Case 2: Dictionary Object { "/dashboard": { read: true, write: false, ... } }
  if (typeof parsed === 'object') {
    Object.keys(parsed).forEach((path) => {
      const val = parsed[path];
      if (typeof val === 'boolean') {
        map[path] = { read: val, write: val, delete: val, hideFinancials: false };
      } else if (val && typeof val === 'object') {
        map[path] = {
          read: val.read ?? true,
          write: val.write ?? false,
          delete: val.delete ?? false,
          hideFinancials: val.hideFinancials ?? false,
        };
      }
    });
    return map;
  }

  return map;
}

/**
 * Check if user role has access to read a module route
 */
export function hasModuleAccess(userRole: string, path: string, rolePermissions: any[]): boolean {
  if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) return true;
  const roleRecord = rolePermissions?.find((r) => r.roleName === userRole);
  if (!roleRecord) return false;

  const permMap = parseRolePermissions(roleRecord.permissions);
  return permMap[path]?.read ?? false;
}

/**
 * Check if user role has permission to write/edit on a module
 */
export function canWriteModule(userRole: string, path: string, rolePermissions: any[]): boolean {
  if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) return true;
  const roleRecord = rolePermissions?.find((r) => r.roleName === userRole);
  if (!roleRecord) return false;

  const permMap = parseRolePermissions(roleRecord.permissions);
  return permMap[path]?.write ?? false;
}

/**
 * Check if user role has permission to delete on a module
 */
export function canDeleteModule(userRole: string, path: string, rolePermissions: any[]): boolean {
  if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) return true;
  const roleRecord = rolePermissions?.find((r) => r.roleName === userRole);
  if (!roleRecord) return false;

  const permMap = parseRolePermissions(roleRecord.permissions);
  return permMap[path]?.delete ?? false;
}

/**
 * Check if financials should be hidden/masked for a user role on a module
 */
export function shouldHideFinancials(userRole: string, path: string, rolePermissions: any[]): boolean {
  if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) return false; // Admins always see financials
  const roleRecord = rolePermissions?.find((r) => r.roleName === userRole);
  if (!roleRecord) return false;

  const permMap = parseRolePermissions(roleRecord.permissions);
  return permMap[path]?.hideFinancials ?? false;
}

/**
 * Custom hook to get granular permissions for a given module route
 */
export function usePermissions(modulePath?: string) {
  const { user, rolePermissions } = useStore();
  const pathname = usePathname();
  const targetPath = modulePath || pathname || '/dashboard';
  const userRole = user?.role || '';

  const canRead = hasModuleAccess(userRole, targetPath, rolePermissions);
  const canWrite = canWriteModule(userRole, targetPath, rolePermissions);
  const canDelete = canDeleteModule(userRole, targetPath, rolePermissions);
  const hideFinancials = shouldHideFinancials(userRole, targetPath, rolePermissions);

  return {
    canRead,
    canWrite,
    canDelete,
    hideFinancials,
    userRole,
    isSuperAdmin: userRole === 'SUPER_ADMIN',
    isAdmin: ['SUPER_ADMIN', 'ADMIN'].includes(userRole),
  };
}

/**
 * Utility to format financial numbers into text or fallback mask if hideFinancials is true
 */
export function formatFinancialAmount(
  value: number | string | null | undefined,
  hideFinancials: boolean,
  currency = '₹',
  fallback = '••••••'
): string {
  if (hideFinancials) return fallback;
  if (value === null || value === undefined) return '-';
  const formatted = typeof value === 'number' ? value.toLocaleString('en-IN') : value;
  return `${currency}${formatted}`;
}

/**
 * Component to display masked or formatted financial amounts based on permissions
 */
export function FinancialAmount({
  value,
  modulePath,
  currency = '₹',
  fallback = '••••••',
  className = '',
}: {
  value: number | string | null | undefined;
  modulePath?: string;
  currency?: string;
  fallback?: string;
  className?: string;
}) {
  const { user, rolePermissions } = useStore();
  const pathname = usePathname();
  const userRole = user?.role || '';
  const targetPath = modulePath || pathname || '/dashboard';

  const isMasked = shouldHideFinancials(userRole, targetPath, rolePermissions);

  if (isMasked) {
    return (
      <span
        className={`font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded text-xs select-none ${className}`}
        title="Financial information restricted for your role"
      >
        {fallback}
      </span>
    );
  }

  if (value === null || value === undefined) return <span className={className}>-</span>;

  const formatted = typeof value === 'number' ? value.toLocaleString('en-IN') : value;
  return <span className={className}>{currency}{formatted}</span>;
}
