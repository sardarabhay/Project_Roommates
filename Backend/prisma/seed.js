import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.eventRsvp.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.chore.deleteMany();
  await prisma.event.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.document.deleteMany();
  await prisma.bulletinPost.deleteMany();
  await prisma.houseRule.deleteMany();
  await prisma.landlord.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const abhay = await prisma.user.create({
    data: {
      name: 'Abhay',
      email: 'abhay@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/A8D5BA/004643?text=A',
    },
  });

  const bilal = await prisma.user.create({
    data: {
      name: 'Bilal',
      email: 'bilal@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/F0A692/FFFFFF?text=B',
    },
  });

  const chatur = await prisma.user.create({
    data: {
      name: 'Chatur',
      email: 'chatur@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/F6D9C2/000000?text=C',
    },
  });

  const deepak = await prisma.user.create({
    data: {
      name: 'Deepak',
      email: 'deepak@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/004643/FFFFFF?text=D',
    },
  });

  console.log('✅ Created users');

  // Create expenses
  const groceries = await prisma.expense.create({
    data: {
      description: 'Groceries',
      totalAmount: 500,
      paidByUserId: bilal.id,
      date: new Date('2025-09-18'),
      splits: {
        create: [
          { owedByUserId: abhay.id, amount: 200, status: 'pending' },
          { owedByUserId: chatur.id, amount: 200, status: 'pending' },
          { owedByUserId: deepak.id, amount: 200, status: 'pending' },
        ],
      },
    },
  });

  const wifi = await prisma.expense.create({
    data: {
      description: 'Wi-Fi Bill',
      totalAmount: 800,
      paidByUserId: chatur.id,
      date: new Date('2025-09-15'),
      splits: {
        create: [
          { owedByUserId: abhay.id, amount: 300, status: 'pending' },
        ],
      },
    },
  });

  const pizza = await prisma.expense.create({
    data: {
      description: 'Movie Night Pizza',
      totalAmount: 1000,
      paidByUserId: abhay.id,
      date: new Date('2025-09-12'),
      splits: {
        create: [
          { owedByUserId: bilal.id, amount: 250, status: 'pending' },
          { owedByUserId: deepak.id, amount: 250, status: 'pending' },
        ],
      },
    },
  });

  console.log('✅ Created expenses');

  // Create chores
  await prisma.chore.createMany({
    data: [
      { title: 'Clean Kitchen', assignedToUserId: abhay.id, points: 20, status: 'todo' },
      { title: 'Buy Tissue Paper', assignedToUserId: null, points: 5, status: 'todo' },
      { title: 'Take out recycling', assignedToUserId: deepak.id, points: 10, status: 'in_progress' },
      { title: 'Bathroom Deep Clean', assignedToUserId: chatur.id, points: 30, status: 'done' },
      { title: 'Wipe down kitchen counter', assignedToUserId: bilal.id, points: 5, status: 'done' },
    ],
  });

  console.log('✅ Created chores');

  // Create events
  const boardGame = await prisma.event.create({
    data: {
      title: 'Board Game Night',
      date: new Date('2025-09-20T19:00:00'),
      location: 'Living Room',
      createdByUserId: chatur.id,
    },
  });

  const hiking = await prisma.event.create({
    data: {
      title: 'Weekend Hiking Trip',
      date: new Date('2025-09-27T08:00:00'),
      location: 'Meet at entrance',
      createdByUserId: deepak.id,
    },
  });

  console.log('✅ Created events');

  // Create landlord
  await prisma.landlord.create({
    data: {
      name: 'Mr. Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'rajesh.sharma@gmail.com',
    },
  });

  console.log('✅ Created landlord');

  // Create issues
  await prisma.issue.createMany({
    data: [
      { title: 'Leaky Faucet in Kitchen', status: 'Reported', reportedByUserId: abhay.id },
      { title: 'Balcony door lock is stiff', status: 'Resolved', reportedByUserId: bilal.id },
    ],
  });

  console.log('✅ Created issues');

  // Create documents
  await prisma.document.create({
    data: {
      name: 'Rental Agreement 2025.pdf',
      uploadedByUserId: abhay.id,
      size: '2.4 MB',
    },
  });

  console.log('✅ Created documents');

  // Create house rules
  await prisma.houseRule.createMany({
    data: [
      { content: 'Quiet hours are from 11 PM to 7 AM on weeknights.', orderNum: 1 },
      { content: 'Clean up common areas after use.', orderNum: 2 },
      { content: 'Guests are welcome, but please give a heads-up for overnight stays.', orderNum: 3 },
      { content: 'Label your food in the fridge.', orderNum: 4 },
    ],
  });

  console.log('✅ Created house rules');

  // Create bulletin posts
  await prisma.bulletinPost.createMany({
    data: [
      { 
        content: "Hey everyone, I'm having a package delivered on Friday, could you keep an eye out?", 
        postedByUserId: chatur.id,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      { 
        content: "The mixer grinder seems to be making a weird noise. Let's not use it until we check it out.", 
        postedByUserId: deepak.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
    ],
  });

  console.log('✅ Created bulletin posts');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
