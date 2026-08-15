import { prisma } from '@/lib/prisma';

export async function createAuditLog(
  userId: string | undefined | null,
  action: string,
  details: string
) {
  try {
    let validUserId: string | null = null;
    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (existingUser) {
        validUserId = existingUser.id;
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: validUserId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log safely:', error);
  }
}
