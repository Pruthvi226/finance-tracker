import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type Mode = "light" | "dark";

type ThemeContextValue = {
  mode: Mode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);



export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return ctx;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem("theme-mode");
    return (saved as Mode) || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", mode);
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#3b82f6",
          },
          secondary: {
            main: "#22c55e",
          },
          error: {
            main: "#ef4444",
          },
          background: {
            default: mode === "dark" ? "#020617" : "#f4f4f5",
            paper: mode === "dark" ? "#020617" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode]
  );

  const value: ThemeContextValue = { mode, toggleMode };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

