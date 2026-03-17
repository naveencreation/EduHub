import { prisma } from "../db";
import { hashPassword } from "../utils/auth";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@eduhub.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe@SecurePassword123";

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(adminPassword);

    // Create default admin
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: "Admin",
      },
    });

    console.log(`✅ Admin user created successfully`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log(`\n💡 Use these credentials to login:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
