import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CryptofiLanding } from "./screens/CryptofiLanding/CryptofiLanding";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <CryptofiLanding />
  </StrictMode>,
);
