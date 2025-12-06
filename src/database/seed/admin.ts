import argon2 from "argon2";
import { ENV } from "@/configs";
import { AdminRepository } from "@/database/repositories";

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

    const adminRepository = new AdminRepository();

    // Check if admin already exists
    const existingAdmin = await adminRepository.findByUsername(username);

    if (existingAdmin) {
        // Update existing admin password
        await adminRepository.updateByUsername(username, {
            password: hashedPassword,
        });
        console.log(`Admin user "${username}" password updated successfully`);
    } else {
        // Insert new admin
        await adminRepository.create({
            username,
            password: hashedPassword,
        });
        console.log(`Admin user "${username}" created successfully`);
    }
}
