import argon2 from "argon2";
import { db } from "@/configs/db";
import { admin } from "@/database/schema";
import { ENV } from "@/configs";
import { eq } from "drizzle-orm";

export async function seedAdmin() {
    // Ensure environment is configured
    ENV.configEnvironment();

    const username = "admin";
    const password = ENV.ADMIN_PASSWORD;

    if (!password) {
        throw new Error("ADMIN_PASSWORD is not set in environment variables");
    }

    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // Check if admin already exists
    const existingAdmin = await db
        .select()
        .from(admin)
        .where(eq(admin.username, username))
        .limit(1);

    if (existingAdmin.length > 0) {
        // Update existing admin password
        await db
            .update(admin)
            .set({ password: hashedPassword })
            .where(eq(admin.username, username));
        console.log(`Admin user "${username}" password updated successfully`);
    } else {
        // Insert new admin
        await db.insert(admin).values({
            username,
            password: hashedPassword,
        });
        console.log(`Admin user "${username}" created successfully`);
    }
}
