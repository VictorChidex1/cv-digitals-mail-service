import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Approved initial schema: settings only.
 *
 * Domain entities (email accounts, prospects, campaigns, drafts, approvals,
 * messages, follow-ups, suppressions) are created in their own approved phases.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type SettingRow = typeof settings.$inferSelect;
export type NewSettingRow = typeof settings.$inferInsert;
