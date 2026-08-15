import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Flushing database records (excluding User accounts)...');

  await prisma.$transaction([
    prisma.inventoryLog.deleteMany({}),
    prisma.assignment.deleteMany({}),
    prisma.attendance.deleteMany({}),
    prisma.delivery.deleteMany({}),
    prisma.album.deleteMany({}),
    prisma.invoice.deleteMany({}),
    prisma.quotation.deleteMany({}),
    prisma.payment.deleteMany({}),
    prisma.bookingEvent.deleteMany({}),
    prisma.booking.deleteMany({}),
    prisma.employee.deleteMany({}),
    prisma.inventory.deleteMany({}),
    prisma.package.deleteMany({}),
    prisma.eventMaster.deleteMany({}),
    prisma.lead.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.expense.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.auditLog.deleteMany({}),
  ]);

  const userCount = await prisma.user.count();
  console.log(`Successfully flushed all table records! Retained ${userCount} User accounts.`);
}

main()
  .catch((e) => {
    console.error('Error flushing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
