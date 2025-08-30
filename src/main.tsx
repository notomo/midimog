import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./app.tsx";

const root = document.getElementById("root");
if (!root) {
  throw new Error("bug: not found root element");
}
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
