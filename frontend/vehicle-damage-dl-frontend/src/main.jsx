import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/tailwind.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { VehicleProvider } from "./context/VehicleContext"; // FIXED PATH
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <VehicleProvider>
        <App />
        <Toaster position="top-center" />
      </VehicleProvider>
    </BrowserRouter>
  </React.StrictMode>
);