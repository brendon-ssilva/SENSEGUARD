/* Usuário logado: cabeçalho do perfil e encerramento de sessão. */
import { state } from "./state.js";
import { apiFetch } from "./api.js";
import { avatarInitials } from "./utils/format.js";
import { USER_ROLE } from "./constants.js";
import { renderChrome, renderView } from "./view-host.js";
import { toastError } from "./ui/toast.js";

export function renderCurrentUser(user) {
  const badge = document.querySelector(".user-profile-badge");
  if (!badge) return;

  const name = typeof user?.name === "string" ? user.name.trim() : "";
  const role = typeof user?.role === "string" ? user.role.trim().toLowerCase() : "";
  state.currentUser = user && typeof user === "object" ? { ...user } : null;
  state.currentUserRole = role;

  const avatar = badge.querySelector(".user-avatar");
  const nameEl = badge.querySelector(".user-name");
  const roleEl = badge.querySelector(".user-role");
  if (avatar) avatar.textContent = avatarInitials(name) || "?";
  if (nameEl) nameEl.textContent = name || "Usuário";
  if (roleEl) roleEl.textContent = USER_ROLE[role]?.label || role || "Perfil indisponível";
  if (user?.email) badge.title = user.email;

  renderChrome();
  if (state.dataLoaded) renderView();
}

export function showProfileError(error) {
  renderCurrentUser(null);
  const roleEl = document.querySelector(".user-profile-badge .user-role");
  if (roleEl) {
    roleEl.textContent = /sessão|login|autenticad|401/i.test(error.message)
      ? "Sessão expirada — entre novamente"
      : "Falha ao carregar perfil";
  }
}

export async function logout({ el } = {}) {
  const button = el || document.getElementById("profile_logout_button");
  if (button) {
    button.disabled = true;
    button.textContent = "Saindo...";
  }

  try {
    const result = await apiFetch("logout.php", { method: "POST", body: "{}", redirect: "error" });
    if (result.success !== true) throw new Error(result.message || "Não foi possível encerrar a sessão.");

    // replace(): o botão Voltar não reabre o painel a partir do histórico.
    window.location.replace("index.php?logout=1");
  } catch (error) {
    console.error("Erro ao fazer logoff:", error);
    if (button) {
      button.disabled = false;
      button.textContent = "↪ Sair";
    }
    toastError(error.message || "Não foi possível sair. Verifique a conexão e tente novamente.");
  }
}
