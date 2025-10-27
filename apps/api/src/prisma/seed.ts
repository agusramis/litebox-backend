import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Example seed data for related posts
  const post1 = await prisma.relatedPost.create({
    data: {
      title: 'Getting Started with AWS Lambda',
      imageKey: 'lite-box/2025-10-21/sample-lambda.jpg',
    },
  });

  const post2 = await prisma.relatedPost.create({
    data: {
      title: 'Best Practices for Serverless Architecture',
      imageKey: 'lite-box/2025-10-21/sample-serverless.jpg',
    },
  });

  const post3 = await prisma.relatedPost.create({
    data: {
      title: 'Understanding AWS S3 Storage Classes',
      imageKey: 'lite-box/2025-10-21/sample-s3.jpg',
    },
  });

  console.log('✅ Seeding completed!');
  console.log({ post1, post2, post3 });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
