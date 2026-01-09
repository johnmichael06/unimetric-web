import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Imports
import { Analytics } from "@vercel/analytics/react";
import BrowserGuard from "./components/BrowserGuard"; // <--- Import the Guard

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap the App inside the BrowserGuard */}
    <BrowserGuard>
      <App />
    </BrowserGuard>

    <Analytics />
  </React.StrictMode>
);
