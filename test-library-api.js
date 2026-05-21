const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLibraryAPI() {
  try {
    console.log('🔍 Testing library papers API...');
    
    // Test the same query as the API
    const where = {
      status: 'PUBLISHED'
    };

    const totalPapers = await prisma.paper.count({ where });
    console.log(`✅ Total published papers: ${totalPapers}`);

    const papers = await prisma.paper.findMany({
      where,
      include: {
        paperAuthors: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { authorOrder: 'asc' }
        },
        reviews: {
          where: { submittedAt: { not: null } },
          select: {
            score: true
          }
        },
        _count: {
          select: {
            reviews: {
              where: { submittedAt: { not: null } }
            },
            downloads: true
          }
        },
        issue: {
          select: {
            id: true,
            title: true,
            volume: true,
            issueNumber: true,
            year: true,
            publishDate: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      skip: 0,
      take: 12
    });

    console.log(`✅ Found ${papers.length} papers`);
    
    papers.forEach((paper, index) => {
      console.log(`\n📄 Paper ${index + 1}:`);
      console.log(`   Title: ${paper.title}`);
      console.log(`   Status: ${paper.status}`);
      console.log(`   Category: ${paper.category || 'No category'}`);
      console.log(`   Authors: ${paper.paperAuthors.length} author(s)`);
      console.log(`   Published: ${paper.publishedAt || 'Not published'}`);
      console.log(`   File Path: ${paper.filePath}`);
    });

    if (papers.length === 0) {
      console.log('\n⚠️  No published papers found. You may need to:');
      console.log('   1. Run: npx prisma db seed');
      console.log('   2. Check if papers have PUBLISHED status');
      console.log('   3. Verify database connection');
    }

  } catch (error) {
    console.error('❌ Error testing library API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLibraryAPI();