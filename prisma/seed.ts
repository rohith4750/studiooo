import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to pick random item from array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate random number between min and max
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hyderabadi Seed Data Arrays
const HYD_FIRST_NAMES = [
  'Syed', 'Mohammed', 'Venkat', 'Ananya', 'Goutham', 'Lakshmi', 'Vikram', 'Asif', 'Priya',
  'Karthik', 'Sneha', 'Harish', 'Swapna', 'Zeeshan', 'Rahul', 'Srinivas', 'Rajesh', 'Mahesh',
  'Divya', 'Kavya', 'Archana', 'Sandeep', 'Tarun', 'Vamsi', 'Akhil', 'Salman', 'Tariq',
  'Imran', 'Fatima', 'Ayesha', 'Nithya', 'Rohit', 'Teja', 'Pradeep', 'Shravan', 'Deepthi',
  'Manasa', 'Bhavana', 'Naresh', 'Harika', 'Pooja', 'Swathi', 'Revanth', 'Nikhil', 'Rithesh'
];

const HYD_LAST_NAMES = [
  'Reddy', 'Rao', 'Goud', 'Khan', 'Pasha', 'Varma', 'Prasad', 'Chowdary', 'Raju', 'Shah',
  'Patel', 'Nambiar', 'Begum', 'Sharma', 'Verma', 'Chander', 'Naidu', 'Kulkarni', 'Joshi',
  'Deshmukh', 'Basha', 'Quadri', 'Siddiqui', 'Shaik', 'Shanker', 'Murthy', 'Yadav'
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

const BOOKING_STATUSES = [
  'CONFIRMED', 'CONFIRMED', 'CONFIRMED', 
  'IN_PROGRESS', 'IN_PROGRESS', 
  'EDITING', 'ALBUM_DESIGNING', 'PRINTING', 'READY_FOR_DELIVERY', 
  'COMPLETED', 'COMPLETED', 'COMPLETED'
];

async function main() {
  console.log('Clearing existing data...');
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
    { name: 'Baby Shower & Cradle', defaultPrice: 30000, category: 'Events', duration: 'Half Day' },
    { name: 'Birthday Bash', defaultPrice: 25000, category: 'Events', duration: 'Half Day' },
  ];

  const dbEvents: Record<string, string> = {};
  for (const ev of events) {
    const created = await prisma.eventMaster.create({ data: ev });
    dbEvents[ev.name] = created.id;
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

  console.log('Generating 320 Hyderabadi Clients...');
  const createdClients: any[] = [];
  for (let i = 1; i <= 320; i++) {
    const firstName = pick(HYD_FIRST_NAMES);
    const lastName = pick(HYD_LAST_NAMES);
    const locality = pick(HYD_LOCALITIES);
    const phoneNum = `+9198${randomInt(10000000, 99999999)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hyderabadmail.com`;

    const client = await prisma.client.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: phoneNum,
        whatsappNumber: phoneNum,
        email: email,
        address: `Flat ${randomInt(101, 909)}, ${locality}`,
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: `5000${randomInt(10, 99)}`,
        notes: `Hyderabadi client from ${locality}`,
      },
    });
    createdClients.push(client);
  }

  console.log('Generating 310 Hyderabadi Orders / Bookings across 2026...');
  // Total August turnover target: > 35 - 50 Lakhs
  let orderCounter = 1001;

  for (let i = 0; i < 310; i++) {
    const client = createdClients[i % createdClients.length];
    const pkg = pick(dbPackagesList);
    const venue = pick(HYD_VENUES);
    const status = pick(BOOKING_STATUSES);

    // Distribute dates across Jan to Nov 2026, with 80+ bookings in August 2026
    let month = randomInt(1, 11);
    // 30% of all bookings concentrated in August (Month 8) for heavy turnover
    if (i % 3 === 0) {
      month = 8;
    }
    const day = randomInt(1, 28);
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-${monthStr}-${dayStr}`;

    const bookingNum = `R2R-2026-${orderCounter++}`;
    const subtotal = pkg.price;
    const discount = Math.random() > 0.6 ? randomInt(5000, 25000) : 0;
    const netTotal = Math.max(subtotal - discount, 20000);
    const gstAmount = Math.round(netTotal * 0.18);
    const grandTotal = netTotal + gstAmount;

    // Paid amount: 40% to 100%
    const paidFactor = status === 'COMPLETED' ? 1 : Math.random() > 0.5 ? 0.7 : 0.4;
    const paidAmount = Math.round(grandTotal * paidFactor);
    const balance = grandTotal - paidAmount;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNum,
        name: `${client.name}'s ${pkg.name} Event`,
        clientId: client.id,
        packageId: pkg.id,
        venue: venue,
        notes: `Event booked for ${dateStr} at ${venue}. GST Included.`,
        status: status,
        subtotal: subtotal,
        discount: discount,
        gstAmount: gstAmount,
        grandTotal: grandTotal,
        paidAmount: paidAmount,
        balance: balance,
        createdAt: new Date(dateStr),
      },
    });

    // Create BookingEvent
    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventId: pick(Object.values(dbEvents)),
        eventDate: dateStr,
        eventTime: `${randomInt(6, 11)}:00 ${randomInt(0, 1) === 0 ? 'AM' : 'PM'}`,
        venue: venue,
        price: Math.round(subtotal * 0.6),
        status: status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED',
      },
    });

    // Create Payment record for deposit
    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          receiptNumber: `RCPT-2026-${randomInt(10000, 99999)}`,
          amount: paidAmount,
          paymentMode: pick(['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE']),
          paymentDate: dateStr,
          notes: 'Advance booking payment received',
        },
      });
    }

    // Create Invoice record
    await prisma.invoice.create({
      data: {
        bookingId: booking.id,
        invoiceNumber: `INV-2026-${1000 + i}`,
        gstRate: 18,
        gstAmount: gstAmount,
        totalAmount: netTotal,
        grandTotal: grandTotal,
        paidAmount: paidAmount,
        balance: balance,
        status: balance === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
        createdAt: new Date(dateStr),
      },
    });

    // Create Quotation record
    await prisma.quotation.create({
      data: {
        bookingId: booking.id,
        version: 1,
        terms: '50% advance to confirm date slot, remaining balance prior to raw delivery.',
        status: 'APPROVED',
        createdAt: new Date(dateStr),
      },
    });

    // Create Album record for completed/editing bookings
    if (['EDITING', 'ALBUM_DESIGNING', 'PRINTING', 'READY_FOR_DELIVERY', 'COMPLETED'].includes(status)) {
      await prisma.album.create({
        data: {
          bookingId: booking.id,
          type: pick(['PREMIUM', 'ACRYLIC', 'MAGAZINE', 'HD']),
          status: status === 'COMPLETED' ? 'COMPLETED' : 'IN_EDITING',
          designStatus: status === 'COMPLETED' ? 'DELIVERED' : 'DESIGNING',
          editorId: dbEmployees['EDITOR'],
          notes: 'Hyderabadi album design template.',
          rawLink: `https://drive.google.com/drive/folders/hyd_raw_${booking.id.substring(0, 6)}`,
          editedLink: `https://drive.google.com/drive/folders/hyd_edited_${booking.id.substring(0, 6)}`,
        },
      });
    }
  }

  // Seed inventory
  console.log('Seeding camera equipment inventory...');
  const inventoryItems = [
    { name: 'Sony FX6 Cinema Camera', category: 'CAMERA', serialNumber: 'SN-FX6-HYD001', status: 'AVAILABLE', notes: '4K Full Frame Cinema Rig' },
    { name: 'Sony Alpha 7S III Body 1', category: 'CAMERA', serialNumber: 'SN-A7S3-HYD002', status: 'AVAILABLE' },
    { name: 'Sony Alpha 7S III Body 2', category: 'CAMERA', serialNumber: 'SN-A7S3-HYD003', status: 'AVAILABLE' },
    { name: 'Sony Alpha 7R V High-Res Body', category: 'CAMERA', serialNumber: 'SN-A7R5-HYD004', status: 'AVAILABLE' },
    { name: 'Sony FE 24-70mm f/2.8 GM II', category: 'LENS', serialNumber: 'SN-LENS-2470-HYD', status: 'AVAILABLE' },
    { name: 'Sony FE 70-200mm f/2.8 GM II', category: 'LENS', serialNumber: 'SN-LENS-70200-HYD', status: 'AVAILABLE' },
    { name: 'Sony FE 50mm f/1.2 GM Prime', category: 'LENS', serialNumber: 'SN-LENS-5012-HYD', status: 'AVAILABLE' },
    { name: 'DJI Inspire 3 Cinema Drone', category: 'DRONE', serialNumber: 'SN-INS3-HYD099', status: 'AVAILABLE', notes: '8K Raw Cinema Drone' },
    { name: 'DJI Mavic 3 Pro Cine', category: 'DRONE', serialNumber: 'SN-MAV3-HYD100', status: 'AVAILABLE' },
    { name: 'DJI Ronin 4D 6K Gimbal Rig', category: 'GIMBAL', serialNumber: 'SN-RONIN4D-HYD01', status: 'AVAILABLE' },
    { name: 'Aputure 600d Pro Lighting Strobe', category: 'LIGHT', serialNumber: 'SN-APUT-600D-HYD', status: 'AVAILABLE' },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.create({ data: item });
  }

  // Seed August & Monthly Expenses
  console.log('Seeding studio operating expenses...');
  const expenses = [
    { category: 'FUEL', amount: 35500, description: 'Fuel & transport for Taj Falaknuma, Novotel HICC & Ramoji shoots', date: '2026-08-04' },
    { category: 'PRINTING', amount: 185000, description: 'Acrylic & Velvet photobook printing charges for August deliveries', date: '2026-08-06' },
    { category: 'SALARY', amount: 368000, description: 'Monthly payroll for Photographers, Editors & Managers', date: '2026-08-01' },
    { category: 'MARKETING', amount: 95000, description: 'Jubilee Hills & Banjara Hills targeted Instagram & Google ads', date: '2026-08-02' },
    { category: 'EQUIPMENT', amount: 240000, description: 'Heavy Jimmy Jib Crane & 4K Outdoor LED Wall rentals for August weddings', date: '2026-08-10' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }

  console.log('Successfully generated 310+ Hyderabadi Orders / Bookings with massive August turnover!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
