import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const HYD_FIRST_NAMES = [
  'Syed', 'Mohammed', 'Venkat', 'Ananya', 'Goutham', 'Lakshmi', 'Vikram', 'Asif', 'Priya',
  'Karthik', 'Sneha', 'Harish', 'Swapna', 'Zeeshan', 'Rahul', 'Srinivas', 'Rajesh', 'Mahesh',
  'Divya', 'Kavya', 'Archana', 'Sandeep', 'Tarun', 'Vamsi', 'Akhil', 'Salman', 'Tariq',
  'Imran', 'Fatima', 'Ayesha', 'Nithya', 'Rohit', 'Teja', 'Pradeep', 'Shravan', 'Deepthi',
  'Manasa', 'Bhavana', 'Naresh', 'Harika', 'Pooja', 'Swathi', 'Revanth', 'Nikhil', 'Rithesh',
  'Mir', 'Osman', 'Zahir', 'Tanveer', 'Nasser', 'Sameer', 'Farhan', 'Shoaib', 'Kavitha', 'Shalini',
  'Prashanth', 'Narendra', 'Vishal', 'Bhaskar', 'Sudheer', 'Lalitha', 'Radhika', 'Sharath'
];

const HYD_LAST_NAMES = [
  'Reddy', 'Rao', 'Goud', 'Khan', 'Pasha', 'Varma', 'Prasad', 'Chowdary', 'Raju', 'Shah',
  'Patel', 'Nambiar', 'Begum', 'Sharma', 'Verma', 'Chander', 'Naidu', 'Kulkarni', 'Joshi',
  'Deshmukh', 'Basha', 'Quadri', 'Siddiqui', 'Shaik', 'Shanker', 'Murthy', 'Yadav', 'Ali', 'Gutti'
];

const HYD_LOCALITIES = [
  'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Hitec City', 'Begumpet',
  'Secunderabad', 'Shamshabad', 'Kondapur', 'Himayatnagar', 'Abids', 'Financial District',
  'Miyapur', 'Kukatpally', 'Kompally', 'Alwal', 'Mehdipatnam', 'Tolichowki', 'Somajiguda',
  'Punjagutta', 'Manikonda', 'Narsingi', 'Tellapur', 'Gandipet'
];

const HYD_VENUES = [
  'Taj Falaknuma Palace, Engine Bowli',
  'Novotel Hyderabad Convention Centre (HICC), Gachibowli',
  'Taj Krishna, Road No. 1, Banjara Hills',
  'JRC Conventions, Jubilee Hills',
  'Golkonda Resort & Spa, Gandipet',
  'Ramoji Film City, Hayathnagar',
  'N Convention, Madhapur',
  'ITC Kohenur, Knowledge City, Madhapur',
  'Park Hyatt, Road No. 2, Banjara Hills',
  'Chowmahalla Palace, Khilwat',
  'Boulder Hills Golf & Country Club, Gachibowli',
  'Westin Mindspace, Hitec City',
  'Fort Grand, Shamshabad',
  'Shilpakalam Vedika, Hitec City',
  'Avasa Hotel, Madhapur',
  'Hyatt Place, Banjara Hills'
];

// Production Pipeline Statuses spread evenly across all 5 columns
const PIPELINE_STATUSES = [
  'IN_PROGRESS', 'IN_PROGRESS', 
  'EDITING', 'EDITING', 
  'ALBUM_DESIGNING', 'ALBUM_DESIGNING', 
  'READY_FOR_DELIVERY', 'READY_FOR_DELIVERY',
  'COMPLETED', 'COMPLETED'
];

const ALBUM_TYPES = ['PREMIUM', 'ACRYLIC', 'MAGAZINE', 'HD'];

