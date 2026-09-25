import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Local Food Bank Network database...');

  // Clean existing records
  await prisma.distributionLog.deleteMany();
  await prisma.recipientRequest.deleteMany();
  await prisma.foodDonation.deleteMany();
  await prisma.foodBank.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Users
  await prisma.user.create({
    data: {
      name: 'Elena Rostova (Pantry Director)',
      email: 'admin@nourishlink.org',
      passwordHash,
      role: 'ADMIN',
      phone: '+1 (555) 019-2834',
      city: 'Downtown Metro',
      isVerified: true,
    },
  });

  const donor1 = await prisma.user.create({
    data: {
      name: 'FreshHarvest Organics (Supermarket)',
      email: 'donor@freshharvest.com',
      passwordHash,
      role: 'DONOR',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'North Hills',
      isVerified: true,
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      name: 'Golden Grain Artisan Bakery',
      email: 'baker@goldengrain.com',
      passwordHash,
      role: 'DONOR',
      phone: '+1 (555) 876-5432',
      address: '104 Commerce St',
      city: 'Westside',
      isVerified: true,
    },
  });

  const recipient1 = await prisma.user.create({
    data: {
      name: 'Maria Garcia',
      email: 'maria.recipient@gmail.com',
      passwordHash,
      role: 'RECIPIENT',
      phone: '+1 (555) 345-9876',
      address: '512 Oak Ridge Court',
      city: 'Downtown Metro',
      isVerified: true,
    },
  });

  const recipient2 = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.c@gmail.com',
      passwordHash,
      role: 'RECIPIENT',
      phone: '+1 (555) 456-1122',
      address: '88 Riverfront Ave',
      city: 'Westside',
      isVerified: true,
    },
  });

  // 2. Seed Food Banks
  const foodBank1 = await prisma.foodBank.create({
    data: {
      name: 'Community Hope Central Pantry',
      address: '120 Hope Boulevard',
      city: 'Downtown Metro',
      zipCode: '90012',
      contactPhone: '+1 (555) 998-1122',
      contactEmail: 'contact@communityhope.org',
      capacityKg: 8000,
      currentStockKg: 2450,
      operatingHours: 'Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM',
    },
  });

  const foodBank2 = await prisma.foodBank.create({
    data: {
      name: 'Westside Interfaith Food Hub',
      address: '459 Unity Way',
      city: 'Westside',
      zipCode: '90024',
      contactPhone: '+1 (555) 774-3321',
      contactEmail: 'westside@interfaithfood.org',
      capacityKg: 4500,
      currentStockKg: 1320,
      operatingHours: 'Tue-Sat 9:00 AM - 5:00 PM',
    },
  });

  // 3. Seed Food Donations
  const today = new Date();
  const twoDaysLater = new Date(today.getTime() + 48 * 60 * 60 * 1000);
  const tenDaysLater = new Date(today.getTime() + 240 * 60 * 60 * 1000);

  await prisma.foodDonation.create({
    data: {
      donorId: donor1.id,
      foodBankId: foodBank1.id,
      title: 'Fresh Organic Baby Spinach & Salad Greens',
      description: 'Pre-washed baby spinach and mixed crisp spring mix in cold packs.',
      category: 'PRODUCE',
      quantity: 45,
      unit: 'KG',
      perishableDate: twoDaysLater,
      storageReq: 'REFRIGERATED',
      status: 'AVAILABLE',
      aiUrgencyScore: 78,
      aiTriageNotes: 'Short shelf life greens. Ideal for immediate distribution to shelters and walk-ins.',
      dietaryTags: JSON.stringify(['Vegetarian', 'Vegan', 'Gluten-Free', 'Diabetic-Friendly']),
      pickupAddress: '742 Evergreen Terrace (Dock #2)',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=60',
    },
  });

  await prisma.foodDonation.create({
    data: {
      donorId: donor2.id,
      foodBankId: foodBank1.id,
      title: 'Whole Grain Sourdough & Sandwich Bread',
      description: 'Daily surplus artisan sourdough batards and sliced whole grain loaves.',
      category: 'BAKERY',
      quantity: 35,
      unit: 'ITEMS',
      perishableDate: twoDaysLater,
      storageReq: 'AMBIENT',
      status: 'AVAILABLE',
      aiUrgencyScore: 65,
      aiTriageNotes: 'Freshly baked without preservatives. Consume or freeze within 48 hours.',
      dietaryTags: JSON.stringify(['Vegetarian', 'Vegan', 'Halal-Friendly']),
      pickupAddress: '104 Commerce St (Front counter)',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60',
    },
  });

  await prisma.foodDonation.create({
    data: {
      donorId: donor1.id,
      foodBankId: foodBank2.id,
      title: 'Canned Low-Sodium Black Beans & Sweet Corn',
      description: 'Cases of 15oz canned legumes and vegetables, shelf-stable.',
      category: 'CANNED',
      quantity: 120,
      unit: 'ITEMS',
      perishableDate: tenDaysLater,
      storageReq: 'AMBIENT',
      status: 'AVAILABLE',
      aiUrgencyScore: 12,
      aiTriageNotes: 'High stability buffer stock. Long shelf life.',
      dietaryTags: JSON.stringify(['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal-Friendly', 'Diabetic-Friendly']),
      pickupAddress: '742 Evergreen Terrace',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
    },
  });

  // 4. Seed Recipient Requests
  await prisma.recipientRequest.create({
    data: {
      recipientId: recipient1.id,
      foodBankId: foodBank1.id,
      householdSize: 4,
      dietaryRequirements: JSON.stringify(['Gluten-Free', 'Diabetic-Friendly']),
      urgency: 'HIGH',
      status: 'PENDING',
      specialNotes: 'Senior grandmother has type 2 diabetes. Appreciate fresh produce and whole foods.',
    },
  });

  await prisma.recipientRequest.create({
    data: {
      recipientId: recipient2.id,
      foodBankId: foodBank1.id,
      householdSize: 2,
      dietaryRequirements: JSON.stringify(['Vegetarian', 'Halal-Friendly']),
      urgency: 'MEDIUM',
      status: 'PENDING',
      specialNotes: 'Working student household, can pick up in afternoons.',
    },
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
