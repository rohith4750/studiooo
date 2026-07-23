import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding event masters...');
  const events = [
    { name: 'Pre Wedding', defaultPrice: 25000, category: 'Photography', duration: '1 Day' },
    { name: 'Wedding', defaultPrice: 80000, category: 'Photography & Videography', duration: '1 Day' },
    { name: 'Haldi', defaultPrice: 15000, category: 'Photography', duration: 'Half Day' },
    { name: 'Mehendi', defaultPrice: 15000, category: 'Photography', duration: 'Half Day' },
    { name: 'Sangeet', defaultPrice: 20000, category: 'Photography & Videography', duration: '1 Day' },
    { name: 'Reception', defaultPrice: 40000, category: 'Photography & Videography', duration: '1 Day' },
    { name: 'Engagement', defaultPrice: 30000, category: 'Photography & Videography', duration: '1 Day' },
    { name: 'Baby Shower', defaultPrice: 25000, category: 'Photography', duration: 'Half Day' },
    { name: 'Drone Shoot', defaultPrice: 15000, category: 'Add-on', duration: 'Event' },
    { name: 'Live Streaming', defaultPrice: 20000, category: 'Add-on', duration: 'Event' },
    { name: 'Album Design', defaultPrice: 10000, category: 'Design', duration: 'Deliverable' },
  ];

  for (const ev of events) {
    const existing = await prisma.eventMaster.findFirst({ where: { name: ev.name } });
    if (!existing) {
      await prisma.eventMaster.create({ data: ev });
      console.log(`Created event: ${ev.name}`);
    } else {
      console.log(`Event already exists: ${ev.name}`);
    }
  }

  console.log('Seeding service packages...');
  const packages = [
    { name: 'Bronze', price: 30000, includedEvents: JSON.stringify(['Engagement']), photographers: 1, cinematographers: 0, drone: false, album: false },
    { name: 'Silver', price: 65000, includedEvents: JSON.stringify(['Engagement', 'Reception']), photographers: 1, cinematographers: 1, drone: false, album: true },
    { name: 'Gold', price: 110000, includedEvents: JSON.stringify(['Wedding', 'Reception']), photographers: 2, cinematographers: 1, drone: false, album: true },
    { name: 'Premium', price: 140000, includedEvents: JSON.stringify(['Pre Wedding', 'Wedding', 'Reception']), photographers: 2, cinematographers: 2, drone: true, album: true, complimentaryShoot: 'Pre Wedding' },
    { name: 'Luxury', price: 180000, includedEvents: JSON.stringify(['Pre Wedding', 'Wedding', 'Reception', 'Haldi', 'Sangeet']), photographers: 3, cinematographers: 2, drone: true, album: true, led: true, liveStreaming: true },
  ];

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({ where: { name: pkg.name } });
    if (!existing) {
      await prisma.package.create({ data: pkg });
      console.log(`Created package: ${pkg.name}`);
    } else {
      console.log(`Package already exists: ${pkg.name}`);
    }
  }

  console.log('Successfully seeded events and packages!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