async function main() {
  console.log('Clearing existing database records...');
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

  console.log('Seeding admin & staff users...');
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
    { name: 'Srinivas Rao', email: 'srinivas.m@r2r.com', phone: '+919849011223', role: 'MANAGER', status: 'ACTIVE', salary: 65000 },
    { name: 'Anand Kumar Varma', email: 'anand.photo@r2r.com', phone: '+919949022334', role: 'PHOTOGRAPHER', status: 'ACTIVE', salary: 45000 },
    { name: 'Kiran Dev Reddy', email: 'kiran.photo@r2r.com', phone: '+919700033445', role: 'PHOTOGRAPHER', status: 'ACTIVE', salary: 42000 },
    { name: 'Rahul Mehta', email: 'rahul.edit@r2r.com', phone: '+919866044556', role: 'EDITOR', status: 'ACTIVE', salary: 38000 },
    { name: 'Nisha Sharma', email: 'nisha.acc@r2r.com', phone: '+919989055667', role: 'ACCOUNTANT', status: 'ACTIVE', salary: 35000 },
    { name: 'Mohammed Sameer', email: 'sameer.photo@r2r.com', phone: '+919848066778', role: 'PHOTOGRAPHER', status: 'ACTIVE', salary: 40000 },
    { name: 'Venkatesh Naidu', email: 'venky.photo@r2r.com', phone: '+919848077889', role: 'PHOTOGRAPHER', status: 'ACTIVE', salary: 41000 },
  ];

  const dbEmployees: Record<string, string> = {};
  for (const e of employees) {
    const created = await prisma.employee.create({ data: e });
    dbEmployees[e.role] = created.id;
  }

  console.log('Seeding event masters...');
  const events = [
    { name: 'Pre Wedding Shoot', defaultPrice: 35000, category: 'Photography', duration: '1 Day' },
    { name: 'Wedding Ceremony', defaultPrice: 120000, category: 'Photography & Videography', duration: '1 Day' },
    { name: 'Haldi & Mehendi', defaultPrice: 45000, category: 'Photography', duration: 'Half Day' },
    { name: 'Sangeet Night', defaultPrice: 75000, category: 'Photography & Videography', duration: '1 Evening' },
    { name: 'Grand Reception', defaultPrice: 90000, category: 'Photography & Videography', duration: '1 Day' },
    { name: 'Royal Heritage Production', defaultPrice: 250000, category: 'Luxury Production', duration: '2 Days' },
    { name: 'Drone Aerial Cinema', defaultPrice: 30000, category: 'Add-on', duration: 'Event' },
    { name: 'Live 4K Broadcast', defaultPrice: 40000, category: 'Add-on', duration: 'Event' },
  ];

  const dbEventsList: any[] = [];
  for (const ev of events) {
    const created = await prisma.eventMaster.create({ data: ev });
    dbEventsList.push(created);
  }

  console.log('Seeding service packages...');
  const packages = [
    { name: 'Royal Falaknuma Heritage', price: 1250000, includedEvents: JSON.stringify(['Royal Heritage Production', 'Wedding Ceremony', 'Grand Reception']), photographers: 4, cinematographers: 3, drone: true, album: true, led: true, liveStreaming: true },
    { name: 'Nizam Luxury Edition', price: 650000, includedEvents: JSON.stringify(['Pre Wedding Shoot', 'Wedding Ceremony', 'Sangeet Night', 'Grand Reception']), photographers: 3, cinematographers: 2, drone: true, album: true, led: true, liveStreaming: true },
    { name: 'Pearl City Grand', price: 480000, includedEvents: JSON.stringify(['Wedding Ceremony', 'Sangeet Night', 'Grand Reception']), photographers: 3, cinematographers: 2, drone: true, album: true },
    { name: 'Gachibowli Premium', price: 380000, includedEvents: JSON.stringify(['Pre Wedding Shoot', 'Wedding Ceremony', 'Grand Reception']), photographers: 2, cinematographers: 2, drone: true, album: true },
    { name: 'Jubilee Gold', price: 290000, includedEvents: JSON.stringify(['Wedding Ceremony', 'Grand Reception']), photographers: 2, cinematographers: 1, drone: false, album: true },
    { name: 'Deccan Classic', price: 180000, includedEvents: JSON.stringify(['Pre Wedding Shoot', 'Wedding Ceremony']), photographers: 2, cinematographers: 1, drone: true, album: true },
    { name: 'Charminar Silver', price: 95000, includedEvents: JSON.stringify(['Wedding Ceremony']), photographers: 1, cinematographers: 1, drone: false, album: true },
    { name: 'Telangana Bronze', price: 45000, includedEvents: JSON.stringify(['Baby Shower & Cradle']), photographers: 1, cinematographers: 0, drone: false, album: false },
  ];

  const dbPackagesList: any[] = [];
  for (const pkg of packages) {
    const created = await prisma.package.create({ data: pkg });
    dbPackagesList.push(created);
  }

  console.log('Generating 1,400 Hyderabadi Clients in bulk...');
  const clientsData = [];
  for (let i = 1; i <= 1400; i++) {
    const firstName = pick(HYD_FIRST_NAMES);
    const lastName = pick(HYD_LAST_NAMES);
    const locality = pick(HYD_LOCALITIES);
    const phoneNum = `+9198${randomInt(10000000, 99999999)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hyderabadmail.com`;

    clientsData.push({
      name: `${firstName} ${lastName}`,
      phone: phoneNum,
      whatsappNumber: phoneNum,
      email: email,
      address: `Flat ${randomInt(101, 909)}, ${locality}`,
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: `5000${randomInt(10, 99)}`,
      notes: `Hyderabadi client from ${locality}`,
    });
  }

  await prisma.client.createMany({ data: clientsData });
  const allClients = await prisma.client.findMany({ select: { id: true, name: true } });
  console.log(`Created ${allClients.length} Hyderabadi clients.`);

  console.log('Generating 365 DAYS OF 2026 (Jan 1 to Dec 31, 2026) Orders in bulk...');
  const bookingsData: any[] = [];
  let clientIndex = 0;
  let orderNumberCounter = 1000;

  // Generate 365 Days of events for 2026
  const startDate = new Date('2026-01-01T00:00:00Z');
  const endDate = new Date('2026-12-31T00:00:00Z');

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();

    const mStr = m < 10 ? `0${m}` : `${m}`;
    const dStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${year}-${mStr}-${dStr}`;

    // Event density per day:
    // August 27: 18 events (Peak Super Day)
    // Month of August (other days): 5 to 9 events per day
    // Other Months: 2 to 5 events per day
    let countForDay = randomInt(2, 5);
    if (m === 8) {
      countForDay = (day === 27) ? 18 : randomInt(5, 9);
    }

    for (let k = 0; k < countForDay; k++) {
      const client = allClients[clientIndex % allClients.length];
      clientIndex++;

      const pkg = (m === 8 && day === 27 && k < 4) ? dbPackagesList[0] : pick(dbPackagesList);
      const venue = pick(HYD_VENUES);
      const status = pick(PIPELINE_STATUSES);

      const bookingNum = `R2R-2026-${mStr}${dStr}-${100 + k}`;
      const subtotal = pkg.price;
      const discount = Math.random() > 0.6 ? randomInt(5000, 25000) : 0;
      const netTotal = Math.max(subtotal - discount, 20000);
      const gstAmount = Math.round(netTotal * 0.18);
      const grandTotal = netTotal + gstAmount;

      const paidFactor = status === 'COMPLETED' ? 1 : Math.random() > 0.5 ? 0.8 : 0.5;
      const paidAmount = Math.round(grandTotal * paidFactor);
      const balance = grandTotal - paidAmount;

      bookingsData.push({
        bookingNumber: bookingNum,
        name: `${client.name}'s ${pkg.name} Production`,
        clientId: client.id,
        packageId: pkg.id,
        venue: venue,
        notes: (m === 8 && day === 27)
          ? `★ PEAK DAY ROYAL PRODUCTION on Aug 27, 2026 at ${venue}.`
          : `Event booked for ${dateStr} at ${venue}.`,
        status: status,
        subtotal: subtotal,
        discount: discount,
        gstAmount: gstAmount,
        grandTotal: grandTotal,
        paidAmount: paidAmount,
        balance: balance,
        createdAt: new Date(`${dateStr}T08:00:00Z`),
      });
    }
  }

  console.log(`Inserting ${bookingsData.length} Bookings into database...`);
  await prisma.booking.createMany({ data: bookingsData });

  console.log('Querying created bookings to generate linked Events, Albums, Invoices & Payments...');
  const allBookings = await prisma.booking.findMany({
    select: { id: true, bookingNumber: true, status: true, grandTotal: true, paidAmount: true, balance: true, venue: true, createdAt: true }
  });

  const bookingEventsData: any[] = [];
  const albumsData: any[] = [];
  const paymentsData: any[] = [];
  const invoicesData: any[] = [];
  const quotationsData: any[] = [];

  let invCounter = 5001;

  for (const b of allBookings) {
    const dateStr = b.createdAt.toISOString().split('T')[0];

    // BookingEvent
    bookingEventsData.push({
      bookingId: b.id,
      eventId: pick(dbEventsList).id,
      eventDate: dateStr,
      eventTime: `${randomInt(6, 11)}:00 ${randomInt(0, 1) === 0 ? 'AM' : 'PM'}`,
      venue: b.venue || 'Hyderabad Venue',
      price: Math.round(b.grandTotal * 0.6),
      status: b.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED',
    });

    // Album for Production Pipeline / Editing Tasks
    albumsData.push({
      bookingId: b.id,
      type: pick(ALBUM_TYPES),
      status: b.status === 'COMPLETED' ? 'COMPLETED' : 'IN_EDITING',
      designStatus: b.status === 'COMPLETED' ? 'DELIVERED' : 'DESIGNING',
      editorId: dbEmployees['EDITOR'],
      notes: `Editing task for ${b.bookingNumber} (${dateStr}). Raw & Edited links synced.`,
      rawLink: `https://drive.google.com/drive/folders/hyd_raw_${b.id.substring(0, 8)}`,
      editedLink: `https://drive.google.com/drive/folders/hyd_edited_${b.id.substring(0, 8)}`,
    });

    // Payment
    if (b.paidAmount > 0) {
      paymentsData.push({
        bookingId: b.id,
        receiptNumber: `RCPT-2026-${100000 + paymentsData.length}`,
        amount: b.paidAmount,
        paymentMode: pick(['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE']),
        paymentDate: dateStr,
        notes: 'Deposit received',
      });
    }

    // Invoice
    invoicesData.push({
      bookingId: b.id,
      invoiceNumber: `INV-2026-${invCounter++}`,
      gstRate: 18,
      gstAmount: Math.round(b.grandTotal * 0.18),
      totalAmount: Math.round(b.grandTotal / 1.18),
      grandTotal: b.grandTotal,
      paidAmount: b.paidAmount,
      balance: b.balance,
      status: b.balance === 0 ? 'PAID' : b.paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
      createdAt: b.createdAt,
    });

    // Quotation
    quotationsData.push({
      bookingId: b.id,
      version: 1,
      terms: '50% advance deposit to confirm slot date.',
      status: 'APPROVED',
      createdAt: b.createdAt,
    });
  }

  console.log('Bulk inserting linked Events, Albums, Payments, Invoices & Quotations...');
  await prisma.bookingEvent.createMany({ data: bookingEventsData });
  await prisma.album.createMany({ data: albumsData });
  await prisma.payment.createMany({ data: paymentsData });
  await prisma.invoice.createMany({ data: invoicesData });
  await prisma.quotation.createMany({ data: quotationsData });

  // Seed inventory
  console.log('Seeding equipment inventory...');
  const inventoryItems = [
    { name: 'Sony FX6 Cinema Camera', category: 'CAMERA', serialNumber: 'SN-FX6-HYD001', status: 'AVAILABLE', notes: '4K Full Frame Cinema Rig' },
    { name: 'Sony Alpha 7S III Body 1', category: 'CAMERA', serialNumber: 'SN-A7S3-HYD002', status: 'AVAILABLE' },
    { name: 'Sony Alpha 7S III Body 2', category: 'CAMERA', serialNumber: 'SN-A7S3-HYD003', status: 'AVAILABLE' },
    { name: 'Sony Alpha 7R V High-Res Body', category: 'CAMERA', serialNumber: 'SN-A7R5-HYD004', status: 'AVAILABLE' },
    { name: 'Sony FE 24-70mm f/2.8 GM II', category: 'LENS', serialNumber: 'SN-LENS-2470-HYD', status: 'AVAILABLE' },
    { name: 'Sony FE 70-200mm f/2.8 GM II', category: 'LENS', serialNumber: 'SN-LENS-70200-HYD', status: 'AVAILABLE' },
    { name: 'DJI Inspire 3 Cinema Drone', category: 'DRONE', serialNumber: 'SN-INS3-HYD099', status: 'AVAILABLE', notes: '8K Raw Cinema Drone' },
    { name: 'DJI Ronin 4D 6K Gimbal Rig', category: 'GIMBAL', serialNumber: 'SN-RONIN4D-HYD01', status: 'AVAILABLE' },
    { name: 'Aputure 600d Pro Lighting Strobe', category: 'LIGHT', serialNumber: 'SN-APUT-600D-HYD', status: 'AVAILABLE' },
  ];
  await prisma.inventory.createMany({ data: inventoryItems });

  // Seed Expenses for all months
  console.log('Seeding 2026 studio expenses...');
  const expenses = [
    { category: 'FUEL', amount: 98500, description: 'Fuel & logistics for 365 days of Hyderabadi shoots', date: '2026-08-27' },
    { category: 'PRINTING', amount: 485000, description: 'Acrylic & Velvet photobook printing for 2026 deliveries', date: '2026-08-27' },
    { category: 'EQUIPMENT', amount: 690000, description: 'Heavy Jimmy Jib Crane & 4K Outdoor LED Wall rentals for peak weddings', date: '2026-08-27' },
    { category: 'SALARY', amount: 568000, description: 'Monthly payroll for Photographers, Editors & Managers', date: '2026-08-01' },
    { category: 'MARKETING', amount: 185000, description: 'Meta & Instagram Ads for Jubilee Hills & Banjara Hills', date: '2026-08-02' },
  ];
  await prisma.expense.createMany({ data: expenses });

  console.log(`✅ Successfully seeded 365 DAYS OF 2026! Total ${allBookings.length} Bookings & Editing Tasks created across the entire year!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
