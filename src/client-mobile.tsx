import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { requestNativePermissions } from "./lib/native-permissions";
import { wireNativeNotificationTaps } from "./lib/native-reminders";
import "./styles.css";

const router = getRouter();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Ask for Android runtime permissions (notifications + location) once the
// WebView has booted. Safe no-op on web.
void requestNativePermissions().then(() => wireNativeNotificationTaps());
