import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALL_MODULES = [
  '/dashboard', '/dashboard/reports', '/dashboard/leads', '/dashboard/marketing',
  '/dashboard/clients', '/dashboard/bookings', '/dashboard/bookings/status',
  '/dashboard/billing', '/dashboard/quotations', '/dashboard/work-updates',
  '/dashboard/assignments', '/dashboard/workflows', '/dashboard/packages',
  '/dashboard/events', '/dashboard/inventory', '/dashboard/expenses',
  '/dashboard/photographers', '/dashboard/employees', '/dashboard/attendance',
  '/dashboard/users', '/dashboard/roles', '/dashboard/settings'
];

const buildPerms = (paths: string[], write = true, del = false, hideFinancials = false) => {
  const map: Record<string, any> = {};
  paths.forEach(p => {
    map[p] = { read: true, write, delete: del, hideFinancials };
  });
  return map;
};

async function main() {
  console.log('🌱 Starting Production Database Seeding for Neon PostgreSQL...');

  // 1. Seed Initial Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@r2r.com' },
    update: {
      role: 'SUPER_ADMIN',
      name: 'R2R Super Admin',
      password: 'admin123',
    },
    create: {
      email: 'admin@r2r.com',
      name: 'R2R Super Admin',
      password: 'admin123',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin created/updated:', superAdmin.email);

  // 2. Seed Initial Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'studio@r2r.com' },
    update: {
      role: 'ADMIN',
      name: 'R2R Studio Admin',
      password: 'admin123',
    },
    create: {
      email: 'studio@r2r.com',
      name: 'R2R Studio Admin',
      password: 'admin123',
      role: 'ADMIN',
    },
  });
  console.log('✅ Studio Admin created/updated:', adminUser.email);

  // 3. Seed Built-in System Roles with Upgraded Granular & Financial Masking Rules
  const rolesToSeed = [
    {
      roleName: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Unrestricted top-level access to all system modules, security, financial data, and configuration.',
      isSystem: true,
      permissions: buildPerms(ALL_MODULES, true, true, false),
    },
    {
      roleName: 'ADMIN',
      displayName: 'Studio Administrator',
      description: 'Full operational access to manage studio bookings, staff, billing, shoot schedules, and workflows.',
      isSystem: true,
      permissions: buildPerms(ALL_MODULES, true, true, false),
    },
    {
      roleName: 'MANAGER',
      displayName: 'Studio Manager',
      description: 'Operational manager for bookings, client communications, shoot assignments, and staff workflow.',
      isSystem: false,
      permissions: buildPerms(
        [
          '/dashboard', '/dashboard/leads', '/dashboard/marketing', '/dashboard/clients',
          '/dashboard/bookings', '/dashboard/bookings/status', '/dashboard/billing',
          '/dashboard/quotations', '/dashboard/work-updates', '/dashboard/assignments',
          '/dashboard/workflows', '/dashboard/packages', '/dashboard/events',
          '/dashboard/inventory', '/dashboard/photographers', '/dashboard/employees', '/dashboard/attendance'
        ],
        true, false, false
      ),
    },
    {
      roleName: 'RECEPTIONIST',
      displayName: 'Front Desk Receptionist',
      description: 'Handles client inquiries, booking contracts, basic invoicing, quotation studio, and packages.',
      isSystem: false,
      permissions: buildPerms(
        [
          '/dashboard', '/dashboard/leads', '/dashboard/marketing', '/dashboard/clients',
          '/dashboard/bookings', '/dashboard/bookings/status', '/dashboard/billing',
          '/dashboard/quotations', '/dashboard/packages', '/dashboard/events', '/dashboard/work-updates'
        ],
        true, false, false
      ),
    },
    {
      roleName: 'PHOTOGRAPHER',
      displayName: 'Lead Photographer & Crew',
      description: 'Access to shoot schedules, daily work logs, assigned bookings, and equipment. Financial totals are masked.',
      isSystem: false,
      permissions: buildPerms(
        [
          '/dashboard', '/dashboard/assignments', '/dashboard/work-updates',
          '/dashboard/inventory', '/dashboard/photographers', '/dashboard/bookings/status'
        ],
        true, false, true // hideFinancials = true
      ),
    },
    {
      roleName: 'EDITOR',
      displayName: 'Post-Production Editor',
      description: 'Access to post-production editing tasks, album reviewing, raw backups, and work updates with financial privacy.',
      isSystem: false,
      permissions: buildPerms(
        [
          '/dashboard', '/dashboard/workflows', '/dashboard/work-updates', '/dashboard/bookings/status'
        ],
        true, false, true // hideFinancials = true
      ),
    },
    {
      roleName: 'ACCOUNTANT',
      displayName: 'Finance & Accountant',
      description: 'Access to billing, invoices, quotes, cash ledger, expenses, and payroll reports.',
      isSystem: false,
      permissions: buildPerms(
        [
          '/dashboard', '/dashboard/reports', '/dashboard/billing', '/dashboard/quotations',
          '/dashboard/expenses', '/dashboard/attendance'
        ],
        true, true, false
      ),
    },
  ];

  for (const r of rolesToSeed) {
    await (prisma as any).rolePermission.upsert({
      where: { roleName: r.roleName },
      update: {
        displayName: r.displayName,
        description: r.description,
        isSystem: r.isSystem,
        permissions: JSON.stringify(r.permissions),
      },
      create: {
        roleName: r.roleName,
        displayName: r.displayName,
        description: r.description,
        isSystem: r.isSystem,
        permissions: JSON.stringify(r.permissions),
      },
    });
  }
  console.log('✅ System & dynamic roles with granular permissions seeded successfully.');

  // 4. Seed Marketing Content default row
  await (prisma as any).marketingContent.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroBadge: 'Premium Wedding & Event Cinematography',
      heroTitle: 'Preserving Your Most Precious Love Stories',
      heroSubtitle: 'Welcome to R2R Studio. We craft timeless wedding films, candid portraits, pre-wedding concept shoots, and aerial drone cinematography with unmatched artistry.',
      showreelUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      aboutTitle: "Crafting Visual Stories That Stay Alive Forever",
      aboutDescription: "Founded with a passion for romance, emotion, and aesthetic perfection, R2R Studio has grown into one of South India's most sought-after wedding cinematography studios.",
      weddingsCount: 450,
      citiesCount: 35,
      rating: 4.9,
      promoBannerText: '✨ Special Season Offer: Book Your Wedding Cinematography Package & Get Complimentary Pre-Wedding Shoot!',
      promoBannerActive: true,
      ctaText: 'Request Custom Quote',
    },
  });
  console.log('✅ Marketing content row initialized.');

  console.log('🎉 Production Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
