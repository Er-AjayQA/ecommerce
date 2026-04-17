import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemesProvider } from "./context/themesContext";
import { LayoutsProvider } from "./context/layoutsContext";
import { TemplatesProvider } from "./context/templatesContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemesProvider>
      <LayoutsProvider>
        <TemplatesProvider>
          <App />
        </TemplatesProvider>
      </LayoutsProvider>
    </ThemesProvider>
  </React.StrictMode>,
);
