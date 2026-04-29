import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";

console.log("Starting EduAI application...");

const root = document.getElementById("root");
console.log("Root element:", root);

if (!root) {
  throw new Error("Root element not found!");
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <App />
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </React.StrictMode>,
  );
  console.log("EduAI app rendered successfully");
} catch (err) {
  console.error("Failed to render app:", err);
  root.innerHTML = `<div style="color: red; padding: 20px;">Error rendering app: ${err instanceof Error ? err.message : String(err)}</div>`;
}
