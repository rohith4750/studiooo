import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse order of dependency
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.inventoryLog.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.bookingEvent.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.eventMaster.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  const users = [
    { email: 'rohithtelidevara@gmail.com', password: 'Rohith@143', name: 'R2R Admin', role: 'ADMIN' },
    { email: 'manager@r2r.com', password: 'manager123', name: 'R2R Manager', role: 'MANAGER' },
    { email: 'photographer@r2r.com', password: 'photo123', name: 'R2R Photographer', role: 'PHOTOGRAPHER' },
    { email: 'editor@r2r.com', password: 'editor123', name: 'R2R Editor', role: 'EDITOR' },
    { email: 'accountant@r2r.com', password: 'acc123', name: 'R2R Accountant', role: 'ACCOUNTANT' },
    { email: 'receptionist@r2r.com', password: 'recep123', name: 'R2R Receptionist', role: 'RECEPTIONIST' },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  console.log('Seeding employee profiles...');
  const employees = [
    { name: 'Anand Kumar', email: 'anand.photo@r2r.com', phone: '+919999888877', role: 'PHOTOGRAPHER', status: 'ACTIVE', salary: 35000 },
    { name: 'Kiran Dev', email: 'kiran.photo@r2r.com', phone: '+919999888876', role: 'PHOTOGRAPHER', status: 'ACTIVE', salary: 32000 },
    { name: 'Rahul Mehta', email: 'rahul.edit@r2r.com', phone: '+919999888875', role: 'EDITOR', status: 'ACTIVE', salary: 28000 },
    { name: 'Srinivas Rao', email: 'srinivas.m@r2r.com', phone: '+919999888874', role: 'MANAGER', status: 'ACTIVE', salary: 45000 },
    { name: 'Nisha Sharma', email: 'nisha.acc@r2r.com', phone: '+919999888873', role: 'ACCOUNTANT', status: 'ACTIVE', salary: 30000 },
  ];

  const dbEmployees: Record<string, string> = {};
  for (const e of employees) {
    const created = await prisma.employee.create({ data: e });
    dbEmployees[e.role] = created.id;
  }

  console.log('Seeding client profiles...');
  const clients = [
    {
      name: 'Rajesh Patel',
      phone: '+919876543210',
      whatsappNumber: '+919876543210',
      email: 'rajesh@gmail.com',
      address: '102, Shanti Vihar, Jayanagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560041',
      birthday: '1990-05-12',
      anniversary: '2018-11-22',
      notes: 'Prefers classic framing, very detail oriented.',
    },
    {
      name: 'Priya Nair',
      phone: '+919823456789',
      whatsappNumber: '+919823456789',
      email: 'priya.nair@yahoo.com',
      address: 'Flat 4B, Prestige Heights',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682015',
      birthday: '1993-08-25',
      anniversary: '2021-02-14',
    },
    {
      name: 'Amit Shah',
      phone: '+919911223344',
      whatsappNumber: '+919911223344',
      email: 'amit.s@gmail.com',
      address: '22, Rosewood Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560068',
      birthday: '1988-10-05',
    },
  ];

  const dbClients = [];
  for (const c of clients) {
    const created = await prisma.client.create({ data: c });
    dbClients.push(created);
  }

  console.log('Seeding lead records...');
  const leads = [
    { name: 'Vinay Prasad', phone: '+919123456789', email: 'vinay.p@gmail.com', event: 'Wedding', eventDate: '2026-09-12', budget: 150000, source: 'INSTAGRAM', status: 'NEW', notes: 'Enquired about cinematic video + album bundle' },
    { name: 'Sneha Gowda', phone: '+919012345678', email: 'sneha.g@gmail.com', event: 'Baby Shower', eventDate: '2026-08-25', budget: 45000, source: 'WHATSAPP', status: 'FOLLOW_UP', notes: 'Requested quotation for half-day shoot' },
    { name: 'Vikram Roy', phone: '+919567890123', email: 'vikram.roy@corporate.com', event: 'Corporate Event', eventDate: '2026-10-05', budget: 200000, source: 'GOOGLE_ADS', status: 'CONTACTED', notes: 'Need live streaming and crane cameras' },
  ];

  for (const l of leads) {
    await prisma.lead.create({ data: l });
  }

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

  const dbEvents: Record<string, string> = {};
  for (const ev of events) {
    const created = await prisma.eventMaster.create({ data: ev });
    dbEvents[ev.name] = created.id;
  }

  console.log('Seeding service packages...');
  const packages = [
    { name: 'Bronze', price: 30000, includedEvents: JSON.stringify(['Engagement']), photographers: 1, cinematographers: 0, drone: false, album: false },
    { name: 'Silver', price: 65000, includedEvents: JSON.stringify(['Engagement', 'Reception']), photographers: 1, cinematographers: 1, drone: false, album: true },
    { name: 'Gold', price: 110000, includedEvents: JSON.stringify(['Wedding', 'Reception']), photographers: 2, cinematographers: 1, drone: false, album: true },
    { name: 'Premium', price: 140000, includedEvents: JSON.stringify(['Pre Wedding', 'Wedding', 'Reception']), photographers: 2, cinematographers: 2, drone: true, album: true, complimentaryShoot: 'Pre Wedding' },
    { name: 'Luxury', price: 180000, includedEvents: JSON.stringify(['Pre Wedding', 'Wedding', 'Reception', 'Haldi', 'Sangeet']), photographers: 3, cinematographers: 2, drone: true, album: true, led: true, liveStreaming: true },
  ];

  const dbPackages: Record<string, string> = {};
  for (const pkg of packages) {
    const created = await prisma.package.create({ data: pkg });
    dbPackages[pkg.name] = created.id;
  }

  console.log('Seeding bookings...');
  // Booking 1: Gold Package
  const b1Subtotal = 120000.0;
  const b1Discount = 10000.0;
  const b1Total = b1Subtotal - b1Discount;
  const b1Gst = b1Total * 0.18;
  const b1GrandTotal = b1Total + b1Gst;

  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: 'R2R-2026-0001',
      clientId: dbClients[0].id,
      packageId: dbPackages['Gold'],
      notes: 'Ensure drone operator is available for outdoor shots.',
      status: 'CONFIRMED',
      subtotal: b1Subtotal,
      discount: b1Discount,
      gstAmount: b1Gst,
      grandTotal: b1GrandTotal,
      paidAmount: 50000,
      balance: b1GrandTotal - 50000,
      venue: 'White Petals Palace, Bengaluru',
    },
  });

  const b1Event1 = await prisma.bookingEvent.create({
    data: {
      bookingId: booking1.id,
      eventId: dbEvents['Wedding'],
      eventDate: '2026-07-20',
      eventTime: '08:00 AM',
      venue: 'White Petals Palace, Main Hall',
      price: 80000,
      status: 'ASSIGNED',
    },
  });

  const b1Event2 = await prisma.bookingEvent.create({
    data: {
      bookingId: booking1.id,
      eventId: dbEvents['Reception'],
      eventDate: '2026-07-21',
      eventTime: '06:00 PM',
      venue: 'White Petals Palace, Grand Ballroom',
      price: 40000,
      status: 'ASSIGNED',
    },
  });

  // Assign staff to Booking 1 Events
  await prisma.assignment.create({
    data: {
      bookingEventId: b1Event1.id,
      employeeId: dbEmployees['PHOTOGRAPHER'],
      role: 'LEAD_PHOTOGRAPHER',
      travelAllowance: 1000,
      attendance: 'PENDING',
    },
  });

  // Payments for Booking 1
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      receiptNumber: 'RCPT-2026-0001',
      amount: 50000,
      paymentMode: 'UPI',
      paymentDate: '2026-07-10',
      notes: 'Advance booking deposit',
    },
  });

  // Quotation & Invoice for Booking 1
  await prisma.quotation.create({
    data: {
      bookingId: booking1.id,
      version: 1,
      terms: 'Standard 50% advance, balance on deliverable approval.',
      status: 'APPROVED',
    },
  });

  await prisma.invoice.create({
    data: {
      bookingId: booking1.id,
      invoiceNumber: 'INV-2026-0001',
      gstRate: 18,
      gstAmount: b1Gst,
      totalAmount: b1Total,
      grandTotal: b1GrandTotal,
      paidAmount: 50000,
      balance: b1GrandTotal - 50000,
      status: 'PARTIALLY_PAID',
    },
  });

  // Booking 2: Premium Package
  const b2Subtotal = 140000.0;
  const b2Total = b2Subtotal;
  const b2Gst = b2Total * 0.18;
  const b2GrandTotal = b2Total + b2Gst;

  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: 'R2R-2026-0002',
      clientId: dbClients[1].id,
      packageId: dbPackages['Premium'],
      notes: 'Completed shoot, album in design phase.',
      status: 'ALBUM_DESIGNING',
      subtotal: b2Subtotal,
      discount: 0,
      gstAmount: b2Gst,
      grandTotal: b2GrandTotal,
      paidAmount: b2GrandTotal, // Fully paid
      balance: 0,
      venue: 'Saj Earth Resort, Kochi',
    },
  });

  const b2Event1 = await prisma.bookingEvent.create({
    data: {
      bookingId: booking2.id,
      eventId: dbEvents['Pre Wedding'],
      eventDate: '2026-06-15',
      eventTime: '05:00 AM',
      venue: 'Vagamon Pine Hills',
      price: 25000,
      status: 'COMPLETED',
    },
  });

  const b2Event2 = await prisma.bookingEvent.create({
    data: {
      bookingId: booking2.id,
      eventId: dbEvents['Wedding'],
      eventDate: '2026-06-20',
      eventTime: '09:00 AM',
      venue: 'Saj Earth Resort, Kochi',
      price: 75000,
      status: 'COMPLETED',
    },
  });

  // Assign editor and seed Album
  await prisma.album.create({
    data: {
      bookingId: booking2.id,
      type: 'PREMIUM',
      status: 'CLIENT_REVIEW',
      designStatus: 'DESIGNING',
      editorId: dbEmployees['EDITOR'],
      rawLink: 'https://drive.google.com/drive/folders/raw_photos_mock_id',
      editedLink: 'https://drive.google.com/drive/folders/edited_photos_mock_id',
      notes: 'Draft album submitted for customer approval.',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      receiptNumber: 'RCPT-2026-0002',
      amount: b2GrandTotal,
      paymentMode: 'BANK_TRANSFER',
      paymentDate: '2026-06-10',
      notes: 'Full payment received',
    },
  });

  await prisma.invoice.create({
    data: {
      bookingId: booking2.id,
      invoiceNumber: 'INV-2026-0002',
      gstRate: 18,
      gstAmount: b2Gst,
      totalAmount: b2Total,
      grandTotal: b2GrandTotal,
      paidAmount: b2GrandTotal,
      balance: 0,
      status: 'PAID',
    },
  });

  // Seed inventory
  console.log('Seeding inventory items...');
  const inventoryItems = [
    { name: 'Sony Alpha 7 IV', category: 'CAMERA', serialNumber: 'SN-SONY-740921', status: 'AVAILABLE', notes: 'Lead camera body' },
    { name: 'Sony Alpha 7R V', category: 'CAMERA', serialNumber: 'SN-SONY-758912', status: 'AVAILABLE', notes: 'High-res portrait body' },
    { name: 'Sony FE 24-70mm f2.8 GM II', category: 'LENS', serialNumber: 'SN-LENS-247022', status: 'AVAILABLE' },
    { name: 'Sony FE 70-200mm f2.8 GM II', category: 'LENS', serialNumber: 'SN-LENS-702005', status: 'AVAILABLE' },
    { name: 'DJI Mavic 3 Pro', category: 'DRONE', serialNumber: 'SN-DRONE-MAV301', status: 'AVAILABLE' },
    { name: 'Godox AD600 Pro Strobe', category: 'LIGHT', serialNumber: 'SN-GODX-60032', status: 'AVAILABLE' },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.create({ data: item });
  }

  // Seed expenses
  console.log('Seeding expenses...');
  const expenses = [
    { category: 'FUEL', amount: 1800, description: 'Fuel for Pre Wedding shoot travel', date: '2026-07-01' },
    { category: 'PRINTING', amount: 12000, description: 'Acrylic photo frame printing charges', date: '2026-07-05' },
    { category: 'SALARY', amount: 35000, description: 'Photographer monthly salary payout', date: '2026-07-02' },
    { category: 'MARKETING', amount: 5000, description: 'Instagram ads budget for June', date: '2026-06-30' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }

  console.log('Database successfully pre-populated!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
