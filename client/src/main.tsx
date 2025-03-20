import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure window.ethereum gets recognized as a provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
