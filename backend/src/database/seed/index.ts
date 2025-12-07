import { seedAdmin } from "./admin";

async function main() {
    try {
        console.log("Starting database seeding...");
        await seedAdmin();
        console.log("Database seeding completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

main();
