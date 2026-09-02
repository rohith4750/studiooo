import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Delete all transactional and CRM records bottom-up (except User accounts)
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.inventoryLog.deleteMany();
    await prisma.inventory.deleteMany();
    
    await prisma.delivery.deleteMany();
    await prisma.album.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.payment.deleteMany();
    
    await prisma.assignment.deleteMany();
    await prisma.bookingEvent.deleteMany();
    await prisma.booking.deleteMany();
    
    await prisma.package.deleteMany();
    await prisma.eventMaster.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.client.deleteMany();
    await prisma.employee.deleteMany();

    return NextResponse.json({
      success: true,
      message: 'Production database flushed successfully! All clients, leads, bookings, and records deleted (Users preserved).',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error flushing production database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to flush production database.' },
      { status: 500 }
    );
  }
}
