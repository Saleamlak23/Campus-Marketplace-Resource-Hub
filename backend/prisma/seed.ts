import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'CampusDemo123!';

async function getOrCreateUniversity(name: string, allowedEmailDomains: string[]) {
  const existing = await prisma.university.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.university.create({ data: { name, allowedEmailDomains } });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const aau = await getOrCreateUniversity('Addis Ababa University', ['@aau.edu.et']);
  const astu = await getOrCreateUniversity('Adama Science and Technology University', ['@astu.edu.et']);

  const [hana, abel, selam] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'hana.demo@aau.edu.et' },
      update: { name: 'Hana Tesfaye', passwordHash, universityId: aau.id, isVerified: true },
      create: { name: 'Hana Tesfaye', email: 'hana.demo@aau.edu.et', passwordHash, universityId: aau.id, department: 'Computer Science', isVerified: true },
    }),
    prisma.user.upsert({
      where: { email: 'abel.demo@aau.edu.et' },
      update: { name: 'Abel Mekonnen', passwordHash, universityId: aau.id, isVerified: true },
      create: { name: 'Abel Mekonnen', email: 'abel.demo@aau.edu.et', passwordHash, universityId: aau.id, department: 'Software Engineering', isVerified: true },
    }),
    prisma.user.upsert({
      where: { email: 'selam.demo@astu.edu.et' },
      update: { name: 'Selam Abate', passwordHash, universityId: astu.id, isVerified: true },
      create: { name: 'Selam Abate', email: 'selam.demo@astu.edu.et', passwordHash, universityId: astu.id, department: 'Information Technology', isVerified: true },
    }),
  ]);

  const listing = await prisma.listing.findFirst({ where: { universityId: aau.id, title: 'Introduction to Algorithms, 4th Edition' } })
    ?? await prisma.listing.create({
      data: {
        universityId: aau.id, sellerId: hana.id, title: 'Introduction to Algorithms, 4th Edition',
        description: 'Clean copy with a few pencil notes.', category: 'TEXTBOOK', price: 850,
        condition: 'GOOD', department: 'Computer Science', images: [],
      },
    });

  await prisma.tutorProfile.upsert({
    where: { userId: abel.id },
    update: { subjects: ['Data Structures', 'Algorithms'], hourlyRate: 250, isVerified: true },
    create: {
      universityId: aau.id, userId: abel.id, subjects: ['Data Structures', 'Algorithms'], hourlyRate: 250,
      availability: 'Weekdays after 5 PM', bio: 'Software engineering student who enjoys peer tutoring.', isVerified: true,
    },
  });

  const booking = await prisma.booking.findFirst({ where: { universityId: aau.id, studentId: hana.id, tutorId: abel.id, subject: 'Algorithms' } })
    ?? await prisma.booking.create({
      data: { universityId: aau.id, studentId: hana.id, tutorId: abel.id, subject: 'Algorithms', scheduledAt: new Date('2026-09-01T15:00:00.000Z'), notes: 'Review graph algorithms.' },
    });

  const participantIds = [hana.id, abel.id].sort();
  const conversation = await prisma.conversation.findFirst({ where: { universityId: aau.id, participantIds: { equals: participantIds } } })
    ?? await prisma.conversation.create({ data: { universityId: aau.id, participantIds } });
  if (await prisma.message.count({ where: { conversationId: conversation.id } }) === 0) {
    await prisma.message.create({ data: { conversationId: conversation.id, senderId: hana.id, content: 'Hi Abel, is the algorithms session still available?' } });
  }

  await prisma.transaction.upsert({
    where: { id: `seed-${booking.id}` },
    update: {},
    create: { id: `seed-${booking.id}`, userId: hana.id, relatedType: 'TUTORING_BOOKING', relatedId: booking.id, amount: 250, status: 'PENDING' },
  });

  console.log(`Seeded ${aau.name} and ${astu.name}. Demo password: ${DEMO_PASSWORD}`);
  console.log(`Created listing: ${listing.title}; tutor booking: ${booking.id}; ASTU demo user: ${selam.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
