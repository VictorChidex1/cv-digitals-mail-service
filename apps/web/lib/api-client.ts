import { getFirebaseAuth } from "./firebase";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4100";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Sends the caller's Firebase ID token as a Bearer credential. The API decides
 * identity from the verified token; this client never sends a uid.
 */
export async function apiFetch<T>(path: string): Promise<T> {
  const user = getFirebaseAuth().currentUser;
  if (user === null) {
    throw new ApiError("You are not signed in.", 401);
  }

  const token = await user.getIdToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (response.status === 403) {
      throw new ApiError(
        "This account is signed in but is not permitted to use this application.",
        403,
      );
    }

    throw new ApiError(
      body.error ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
