import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createAuditLog } from '@/lib/audit';
import { sendQuotationEmail, sendInvoiceEmail } from '@/lib/email';

async function triggerAutomatedSmtpEmails(modelName: string, record: any, action: 'CREATE' | 'UPDATE') {
  try {
    if (modelName === 'booking' || modelName === 'quotation' || modelName === 'invoice') {
      const bookingId = record.bookingId || record.id;
      if (!bookingId) return;

      const fullBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          client: true,
          bookingEvents: { include: { event: true } }
        }
      });

      if (!fullBooking || !fullBooking.client || !fullBooking.client.email) return;

      const status = record.status || fullBooking.status;

      if (status === 'QUOTATION' || modelName === 'quotation') {
        sendQuotationEmail({
          to: fullBooking.client.email,
          clientName: fullBooking.client.name,
          bookingNumber: fullBooking.bookingNumber,
          grandTotal: fullBooking.grandTotal,
          events: fullBooking.bookingEvents,
          quotationId: record.id
        }).catch(err => console.error('[SMTP Background Dispatch Error]', err));
      } else if (modelName === 'invoice' || status === 'CONFIRMED' || status === 'INVOICE') {
        sendInvoiceEmail({
          to: fullBooking.client.email,
          clientName: fullBooking.client.name,
          invoiceNumber: record.invoiceNumber || `INV-${fullBooking.bookingNumber}`,
          bookingNumber: fullBooking.bookingNumber,
          subtotal: fullBooking.subtotal || 0,
          gstAmount: fullBooking.gstAmount || 0,
          grandTotal: fullBooking.grandTotal || 0,
          paidAmount: fullBooking.paidAmount || 0,
          balance: fullBooking.balance || 0
        }).catch(err => console.error('[SMTP Background Dispatch Error]', err));
      }
    }
  } catch (err) {
    console.error(`[SMTP Dispatch Error] Failed to process automated email:`, err);
  }
}

// Map URL parameter names to Prisma model names
const MODEL_MAPPING: Record<string, any> = {
  users: 'user',
  clients: 'client',
  leads: 'lead',
  events: 'eventMaster',
  packages: 'package',
  bookings: 'booking',
  bookingevents: 'bookingEvent',
  assignments: 'assignment',
  employees: 'employee',
  payments: 'payment',
  quotations: 'quotation',
  invoices: 'invoice',
  albums: 'album',
  deliveries: 'delivery',
  inventory: 'inventory',
  inventorylogs: 'inventoryLog',
  expenses: 'expense',
  notifications: 'notification',
  auditlogs: 'auditLog',
  attendances: 'attendance' as any,
  workupdates: 'workUpdate',
  rolepermissions: 'rolePermission',
};

