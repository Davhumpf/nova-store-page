// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/ToastProvider"; // ← nuevo
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <UserProvider>
        <CartProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CartProvider>
      </UserProvider>
    </Router>
  </React.StrictMode>
);
