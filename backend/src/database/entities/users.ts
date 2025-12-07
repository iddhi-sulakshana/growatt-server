import type { admin } from "@/database/schema";

export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;
