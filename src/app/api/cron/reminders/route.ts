import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendClientPreShootReminder, sendCrewPreShootReminder } from '@/lib/email';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    return await processReminders();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await processReminders();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processReminders() {
  // Calculate tomorrow's date string (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${year}-${month}-${day}`;

  // Find all booking events scheduled for tomorrow
  const upcomingEvents = await prisma.bookingEvent.findMany({
    where: {
      eventDate: tomorrowStr
    },
    include: {
      event: true,
      booking: {
        include: { client: true }
      },
      assignments: {
        include: { employee: true }
      }
    }
  });

  let clientEmailsSent = 0;
  let crewEmailsSent = 0;
  const auditDetails: string[] = [];

  for (const be of upcomingEvents) {
    const client = be.booking?.client;
    const eventName = be.event?.name || 'Shoot Session';
    const crewList = (be.assignments || []).map((a: any) => ({
      name: a.employee?.name || 'Staff Member',
      role: a.role || a.employee?.role || 'CREW',
      phone: a.employee?.phone,
      employmentType: a.employee?.employmentType || 'FULL_TIME'
    }));

    // 1. Send 1-Day Pre-Shoot Reminder Email to Client with Assigned Crew List
    if (client && client.email) {
      const res = await sendClientPreShootReminder({
        to: client.email,
        clientName: client.name,
        eventName,
        eventDate: be.eventDate,
        eventTime: be.eventTime || '09:00 AM',
        venue: be.venue || undefined,
        crew: crewList
      });
      if (res.success) {
        clientEmailsSent++;
      }
    }

    // 2. Send 1-Day Pre-Shoot Call Sheet Reminder Email to each Assigned Crew Member
    for (const assignment of be.assignments || []) {
      const emp = assignment.employee;
      if (emp && emp.email) {
        const res = await sendCrewPreShootReminder({
          to: emp.email,
          crewName: emp.name,
          dutyRole: assignment.role,
          eventName,
          eventDate: be.eventDate,
          eventTime: be.eventTime || '09:00 AM',
          venue: be.venue || undefined,
          clientName: client?.name,
          clientPhone: client?.phone
        });
        if (res.success) {
          crewEmailsSent++;
        }
      }
    }

    auditDetails.push(`${eventName} (${client?.name || 'Client'}) - ${crewList.length} crew assigned`);
  }

  // Record System Audit Log
  await createAuditLog(
    'SYSTEM',
    'CRON_REMINDERS',
    `Sent 1-Day Pre-Shoot Reminders for ${upcomingEvents.length} events (Client emails: ${clientEmailsSent}, Crew emails: ${crewEmailsSent})`
  );

  return NextResponse.json({
    success: true,
    tomorrowDate: tomorrowStr,
    eventsCount: upcomingEvents.length,
    clientEmailsSent,
    crewEmailsSent,
    auditDetails
  });
}
