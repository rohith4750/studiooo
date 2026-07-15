import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('Connecting to production DB to clear data (except Users)...');

  // Deleting bottom-up to respect foreign keys, though some have Cascade
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

  console.log('All production data cleared successfully, except User table.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
