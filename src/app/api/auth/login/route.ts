import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/session';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    setSession(response, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Safely auto-mark Attendance for Employee on Login without blocking login if table query fails
    try {
      const localDateStr = new Date().toLocaleDateString('en-CA');
      const localTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      const employee = await prisma.employee.findUnique({
        where: { email: user.email.toLowerCase() },
      });

      if (employee) {
        const existingAttendance = await (prisma as any).attendance.findFirst({
          where: { employeeId: employee.id, date: localDateStr },
        });

        if (!existingAttendance) {
          await (prisma as any).attendance.create({
            data: {
              employeeId: employee.id,
              date: localDateStr,
              status: 'PRESENT',
              workDescription: `Auto-Logged at Studio Portal Login (${localTimeStr})`,
            },
          });
        }
      }
    } catch (attendanceErr) {
      console.warn('Non-blocking attendance log warning:', attendanceErr);
    }

    // Safely create Audit Log
    try {
      await createAuditLog(user.id, 'LOGIN', `User ${user.email} successfully logged in.`);
    } catch (auditErr) {
      console.warn('Non-blocking audit log warning:', auditErr);
    }

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
