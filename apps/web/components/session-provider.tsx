"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseAuth } from "@/lib/firebase";

interface SessionValue {
  user: User | null;
  loading: boolean;
}

const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
});

/**
 * Single source of client session state for the workspace. Unauthenticated
 * visitors are redirected to /login; the API remains the real security boundary.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(
        getFirebaseAuth(),
        (nextUser) => {
          setUser(nextUser);
          setLoading(false);
          if (nextUser === null) router.replace("/login");
        },
        () => {
          setLoading(false);
          router.replace("/login");
        },
      );
    } catch {
      setLoading(false);
      router.replace("/login");
    }

    return () => unsubscribe?.();
  }, [router]);

  return (
    <SessionContext.Provider value={{ user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
