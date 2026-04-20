import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useEffect, useMemo, useState } from "react";
export const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("eduai-theme") || "dark");
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("eduai-theme", theme);
    }, [theme]);
    const value = useMemo(() => ({
        theme,
        toggleTheme: () => setTheme((previous) => (previous === "dark" ? "light" : "dark")),
    }), [theme]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
}
