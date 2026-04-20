import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
export const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const cached = localStorage.getItem("eduai-auth");
        if (!cached) {
            setReady(true);
            return;
        }
        let parsed;
        try {
            parsed = JSON.parse(cached);
        }
        catch {
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
    const persist = (nextUser, nextToken) => {
        setUser(nextUser);
        setToken(nextToken);
        setReady(true);
        localStorage.setItem("eduai-auth", JSON.stringify({ user: nextUser, token: nextToken }));
    };
    const value = useMemo(() => ({
        user,
        token,
        ready,
        async login(email, password) {
            const data = await authApi.login(email, password);
            persist(data.user, data.token);
        },
        async register(fullName, email, password) {
            const data = await authApi.register(fullName, email, password);
            persist(data.user, data.token);
        },
        logout() {
            setUser(null);
            setToken(null);
            localStorage.removeItem("eduai-auth");
        },
    }), [ready, user, token]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
