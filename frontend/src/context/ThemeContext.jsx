
// import { createContext, useContext, useEffect, useState } from "react";

// const ThemeContext = createContext(null);
// const STORAGE_KEY = "quire-theme";

// function applyTheme(theme) {
//     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//     const isDark = theme === "dark" || (theme === "system" && prefersDark);
//     document.documentElement.classList.toggle("dark", isDark);
//     localStorage.setItem(STORAGE_KEY, theme);
// }

// export function ThemeProvider({ children }) {
//     const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");

//     useEffect(() => {
//         applyTheme(theme);

//         if (theme !== "system") return;

//         const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
//         const handleChange = () => applyTheme("system");

//         mediaQuery.addEventListener("change", handleChange);
//         return () => mediaQuery.removeEventListener("change", handleChange);

//     }, []);

//     useEffect(() => { applyTheme(theme); }, [theme]);

//     return (
//         <ThemeContext.Provider value={{ theme, setTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     );
// }

// export function useTheme() {
//     const context = useContext(ThemeContext);
//     if (!context) {
//         throw new Error("useTheme must be used inside a ThemeProvider");
//     }
//     return context;
// }








import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "quire-theme";

function getIsDark(theme) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return theme === "dark" || (theme === "system" && prefersDark);
}

function applyTheme(theme) {
    const isDark = getIsDark(theme);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeProvider({ children }) {

    const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
    const [isDark, setIsDark] = useState(() => getIsDark(theme));

    useEffect(() => {
        applyTheme(theme);
        setIsDark(getIsDark(theme));

        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            applyTheme("system");
            setIsDark(getIsDark("system"));
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used inside a ThemeProvider");
    }
    return context; 
}