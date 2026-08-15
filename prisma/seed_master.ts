import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Master Studio ERP Database Seeding...');

  // 1. Seed Event Master Presets
  console.log('1/7 Seeding Event Master Presets...');
  const eventPresets = [
    { name: 'Pre-Wedding Shoot', duration: 'Full Day', description: 'Outdoor romantic couple shoot with 2 outfit changes and aerial 4K drone footage.' },
    { name: 'Haldi & Mehendi', duration: 'Half Day (4 Hours)', description: 'Traditional vibrant yellow ritual and henna application ceremony.' },
    { name: 'Sangeet & Cocktail', duration: 'Night (6 Hours)', description: 'High-energy musical dance night, stage lighting, and candid expressions.' },
    { name: 'Wedding Ceremony', duration: 'Full Day (10 Hours)', description: 'Traditional wedding rituals, sacred pheras, varmala, and reception stage.' },
    { name: 'Grand Reception', duration: 'Night (5 Hours)', description: 'Formal reception dinner, guest greetings, and stage couple portraits.' },
    { name: 'Engagement & Ring Exchange', duration: 'Half Day (4 Hours)', description: 'Ring exchange ceremony with family portraits.' },
    { name: 'Corporate Gala', duration: 'Full Day', description: 'Corporate launch, stage speeches, and networking press photos.' },
  ];

  for (const ev of eventPresets) {
    await prisma.eventMaster.upsert({
      where: { name: ev.name },
      update: ev,
      create: { ...ev, defaultPrice: 0, active: true },
    });
  }

  // 2. Seed Package Presets
  console.log('2/7 Seeding Packages...');
  const packagePresets = [
    {
      name: 'Silver Essential Bundle',
      description: 'Perfect for intimate weddings and 2-event celebrations. Includes traditional coverage and high-resolution album.',
      price: 175000,
      includedEvents: JSON.stringify(['Engagement & Ring Exchange', 'Wedding Ceremony']),
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
      includedEvents: JSON.stringify(['Haldi & Mehendi', 'Sangeet & Cocktail', 'Wedding Ceremony', 'Grand Reception']),
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
      includedEvents: JSON.stringify(['Pre-Wedding Shoot', 'Haldi & Mehendi', 'Sangeet & Cocktail', 'Wedding Ceremony', 'Grand Reception']),
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
      includedEvents: JSON.stringify(['Pre-Wedding Shoot']),
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
      includedEvents: JSON.stringify(['Corporate Gala']),
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

  for (const pkg of packagePresets) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }

  // 3. Seed Staff Employees / Photographers
  console.log('3/7 Seeding Staff & Photographers...');
  const staff = [
    { name: 'Vikramaditya Sen', email: 'vikram@r2rstudio.com', phone: '+919876543210', role: 'PHOTOGRAPHER', salary: 65000, status: 'ACTIVE' },
    { name: 'Karthik Raja', email: 'karthik@r2rstudio.com', phone: '+919876543211', role: 'PHOTOGRAPHER', salary: 55000, status: 'ACTIVE' },
    { name: 'Rahul Sharma', email: 'rahul@r2rstudio.com', phone: '+919876543212', role: 'PHOTOGRAPHER', salary: 45000, status: 'ACTIVE' },
    { name: 'Ananya Roy', email: 'ananya@r2rstudio.com', phone: '+919876543213', role: 'EDITOR', salary: 40000, status: 'ACTIVE' },
    { name: 'Siddharth Varma', email: 'siddharth@r2rstudio.com', phone: '+919876543214', role: 'PHOTOGRAPHER', salary: 50000, status: 'ACTIVE' },
  ];

  for (const emp of staff) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: emp,
      create: emp,
    });
  }

  // 4. Seed Inquiries / Leads
  console.log('4/7 Seeding Inquiries & Leads...');
  const leads = [
    { name: 'Aditya & Diya', phone: '+919891071212', email: 'aditya.diya@gmail.com', event: 'Wedding & Reception', eventDate: '2026-11-20', budget: 350000, source: 'INSTAGRAM', status: 'NEW', notes: 'Inquired via Instagram DM for 3-day wedding package in Hyderabad.' },
    { name: 'Pooja Kulkarni', phone: '+919886050381', email: 'pooja.k@gmail.com', event: 'Pre-Wedding Shoot', eventDate: '2026-09-15', budget: 80000, source: 'WEBSITE', status: 'INTERESTED', notes: 'Looking for 2-location outdoor pre-shoot in Goa.' },
    { name: 'Sanjay Mehta', phone: '+919876354039', email: 'sanjay.m@gmail.com', event: 'Corporate Annual Gala', eventDate: '2026-10-05', budget: 120000, source: 'REFERRAL', status: 'CONTACTED', notes: 'Requires 4K live streaming and press photo coverage.' },
  ];

  for (const l of leads) {
    const existing = await prisma.lead.findFirst({ where: { phone: l.phone } });
    if (!existing) {
      await prisma.lead.create({ data: l });
    }
  }

  // 5. Seed Bookings & Booking Events
  console.log('5/7 Seeding Active Bookings...');
  const allClients = await prisma.client.findMany({ take: 10 });
  const allPackages = await prisma.package.findMany();
  const allEvents = await prisma.eventMaster.findMany();

  if (allClients.length > 0 && allEvents.length > 0) {
    const sampleBookings = [
      {
        bookingNumber: 'R2R-2026-0101',
        name: 'Sameer Weds Archana',
        client: allClients[0],
        package: allPackages[1] || allPackages[0],
        status: 'CONFIRMED',
        venue: 'Petals Palace, Jubilee Hills, Hyderabad',
        grandTotal: 380000,
        paidAmount: 200000,
        balance: 180000,
        notes: 'Pre-wedding outdoor shoot + 3-day wedding celebration',
        events: [
          { event: allEvents[0], date: '2026-09-10', time: '07:00 AM', category: 'PRE_SHOOT' },
          { event: allEvents[1], date: '2026-10-12', time: '09:00 AM', category: 'TRADITIONAL' },
          { event: allEvents[2], date: '2026-10-12', time: '06:00 PM', category: 'CINEMATIC' },
          { event: allEvents[3], date: '2026-10-13', time: '10:00 AM', category: 'TRADITIONAL' },
        ],
      },
      {
        bookingNumber: 'R2R-2026-0102',
        name: 'Narendra Weds Swati',
        client: allClients[1] || allClients[0],
        package: allPackages[0],
        status: 'IN_PROGRESS',
        venue: 'The Leela Palace, Bengaluru',
        grandTotal: 175000,
        paidAmount: 100000,
        balance: 75000,
        notes: 'Traditional wedding rituals and parent albums included',
        events: [
          { event: allEvents[5] || allEvents[0], date: '2026-08-28', time: '10:00 AM', category: 'TRADITIONAL' },
          { event: allEvents[3], date: '2026-08-29', time: '09:00 AM', category: 'TRADITIONAL' },
        ],
      },
      {
        bookingNumber: 'R2R-2026-0103',
        name: 'Vamsi Patel - Pre Wedding Story',
        client: allClients[2] || allClients[0],
        package: allPackages[3] || allPackages[0],
        status: 'EDITING',
        venue: 'Mahabalipuram Beach Resort, Chennai',
        grandTotal: 75000,
        paidAmount: 75000,
        balance: 0,
        notes: 'Outdoor cinematic video + Instagram vertical reels pack',
        events: [
          { event: allEvents[0], date: '2026-08-20', time: '06:00 AM', category: 'PRE_SHOOT' },
        ],
      },
    ];

    for (const sb of sampleBookings) {
      const existing = await prisma.booking.findUnique({ where: { bookingNumber: sb.bookingNumber } });
      if (!existing) {
        const createdBooking = await prisma.booking.create({
          data: {
            bookingNumber: sb.bookingNumber,
            name: sb.name,
            clientId: sb.client.id,
            packageId: sb.package ? sb.package.id : null,
            venue: sb.venue,
            status: sb.status,
            subtotal: sb.grandTotal,
            discount: 0,
            gstAmount: 0,
            grandTotal: sb.grandTotal,
            paidAmount: sb.paidAmount,
            balance: sb.balance,
            notes: sb.notes,
          },
        });

        for (const evRow of sb.events) {
          await prisma.bookingEvent.create({
            data: {
              bookingId: createdBooking.id,
              eventId: evRow.event.id,
              category: evRow.category,
              eventDate: evRow.date,
              eventTime: evRow.time,
              venue: sb.venue,
              price: 0,
              status: 'ASSIGNED',
            },
          });
        }

        // Create Album tracking record
        await prisma.album.create({
          data: {
            bookingId: createdBooking.id,
            type: 'PREMIUM',
            status: sb.status === 'EDITING' ? 'IN_EDITING' : 'CLIENT_REVIEW',
            designStatus: 'DESIGNING',
            notes: `${sb.name} - High-definition synthetic leather cover album`,
          },
        });

        // Create Delivery tracking item
        await prisma.delivery.create({
          data: {
            bookingId: createdBooking.id,
            deliverableType: 'PENDRIVE',
            status: 'PENDING',
          },
        });
      }
    }
  }

  // 6. Seed Expenses
  console.log('6/7 Seeding Studio Operational Expenses...');
  const expenses = [
    { description: 'Sony FX3 Camera Gear Rental', amount: 18000, category: 'EQUIPMENT_RENTAL', date: '2026-08-10' },
    { description: 'Outstation Travel & Hotel Accommodation', amount: 32000, category: 'TRAVEL', date: '2026-08-14' },
    { description: 'Studio Electricity & High Speed Broadband', amount: 12500, category: 'UTILITIES', date: '2026-08-01' },
    { description: 'Canvera Album Printing & Binding Invoices', amount: 24000, category: 'PRINTING', date: '2026-08-05' },
  ];

  for (const exp of expenses) {
    const existing = await prisma.expense.findFirst({ where: { description: exp.description } });
    if (!existing) {
      await prisma.expense.create({ data: exp });
    }
  }

  console.log('7/7 Seeding Complete! ✅ Master Studio ERP Database is fully populated.');
}

main()
  .catch((e) => {
    console.error('Error during master seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
