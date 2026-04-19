import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { SovereignProvider } from "./hooks/useSovereign";

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <SovereignProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </SovereignProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);

