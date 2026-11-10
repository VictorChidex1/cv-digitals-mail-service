import { asc, eq } from "drizzle-orm";

import type { AppDatabase } from "../client.js";
import { settings } from "../schema.js";

export interface SettingRecord {
  key: string;
  value: string;
  updatedAt: Date;
}

/**
 * The repository boundary: routes call this, never Drizzle or SQL directly.
 * Schema changes therefore touch one place instead of every route.
 */
export function createSettingsRepository(db: AppDatabase) {
  return {
    get(key: string): string | null {
      const row = db.select().from(settings).where(eq(settings.key, key)).get();
      return row?.value ?? null;
    },

    set(key: string, value: string): void {
      const updatedAt = new Date();
      db.insert(settings)
        .values({ key, value, updatedAt })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value, updatedAt },
        })
        .run();
    },

    list(): SettingRecord[] {
      return db
        .select()
        .from(settings)
        .orderBy(asc(settings.key))
        .all()
        .map((row) => ({
          key: row.key,
          value: row.value,
          updatedAt: row.updatedAt,
        }));
    },

    remove(key: string): boolean {
      const result = db.delete(settings).where(eq(settings.key, key)).run();
      return result.changes > 0;
    },
  };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;
