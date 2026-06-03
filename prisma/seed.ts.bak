import { PrismaClient, UserRole, PaperStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ijarcm.com' },
    update: {},
    create: {
      id: 'admin-001',
      email: 'admin@ijarcm.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      institution: 'IJARCM',
      isVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample student user
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash: studentPasswordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.STUDENT,
      institution: 'University of Commerce',
      isVerified: true,
    },
  });

  console.log('✅ Created student user:', student.email);

  // Create sample reviewer user
  const reviewerPasswordHash = await bcrypt.hash('reviewer123', 10);
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@example.com' },
    update: {},
    create: {
      email: 'reviewer@example.com',
      passwordHash: reviewerPasswordHash,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.REVIEWER,
      institution: 'Business School',
      isVerified: true,
    },
  });

  console.log('✅ Created reviewer user:', reviewer.email);

  // Create sample vendor user
  const vendorPasswordHash = await bcrypt.hash('vendor123', 10);
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      email: 'vendor@example.com',
      passwordHash: vendorPasswordHash,
      firstName: 'Business',
      lastName: 'Corp',
      role: UserRole.VENDOR,
      institution: 'Corporate Solutions Ltd',
      isVerified: true,
    },
  });

  console.log('✅ Created vendor user:', vendor.email);

  // Create sample published paper
  const samplePaper = await prisma.paper.upsert({
    where: { id: 'sample-001' },
    update: {},
    create: {
      id: 'sample-001',
      title: 'Digital Transformation in Modern Commerce: A Comprehensive Analysis',
      abstract: 'This paper examines the impact of digital transformation on modern commerce practices, analyzing key trends, challenges, and opportunities in the evolving business landscape. The study provides insights into how organizations can leverage technology to enhance their competitive advantage.',
      keywords: 'digital transformation,commerce,technology,business strategy,innovation',
      filePath: '/uploads/sample-paper.pdf',
      status: PaperStatus.PUBLISHED,
      category: 'Digital Commerce',
      submitterId: student.id,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created sample paper:', samplePaper.title);

  // Create paper author relationship
  await prisma.paperAuthor.upsert({
    where: { id: 'author-001' },
    update: {},
    create: {
      id: 'author-001',
      paperId: samplePaper.id,
      userId: student.id,
      authorOrder: 1,
      isCorresponding: true,
    },
  });

  console.log('✅ Created paper author relationship');

  // Create another sample paper
  const samplePaper2 = await prisma.paper.upsert({
    where: { id: 'sample-002' },
    update: {},
    create: {
      id: 'sample-002',
      title: 'Sustainable Management Practices in Global Supply Chains',
      abstract: 'An in-depth study of sustainable management practices across global supply chains, focusing on environmental impact, social responsibility, and economic viability. This research provides frameworks for implementing sustainable practices in complex organizational structures.',
      keywords: 'sustainability,supply chain,management,global business,environmental impact',
      filePath: '/uploads/sample-paper-2.pdf',
      status: PaperStatus.PUBLISHED,
      category: 'Supply Chain Management',
      submitterId: student.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  console.log('✅ Created second sample paper:', samplePaper2.title);

  // Create paper author relationship for second paper
  await prisma.paperAuthor.upsert({
    where: { id: 'author-002' },
    update: {},
    create: {
      id: 'author-002',
      paperId: samplePaper2.id,
      userId: student.id,
      authorOrder: 1,
      isCorresponding: true,
    },
  });

  console.log('✅ Database seeding completed successfully! 🎉');
  console.log('\n📋 Default login credentials:');
  console.log('Admin: admin@ijarcm.com / admin123');
  console.log('Student: student@example.com / student123');
  console.log('Reviewer: reviewer@example.com / reviewer123');
  console.log('Vendor: vendor@example.com / vendor123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });