import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'ArJUN', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advait', 'Pranav', 'Adhiraj', 'Kabir', 'Rudra', 'Rohan', 'Ananya', 'Diya',
  'Saanvi', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Angel', 'Avani', 'Myra', 'Ira', 'Riya',
  'Kavya', 'Siddharth', 'Nikhil', 'Manish', 'Karthik', 'Suresh', 'Ramesh', 'Vikram', 'Pooja', 'Priya',
  'Neha', 'Shruti', 'Deepak', 'Rajesh', 'Sanjay', 'Sunil', 'Amit', 'Rahul', 'Sneha', 'Megha',
  'Varun', 'Tarun', 'Harish', 'Ganesh', 'Venkat', 'Srinivas', 'Laxmi', 'Swati', 'Preeti', 'Divya',
  'Bhavana', 'Tejas', 'Akash', 'Chetan', 'Yash', 'Kunal', 'Abhishek', 'Gaurav', 'Vishal', 'Alok',
  'Suraj', 'Dhiraj', 'Manoj', 'Mahesh', 'Santosh', 'Pawan', 'Aakash', 'Shubham', 'Saurabh', 'Nitin'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Rao', 'Joshi', 'Kulkarni', 'Deshmukh', 'Yadav',
  'Singh', 'Kumar', 'Choudhary', 'Shah', 'Mehta', 'Agarwal', 'Nair', 'Menon', 'Pillai', 'Shukla',
  'Tiwari', 'Pandey', 'Mishra', 'Bhat', 'Hegde', 'Shetty', 'Gowda', 'Naidu', 'Raju', 'Basha',
  'Khan', 'Ali', 'Shaik', 'Syed', 'Pathan', 'Chauhan', 'Thakur', 'Kapoor', 'Malhotra', 'Khanna'
];

const CITIES = [
  { city: 'Bengaluru', state: 'Karnataka', pin: '560001' },
  { city: 'Hyderabad', state: 'Telangana', pin: '500001' },
  { city: 'Mumbai', state: 'Maharashtra', pin: '400001' },
  { city: 'Pune', state: 'Maharashtra', pin: '411001' },
  { city: 'Chennai', state: 'Tamil Nadu', pin: '600001' },
  { city: 'Delhi', state: 'Delhi', pin: '110001' },
  { city: 'Ahmedabad', state: 'Gujarat', pin: '380001' },
  { city: 'Kolkata', state: 'West Bengal', pin: '700001' },
  { city: 'Jaipur', state: 'Rajasthan', pin: '302001' },
  { city: 'Kochi', state: 'Kerala', pin: '682001' },
];

async function main() {
  console.log('Generating 100 realistic client profiles...');

  const clientsData = [];
  const basePhone = 9800000000;

  for (let i = 1; i <= 100; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;
    const phone = `+91${basePhone + i * 1377 % 900000000}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
    const loc = CITIES[i % CITIES.length];

    clientsData.push({
      name: fullName,
      phone: phone,
      whatsappNumber: phone,
      email: email,
      address: `${Math.floor(10 + Math.random() * 90)}, ${firstName} Enclave, Main Road`,
      city: loc.city,
      state: loc.state,
      pincode: loc.pin,
      notes: `VIP Studio Client ${i} - Registered via R2R Studio ERP`,
    });
  }

  // Insert in batch
  const count = await prisma.client.createMany({
    data: clientsData,
    skipDuplicates: true,
  });

  console.log(`Successfully added ${count.count} clients to the database!`);
}

main()
  .catch((e) => {
    console.error('Error seeding clients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
