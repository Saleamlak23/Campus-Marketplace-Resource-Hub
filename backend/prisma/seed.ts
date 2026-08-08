import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: seed at least two universities to demonstrate multi-tenancy,
  // plus demo users/listings for reviewers. See docs/plan.md Section 10.
  console.log('Seed script placeholder — add seed data here.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
