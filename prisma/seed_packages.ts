import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PACKAGES = [
  {
    name: 'Silver Essential Bundle',
    description: 'Perfect for intimate weddings and 2-event celebrations. Includes traditional coverage and high-resolution album.',
    price: 175000,
    includedEvents: JSON.stringify(['Engagement', 'Wedding']),
    photographers: 2,
    cinematographers: 1,
    drone: false,
    album: true,
    led: false,
    liveStreaming: false,
    complimentaryShoot: 'Complimentary Parent Mini Album',
    active: true,
  },
  {
    name: 'Gold Cinematic Heritage',
    description: 'Our most popular tier for 3-day celebrations. Features candid photography, cinematic film, and 4K aerial drone coverage.',
    price: 380000,
    includedEvents: JSON.stringify(['Haldi', 'Sangeet', 'Wedding', 'Reception']),
    photographers: 3,
    cinematographers: 2,
    drone: true,
    album: true,
    led: true,
    liveStreaming: false,
    complimentaryShoot: 'Complimentary Pre-Wedding Outdoor Shoot',
    active: true,
  },
  {
    name: 'Platinum Luxury Royal Collection',
    description: 'Ultra-premium destination package with 4K drone aerials, live streaming, Same-Day Edit (SDE) reel, and luxury Canvera albums.',
    price: 650000,
    includedEvents: JSON.stringify(['Pre-Shoot', 'Haldi', 'Sangeet', 'Wedding', 'Reception']),
    photographers: 4,
    cinematographers: 3,
    drone: true,
    album: true,
    led: true,
    liveStreaming: true,
    complimentaryShoot: 'Complimentary Save-The-Date E-Card & 24x36 Canvas Wall Frame',
    active: true,
  },
  {
    name: 'Pre-Wedding Story & Reels Pack',
    description: 'Dedicated 2-location outdoor pre-shoot with 4K cinematic video, vertical reels for Instagram/YouTube Shorts, and digital invitation cards.',
    price: 75000,
    includedEvents: JSON.stringify(['Pre-Shoot']),
    photographers: 1,
    cinematographers: 1,
    drone: true,
    album: false,
    led: false,
    liveStreaming: false,
    complimentaryShoot: 'Complimentary Save-The-Date Video Reel',
    active: true,
  },
  {
    name: 'Corporate & Event Coverage',
    description: 'High-speed event coverage with 24-hour fast-track photo highlights delivery, corporate promo recap reel, and cloud gallery link.',
    price: 45000,
    includedEvents: JSON.stringify(['Corporate Event']),
    photographers: 1,
    cinematographers: 1,
    drone: false,
    album: false,
    led: false,
    liveStreaming: false,
    complimentaryShoot: '24-Hour Express Highlights Gallery',
    active: true,
  },
];

async function main() {
  console.log('Seeding photography package presets into local database...');
  for (const pkg of PACKAGES) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }
  console.log('Successfully seeded 5 studio package presets!');
}

main()
  .catch((e) => {
    console.error('Error seeding packages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