// Role-Based Access Control configuration
// Deny list by role for specific tables
const ROLE_DENY_LIST: Record<string, string[]> = {
  SUPER_ADMIN: [],
  ADMIN: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { model } = await params;
  const modelName = MODEL_MAPPING[model.toLowerCase()];
  
  if (!modelName) {
    return NextResponse.json({ error: `Model '${model}' not found` }, { status: 404 });
  }

  // Check role access - return empty array gracefully for restricted tables
  const deniedTables = ROLE_DENY_LIST[user.role] || [];
  if (deniedTables.includes(modelName as string) && !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json([]);
  }

  const url = new URL(req.url);
  
  // Parse query parameters
  const filterParam = url.searchParams.get('filter');
  const includeParam = url.searchParams.get('include');
  const orderByParam = url.searchParams.get('orderBy');

  const queryOptions: any = {};

  if (filterParam) {
    try {
      queryOptions.where = JSON.parse(filterParam);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid filter JSON' }, { status: 400 });
    }
  }

  if (includeParam) {
    try {
      queryOptions.include = JSON.parse(includeParam);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid include JSON' }, { status: 400 });
    }
  }

  if (orderByParam) {
    try {
      queryOptions.orderBy = JSON.parse(orderByParam);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid orderBy JSON' }, { status: 400 });
    }
  }

  // Row-level security for Managers
  if (user.role === 'MANAGER' && (modelName === 'employee' || modelName === 'attendance')) {
    queryOptions.where = {
      ...queryOptions.where,
      ...(modelName === 'employee' ? { managerId: user.id } : { employee: { managerId: user.id } })
    };
  }

  try {
    const delegate = prisma[modelName] as any;
    const items = await delegate.findMany(queryOptions);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error(`Error fetching ${String(modelName)}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { model } = await params;
  const modelName = MODEL_MAPPING[model.toLowerCase()];

  if (!modelName) {
    return NextResponse.json({ error: `Model '${model}' not found` }, { status: 404 });
  }

  // Check role access (mutations denied list)
  const deniedTables = ROLE_DENY_LIST[user.role] || [];
  if (deniedTables.includes(modelName as string) && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied for this role' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const delegate = prisma[modelName] as any;
    const created = await delegate.create({ data: body });

    // Format human-readable audit summary
    const itemLabel = created.invoiceNumber || created.quotationNumber || created.bookingNumber || created.name || created.title || created.email || `ID: ${created.id}`;
    await createAuditLog(user.id, 'CREATE', `Created ${String(modelName)} (${itemLabel})`);

    // Trigger automated email dispatch asynchronously
    triggerAutomatedSmtpEmails(modelName, created, 'CREATE');

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error(`Error creating ${String(modelName)}:`, error);
    if (error.code === 'P2002') {
      const target = error.meta?.target ? ` (${(error.meta.target as string[]).join(', ')})` : '';
      return NextResponse.json({ error: `A record with this unique value${target} already exists.` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { model } = await params;
  const modelName = MODEL_MAPPING[model.toLowerCase()];

  if (!modelName) {
    return NextResponse.json({ error: `Model '${model}' not found` }, { status: 404 });
  }

  // Check role access
  const deniedTables = ROLE_DENY_LIST[user.role] || [];
  if (deniedTables.includes(modelName as string) && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied for this role' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required for updates' }, { status: 400 });
    }

    const delegate = prisma[modelName] as any;
    const updated = await delegate.update({
      where: { id },
      data,
    });

    // Format human-readable audit summary
    const itemLabel = updated.invoiceNumber || updated.quotationNumber || updated.bookingNumber || updated.name || updated.title || updated.email || `ID: ${id}`;
    await createAuditLog(user.id, 'UPDATE', `Updated ${String(modelName)} (${itemLabel})`);

    // Trigger automated email dispatch asynchronously
    triggerAutomatedSmtpEmails(modelName, updated, 'UPDATE');

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(`Error updating ${String(modelName)}:`, error);
    if (error.code === 'P2002') {
      const target = error.meta?.target ? ` (${(error.meta.target as string[]).join(', ')})` : '';
      return NextResponse.json({ error: `A record with this unique value${target} already exists.` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const user = getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { model } = await params;
  const modelName = MODEL_MAPPING[model.toLowerCase()];

  if (!modelName) {
    return NextResponse.json({ error: `Model '${model}' not found` }, { status: 404 });
  }

  if (!user.role) {
    return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const bookingId = url.searchParams.get('bookingId');
    const filterParam = url.searchParams.get('filter');

    const delegate = prisma[modelName] as any;

    if (id) {
      const deleted = await delegate.delete({
        where: { id },
      });
      await createAuditLog(user.id, 'DELETE', `Deleted ${String(modelName)} (ID: ${id})`);
      return NextResponse.json(deleted);
    }

    if (bookingId) {
      const deletedMany = await delegate.deleteMany({
        where: { bookingId },
      });
      await createAuditLog(user.id, 'DELETE', `Deleted records of ${String(modelName)} for booking ${bookingId}`);
      return NextResponse.json(deletedMany);
    }

    if (filterParam) {
      const whereFilter = JSON.parse(filterParam);
      const deletedMany = await delegate.deleteMany({
        where: whereFilter,
      });
      await createAuditLog(user.id, 'DELETE', `Deleted records of ${String(modelName)} with filter`);
      return NextResponse.json(deletedMany);
    }

    return NextResponse.json({ error: 'Record ID or filter criteria is required for deletion' }, { status: 400 });
  } catch (error: any) {
    console.error(`Error deleting ${String(modelName)}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
