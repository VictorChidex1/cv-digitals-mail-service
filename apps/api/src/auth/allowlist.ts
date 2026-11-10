import type { VerifiedIdentity } from "./verify-token.js";

export interface AllowlistConfig {
  emails: string[];
  uids: string[];
}

export interface Allowlist {
  isConfigured: boolean;
  allows(identity: VerifiedIdentity): boolean;
}

/**
 * Application-level authorization. Firebase proves *who* the caller is; this
 * decides whether that identity may use the application at all.
 */
export function createAllowlist(config: AllowlistConfig): Allowlist {
  const emails = new Set(
    config.emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
  );
  const uids = new Set(
    config.uids.map((uid) => uid.trim()).filter(Boolean),
  );

  return {
    isConfigured: emails.size > 0 || uids.size > 0,
    allows(identity: VerifiedIdentity): boolean {
      if (uids.has(identity.uid)) return true;
      if (identity.email !== null && emails.has(identity.email.toLowerCase())) {
        return true;
      }
      return false;
    },
  };
}
