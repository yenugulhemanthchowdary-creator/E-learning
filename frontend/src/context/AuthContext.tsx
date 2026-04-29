import { createContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    extras?: { phone?: string; bio?: string; learningGoals?: string[] },
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("eduai-auth");
    if (!cached) {
      setReady(true);
      return;
    }

    let parsed: { user: User; token: string };
    try {
      parsed = JSON.parse(cached) as { user: User; token: string };
    } catch {
      localStorage.removeItem("eduai-auth");
      setReady(true);
      return;
    }

    authApi
      .me(parsed.token)
      .then((verifiedUser) => {
        setUser(verifiedUser);
        setToken(parsed.token);
        localStorage.setItem("eduai-auth", JSON.stringify({ user: verifiedUser, token: parsed.token }));
      })
      .catch(() => {
        localStorage.removeItem("eduai-auth");
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  const persist = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    setReady(true);
    localStorage.setItem("eduai-auth", JSON.stringify({ user: nextUser, token: nextToken }));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      async login(email, password) {
        const data = await authApi.login(email, password);
        persist(data.user, data.token);
      },
      async register(fullName, email, password, extras) {
        const data = await authApi.register(fullName, email, password, extras);
        persist(data.user, data.token);
      },
      logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("eduai-auth");
      },
    }),
    [ready, user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
