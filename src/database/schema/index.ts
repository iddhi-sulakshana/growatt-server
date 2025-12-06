import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const admin = pgTable("admin", {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    password: text("password").notNull(),
});
