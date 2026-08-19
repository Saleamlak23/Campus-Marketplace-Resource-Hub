import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding universities and demo users...');

  // Backend auth stores domains WITH @ prefix (see auth.service.ts extractUniversityDomain)
  const insa = await prisma.university.upsert({
    where: { id: 'uni-insa' },
    update: {},
    create: {
      id: 'uni-insa',
      name: 'Institute of Science and Technology (INSA)',
      allowedEmailDomains: ['@insa.edu.et', '@student.insa.edu.et'],
    },
  });

  const aau = await prisma.university.upsert({
    where: { id: 'uni-aau' },
    update: {},
    create: {
      id: 'uni-aau',
      name: 'Addis Ababa University',
      allowedEmailDomains: ['@aau.edu.et', '@student.aau.edu.et'],
    },
  });

  const aastu = await prisma.university.upsert({
    where: { id: 'uni-aastu' },
    update: {},
    create: {
      id: 'uni-aastu',
      name: 'Addis Ababa Science and Technology University',
      allowedEmailDomains: ['@aastu.edu.et', '@student.aastu.edu.et'],
    },
  });

  const demo = await prisma.university.upsert({
    where: { id: 'uni-demo' },
    update: {},
    create: {
      id: 'uni-demo',
      name: 'Demo University',
      allowedEmailDomains: ['@university.edu', '@student.university.edu'],
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'student@insa.edu.et' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@insa.edu.et',
      passwordHash,
      department: 'Computer Science',
      universityIdNumber: 'INSA/2024/001',
      universityId: insa.id,
      role: 'STUDENT',
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'test@aastu.edu.et' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@aastu.edu.et',
      passwordHash,
      department: 'Computer Science',
      universityId: aastu.id,
      role: 'STUDENT',
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@aau.edu.et' },
    update: {},
    create: {
      name: 'AAU Student',
      email: 'student@aau.edu.et',
      passwordHash,
      department: 'Software Engineering',
      universityId: aau.id,
      role: 'STUDENT',
      isVerified: true,
    },
  });

  // Sample listing for GET /api/listings testing
  const seller = await prisma.user.findUnique({ where: { email: 'test@aastu.edu.et' } });
  if (seller) {
    const existingListing = await prisma.listing.findFirst({
      where: { sellerId: seller.id, title: 'Introduction to Algorithms' },
    });

    if (!existingListing) {
      await prisma.listing.create({
        data: {
          title: 'Introduction to Algorithms',
          description: 'Used textbook in good condition',
          category: 'TEXTBOOK',
          price: 450,
          condition: 'GOOD',
          department: 'Computer Science',
          images: [],
          sellerId: seller.id,
          universityId: aastu.id,
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log('');
  console.log('Demo login credentials (Postman):');
  console.log('  Email: test@aastu.edu.et');
  console.log('  Password: password123');
  console.log('');
  console.log('  Email: student@insa.edu.et');
  console.log('  Password: password123');
  console.log('');
  console.log('Valid register domains: @aau.edu.et, @aastu.edu.et, @insa.edu.et, @university.edu');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
