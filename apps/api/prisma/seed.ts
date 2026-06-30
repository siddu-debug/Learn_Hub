import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@learnhub.dev' },
    update: {},
    create: {
      email: 'admin@learnhub.dev',
      name: 'Admin User',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: true,
      profile: { create: { bio: 'Platform administrator', headline: 'LearnHub Admin' } },
    },
  });

  const userHash = await bcrypt.hash('demo123456', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@learnhub.dev' },
    update: {},
    create: {
      email: 'demo@learnhub.dev',
      name: 'Demo User',
      passwordHash: userHash,
      emailVerified: true,
      profile: { create: { bio: 'Lifelong learner', headline: 'Full-Stack Developer' } },
    },
  });

  const tags = ['javascript', 'python', 'react', 'nextjs', 'machine-learning', 'web-development'];
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { slug: name },
      update: {},
      create: { name: name.replace(/-/g, ' '), slug: name },
    });
  }

  console.log('✅ Seeded admin:', admin.email);
  console.log('✅ Seeded demo user:', demoUser.email);
  console.log('✅ Seeded tags');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
