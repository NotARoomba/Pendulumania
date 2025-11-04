import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import Simulation from "./pages/Simulation.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Simulation />
  </StrictMode>
);
