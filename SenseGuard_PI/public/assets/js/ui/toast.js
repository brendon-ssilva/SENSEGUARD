/* Notificações não bloqueantes (substituem alert()). */

const TIMEOUT_MS = 4500;

/** @param {"success"|"error"|"info"} type */
export function toast(message, type = "info") {
  const region = document.getElementById("toast_region");
  if (!region) return;

  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.setAttribute("role", type === "error" ? "alert" : "status");
  item.textContent = message; // textContent: nunca interpreta HTML.
  region.appendChild(item);

  window.setTimeout(() => item.remove(), TIMEOUT_MS);
}

export const toastError = (message) => toast(message, "error");
export const toastSuccess = (message) => toast(message, "success");
