import { db } from "@/configs/db";
import type { Admin, NewAdmin } from "../entities";
import { admin } from "../schema";
import { eq } from "drizzle-orm";

export class AdminRepository {
    async findByUsername(username: string): Promise<Admin | null> {
        const result = await db
            .select()
            .from(admin)
            .where(eq(admin.username, username))
            .limit(1);
        return result[0] || null;
    }

    async findById(id: number): Promise<Admin | null> {
        const result = await db
            .select()
            .from(admin)
            .where(eq(admin.id, id))
            .limit(1);
        return result[0] || null;
    }

    async create(data: NewAdmin): Promise<Admin> {
        const result = await db.insert(admin).values(data).returning();
        return result[0];
    }

    async updateByUsername(
        username: string,
        data: Partial<NewAdmin>
    ): Promise<Admin> {
        const result = await db
            .update(admin)
            .set(data)
            .where(eq(admin.username, username))
            .returning();
        return result[0];
    }
}
