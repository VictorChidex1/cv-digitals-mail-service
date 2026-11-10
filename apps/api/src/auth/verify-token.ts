import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

export interface VerifiedIdentity {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: string | null;
  token: DecodedIdToken;
}

export type VerifyToken = (idToken: string) => Promise<VerifiedIdentity>;

/**
 * Wraps Admin SDK verification. Identity is taken exclusively from the verified
 * token; nothing supplied by the client is trusted.
 */
export function createFirebaseTokenVerifier(
  checkRevoked = false,
): VerifyToken {
  return async (idToken: string): Promise<VerifiedIdentity> => {
    const token = await getAuth().verifyIdToken(idToken, checkRevoked);
    const provider = token.firebase?.sign_in_provider;

    return {
      uid: token.uid,
      email: typeof token.email === "string" ? token.email : null,
      emailVerified: token.email_verified === true,
      provider: typeof provider === "string" ? provider : null,
      token,
    };
  };
}
