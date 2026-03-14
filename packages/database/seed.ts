import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data (careful in production!)
  await prisma.contentTag.deleteMany();
  await prisma.content.deleteMany();
  await prisma.course.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.admin.deleteMany();

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@eduhub.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      name: "Admin",
    },
  });

  console.log(`✅ Created admin: ${admin.email}`);

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: "beginner",
        slug: "beginner",
      },
    }),
    prisma.tag.create({
      data: {
        name: "intermediate",
        slug: "intermediate",
      },
    }),
    prisma.tag.create({
      data: {
        name: "advanced",
        slug: "advanced",
      },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
