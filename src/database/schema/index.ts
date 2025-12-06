import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const sample = pgTable("sample", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
});
