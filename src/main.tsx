import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Kill any loading overlay synchronously — before the first React paint
(function () {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.remove();
  document.body.style.overflow = "auto";
})();

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
