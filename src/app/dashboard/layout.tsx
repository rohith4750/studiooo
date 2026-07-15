'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Camera, LayoutDashboard, Users, UserSquare2, CalendarDays, 
  FileText, ClipboardList, PenTool, HardDrive, Receipt, 
  Settings, LogOut, BarChart3, Menu, X, ShieldAlert, Box as BoxIcon, Flame,
  CheckCircle2
} from 'lucide-react';
import { ToastProvider } from '@/components/ToastProvider';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@/theme/muiTheme';
import { 
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Typography, Avatar, Chip, IconButton, Stack, Button, Menu as MuiMenu, MenuItem 
} from '@mui/material';

const MENU_GROUPS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'ACCOUNTANT', 'PHOTOGRAPHER', 'EDITOR'] },
      { name: 'Reports', path: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN', 'ACCOUNTANT'] },
    ]
  },
  {
    title: 'Sales & Customers',
    items: [
      { name: 'Inquiries', path: '/dashboard/leads', icon: UserSquare2, roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
      { name: 'Clients', path: '/dashboard/clients', icon: Users, roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
      { name: 'Bookings', path: '/dashboard/bookings', icon: CalendarDays, roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
      { name: 'Track Status', path: '/dashboard/bookings/status', icon: CheckCircle2, roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'] },
      { name: 'Invoices & Quotes', path: '/dashboard/billing', icon: FileText, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'] },
    ]
  },
  {
    title: 'Work & Operations',
    items: [
      { name: 'Shoot Schedule', path: '/dashboard/assignments', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'PHOTOGRAPHER'] },
      { name: 'Editing Tasks', path: '/dashboard/workflows', icon: PenTool, roles: ['ADMIN', 'MANAGER', 'EDITOR', 'PHOTOGRAPHER'] },
      { name: 'Pricing Packages', path: '/dashboard/packages', icon: BoxIcon, roles: ['ADMIN', 'MANAGER'] },
      { name: 'Event Types', path: '/dashboard/events', icon: Flame, roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    title: 'Finance & Gear',
    items: [
      { name: 'Equipment', path: '/dashboard/inventory', icon: HardDrive, roles: ['ADMIN', 'MANAGER', 'PHOTOGRAPHER'] },
      { name: 'Expenses', path: '/dashboard/expenses', icon: Receipt, roles: ['ADMIN', 'ACCOUNTANT'] },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', path: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchSession, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (!session) {
        router.push('/');
      } else {
        setLoading(false);
      }
    });
  }, [fetchSession, router]);

  // Auto-close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50 text-neutral-800">
        <div className="text-center space-y-4">
          <Camera className="mx-auto h-12 w-12 animate-spin text-primary-500" />
          <p className="text-sm font-medium tracking-wide text-neutral-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Filter menu items by user role
  const filteredGroups = MENU_GROUPS.map((group) => {
    const allowedItems = group.items.filter(
      (item) => user && item.roles.includes(user.role)
    );
    return {
      ...group,
      items: allowedItems,
    };
  }).filter((group) => group.items.length > 0);

  const allowedMenuItems = filteredGroups.flatMap((group) => group.items);

  return (
    <ToastProvider>
      <ThemeProvider theme={muiTheme}>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Desktop Sidebar */}
      <Box component="aside" sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', width: 256, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'primary.light', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'primary.light', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'background.default' }}>
          <Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
            <Camera className="h-5 w-5" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', tracking: 'tight' }}>R2R Studio</Typography>
            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 500, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ERP & CRM</Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, px: 1.5, py: 2, overflowY: 'auto' }}>
          {filteredGroups.map((group) => (
            <Box key={group.title} sx={{ mb: 2 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 1.5, 
                  mb: 0.5, 
                  display: 'block', 
                  fontSize: 9, 
                  fontWeight: 600, 
                  color: 'text.secondary', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.075em',
                  opacity: 0.8
                }}
              >
                {group.title}
              </Typography>
              <List sx={{ p: 0 }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <ListItem disablePadding key={item.name} sx={{ mb: 0.25 }}>
                      <ListItemButton
                        onClick={() => router.push(item.path)}
                        selected={isActive}
                        sx={{
                          borderRadius: 0.5,
                          py: 0.6,
                          px: 1.5,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'primary.contrastText',
                            },
                          },
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark',
                            '& .MuiListItemIcon-root': {
                              color: 'primary.dark',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28, color: isActive ? 'primary.contrastText' : 'text.secondary' }}>
                          <Icon className="h-4 w-4" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography sx={{ fontSize: 11.5, fontWeight: isActive ? 600 : 400, letterSpacing: '0.01em' }}>
                              {item.name}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Panel Wrapper */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Toolbar */}
        <Box component="header" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: { xs: 'space-between', lg: 'flex-end' }, 
          py: 1.5, 
          px: { xs: 2, sm: 3, lg: 4 }, 
          bgcolor: 'background.paper', 
          borderBottom: '1px solid', 
          borderColor: 'primary.light', 
          flexShrink: 0 
        }}>
          {/* Mobile Only Logo & Hamburger */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1 }}>
            <Camera className="h-5 w-5 text-primary-500" />
            <Typography sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.02em', fontSize: 14 }}>R2R ERP</Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ bgcolor: 'background.default', borderRadius: 0.5, ml: 1 }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </IconButton>
          </Box>

          {/* User Profile Dropdown */}
          <Box>
            <Button
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              sx={{ textTransform: 'none', borderRadius: 0.5, p: 0.5, pr: 1.5 }}
              color="inherit"
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 13, fontWeight: 'bold' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary', display: 'block', lineHeight: 1.2 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 9, color: 'primary.main', fontWeight: 600, textTransform: 'uppercase' }}>
                    {user?.role}
                  </Typography>
                </Box>
              </Stack>
            </Button>
            <MuiMenu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={() => setProfileAnchorEl(null)}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    minWidth: 160,
                    borderRadius: 0.5,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => setProfileAnchorEl(null)} sx={{ fontSize: 13 }}>
                <UserSquare2 className="h-4 w-4 mr-2 text-neutral-500" /> My Profile
              </MenuItem>
              <MenuItem onClick={logout} sx={{ fontSize: 13, color: 'error.main' }}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </MenuItem>
            </MuiMenu>
          </Box>
        </Box>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <Box sx={{ display: { lg: 'none' }, position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(3px)' }} onClick={() => setMobileMenuOpen(false)}>
            <Box sx={{ position: 'absolute', top: 64, left: 0, right: 0, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'primary.light', p: 2.5, boxShadow: 3, display: 'flex', flexDirection: 'column', gap: 1 }} onClick={(e) => e.stopPropagation()}>
              {allowedMenuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? 'contained' : 'text'}
                    color={isActive ? 'primary' : 'inherit'}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push(item.path);
                    }}
                    startIcon={<Icon className="h-4.5 w-4.5" />}
                    sx={{ justifyContent: 'flex-start', px: 2, py: 1, borderRadius: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>{item.name}</Typography>
                  </Button>
                );
              })}
              <Box sx={{ borderTop: '1px solid', borderColor: 'primary.light', pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{user?.name}</Typography>
                  <Typography sx={{ fontSize: 9, textTransform: 'uppercase', color: 'primary.main', fontWeight: 500 }}>{user?.role}</Typography>
                </Box>
                <Button
                  onClick={logout}
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<LogOut className="h-3.5 w-3.5" />}
                >
                  Log Out
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Scrollable Main Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fafafa' }}>
          <Box component="main" sx={{ p: { xs: 2, sm: 2.5, lg: 3 }, maxWidth: 1440, width: '100%', mx: 'auto' }}>
            {children}
          </Box>
        </Box>

        {/* Fixed Footer */}
        <Box component="footer" sx={{ width: '100%', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'primary.light', py: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 500, color: 'text.secondary' }}>© {new Date().getFullYear()} R2R Studio ERP. All rights reserved.</Typography>
          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 500, color: 'primary.main', opacity: 0.85 }}>Premium Studio CRM v1.0.0</Typography>
        </Box>
      </Box>
    </Box>
      </ThemeProvider>
    </ToastProvider>
  );
}
