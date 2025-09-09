import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GalleryProvider } from "./contexts/GalleryContext";
import "./index.css";

// Register service worker for caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // Service worker registered successfully
      })
      .catch(() => {
        // Service worker registration failed
      });
  });
}

createRoot(document.getElementById("root")!).render(
  // Temporarily disable StrictMode to test if it's causing re-mounts
  // <StrictMode>
  <GalleryProvider>
    <App />
  </GalleryProvider>
  // </StrictMode>
);
