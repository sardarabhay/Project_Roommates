import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Generate a random invite code
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.removalVote.deleteMany();
  await prisma.removalRequest.deleteMany();
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
  await prisma.household.deleteMany();

  // Create household first
  const household = await prisma.household.create({
    data: {
      name: 'Apartment 4B',
      inviteCode: generateInviteCode(),
      createdByUserId: 1, // Will be updated after creating the admin user
    },
  });

  console.log(`✅ Created household: ${household.name} (Code: ${household.inviteCode})`);

  // Create users with household
  const hashedPassword = await bcrypt.hash('password123', 10);

  const abhay = await prisma.user.create({
    data: {
      name: 'Abhay',
      email: 'abhay@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/A8D5BA/004643?text=A',
      role: 'admin',
      householdId: household.id,
    },
  });

  // Update household with correct createdByUserId
  await prisma.household.update({
    where: { id: household.id },
    data: { createdByUserId: abhay.id },
  });

  const bilal = await prisma.user.create({
    data: {
      name: 'Bilal',
      email: 'bilal@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/F0A692/FFFFFF?text=B',
      role: 'member',
      householdId: household.id,
    },
  });

  const chatur = await prisma.user.create({
    data: {
      name: 'Chatur',
      email: 'chatur@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/F6D9C2/000000?text=C',
      role: 'member',
      householdId: household.id,
    },
  });

  const deepak = await prisma.user.create({
    data: {
      name: 'Deepak',
      email: 'deepak@example.com',
      password: hashedPassword,
      avatarUrl: 'https://placehold.co/100x100/004643/FFFFFF?text=D',
      role: 'member',
      householdId: household.id,
    },
  });

  console.log('✅ Created users');

  // Create expenses with householdId
  const groceries = await prisma.expense.create({
    data: {
      description: 'Groceries',
      totalAmount: 500,
      paidByUserId: bilal.id,
      householdId: household.id,
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
      householdId: household.id,
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
      householdId: household.id,
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

  // Create chores with householdId
  await prisma.chore.createMany({
    data: [
      { title: 'Clean Kitchen', assignedToUserId: abhay.id, points: 20, status: 'todo', householdId: household.id },
      { title: 'Buy Tissue Paper', assignedToUserId: null, points: 5, status: 'todo', householdId: household.id },
      { title: 'Take out recycling', assignedToUserId: deepak.id, points: 10, status: 'in_progress', householdId: household.id },
      { title: 'Bathroom Deep Clean', assignedToUserId: chatur.id, points: 30, status: 'done', householdId: household.id },
      { title: 'Wipe down kitchen counter', assignedToUserId: bilal.id, points: 5, status: 'done', householdId: household.id },
    ],
  });

  console.log('✅ Created chores');

  // Create events with householdId
  const boardGame = await prisma.event.create({
    data: {
      title: 'Board Game Night',
      date: new Date('2025-09-20T19:00:00'),
      location: 'Living Room',
      createdByUserId: chatur.id,
      householdId: household.id,
    },
  });

  const hiking = await prisma.event.create({
    data: {
      title: 'Weekend Hiking Trip',
      date: new Date('2025-09-27T08:00:00'),
      location: 'Meet at entrance',
      createdByUserId: deepak.id,
      householdId: household.id,
    },
  });

  console.log('✅ Created events');

  // Create landlord with householdId
  await prisma.landlord.create({
    data: {
      name: 'Mr. Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'rajesh.sharma@gmail.com',
      householdId: household.id,
    },
  });

  console.log('✅ Created landlord');

  // Create issues with householdId
  await prisma.issue.createMany({
    data: [
      { title: 'Leaky Faucet in Kitchen', status: 'Reported', reportedByUserId: abhay.id, householdId: household.id },
      { title: 'Balcony door lock is stiff', status: 'Resolved', reportedByUserId: bilal.id, householdId: household.id },
    ],
  });

  console.log('✅ Created issues');

  // Create documents with householdId
  await prisma.document.create({
    data: {
      name: 'Rental Agreement 2025.pdf',
      uploadedByUserId: abhay.id,
      size: '2.4 MB',
      householdId: household.id,
    },
  });

  console.log('✅ Created documents');

  // Create house rules with householdId
  await prisma.houseRule.createMany({
    data: [
      { content: 'Quiet hours are from 11 PM to 7 AM on weeknights.', orderNum: 1, householdId: household.id },
      { content: 'Clean up common areas after use.', orderNum: 2, householdId: household.id },
      { content: 'Guests are welcome, but please give a heads-up for overnight stays.', orderNum: 3, householdId: household.id },
      { content: 'Label your food in the fridge.', orderNum: 4, householdId: household.id },
    ],
  });

  console.log('✅ Created house rules');

  // Create bulletin posts with householdId
  await prisma.bulletinPost.createMany({
    data: [
      { 
        content: "Hey everyone, I'm having a package delivered on Friday, could you keep an eye out?", 
        postedByUserId: chatur.id,
        householdId: household.id,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      { 
        content: "The mixer grinder seems to be making a weird noise. Let's not use it until we check it out.", 
        postedByUserId: deepak.id,
        householdId: household.id,
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
