/* View Configurações: perfil, segurança, aparência e preferências. */
import { state } from "../state.js";
import { h } from "../utils/dom.js";
import { apiFetch } from "../api.js";
import { renderCurrentUser } from "../session.js";

const THEME_KEY = "senseguard.theme";
const EMAIL_NOTIFICATIONS_KEY = "senseguard.emailNotifications";
const DEFAULT_THEME = "dark";

const storage = {
  get(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      showNotice("Não foi possível salvar esta preferência neste navegador.", "error");
    }
  },
};

function applyTheme(theme) {
  const allowed = ["light", "dark", "system"];
  const selected = allowed.includes(theme) ? theme : DEFAULT_THEME;
  document.documentElement.setAttribute("data-theme", selected);
  document.documentElement.style.colorScheme = selected === "system" ? "light dark" : selected;
  return selected;
}

function showNotice(message, type = "success") {
  const notice = document.getElementById("settings_feedback");
  if (!notice) return;
  notice.textContent = message;
  notice.className = `settings-feedback is-visible ${type}`;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    notice.classList.remove("is-visible");
  }, 4200);
}

function securityModal(action) {
  const isEmail = action === "email";
  const title = isEmail ? "Alteração de e-mail" : "Alteração de senha";
  const description = isEmail
    ? "Para trocar o endereço de e-mail, será necessário confirmar sua identidade por uma etapa adicional de segurança (2FA)."
    : "Para trocar a senha, será necessário confirmar sua identidade por uma etapa adicional de segurança (2FA).";

  const overlay = document.createElement("div");
  overlay.className = "settings-modal-backdrop";
  overlay.innerHTML = `
    <section class="settings-security-modal" role="dialog" aria-modal="true" aria-labelledby="settings-security-title">
      <div class="settings-modal-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/><path d="M12 14v3"/></svg>
      </div>
      <h3 id="settings-security-title">${title}</h3>
      <p>${description}</p>
      <div class="settings-security-note">Nenhuma alteração será aplicada nesta tela. A atualização só poderá ser concluída depois que o fluxo de verificação em duas etapas estiver disponível e for validado pelo servidor.</div>
      <div class="settings-modal-actions">
        <button type="button" class="settings-button secondary" data-close-security>Voltar</button>
        <button type="button" class="settings-button primary" data-close-security>Entendi</button>
      </div>
    </section>`;

  document.body.appendChild(overlay);
  const closeButtons = overlay.querySelectorAll("[data-close-security]");
  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    overlay.remove();
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") close();
  };
  closeButtons.forEach((button) => button.addEventListener("click", close));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", onKeydown);
  closeButtons[0]?.focus();
}

function buildHtml(user) {

  const name = typeof user?.name === "string" ? user.name : "";
  const email = typeof user?.email === "string" ? user.email : "";
  const theme = applyTheme(storage.get(THEME_KEY, DEFAULT_THEME));
  const emailNotifications = storage.get(EMAIL_NOTIFICATIONS_KEY, "true") !== "false";

  return `
    <div class="view-wrapper settings-view">
      <div class="section-page-header settings-page-header">
        <div>
          <div class="section-page-title">Configurações</div>
          <div class="section-page-subtitle">Gerencie suas informações e preferências do sistema.</div>
        </div>
      </div>

      <div id="settings_feedback" class="settings-feedback" role="status" aria-live="polite"></div>

      <div class="settings-grid">
        <section class="settings-card" aria-labelledby="settings-profile-heading">
          <header class="settings-card-header">
            <div class="settings-card-icon profile" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
            </div>
            <div><h2 id="settings-profile-heading">Perfil</h2><p>Atualize seu nome de exibição.</p></div>
          </header>
          <form id="settings-profile-form" class="settings-form" novalidate>
            <label class="settings-label" for="settings-name">Nome</label>
            <input class="settings-input" id="settings-name" name="name" type="text" value="${h(name)}" maxlength="100" autocomplete="name" required>
            <div class="settings-form-footer">
              <span class="settings-helper">Até 100 caracteres.</span>
              <button class="settings-button primary" id="settings-save-profile" type="submit">Salvar alterações</button>
            </div>
          </form>
        </section>

        <section class="settings-card" aria-labelledby="settings-security-heading">
          <header class="settings-card-header">
            <div class="settings-card-icon security" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            </div>
            <div><h2 id="settings-security-heading">Segurança</h2><p>E-mail e senha da sua conta.</p></div>
          </header>
          <div class="settings-security-row">
            <div class="settings-security-info"><span class="settings-label">E-mail cadastrado</span><strong>${h(email || "Não disponível")}</strong></div>
            <button type="button" class="settings-button secondary" data-security-action="email">Alterar e-mail</button>
          </div>
          <div class="settings-security-row">
            <div class="settings-security-info"><span class="settings-label">Senha</span><strong class="settings-password-mask" aria-label="Senha cadastrada">••••••••••••</strong></div>
            <button type="button" class="settings-button secondary" data-security-action="password">Alterar senha</button>
          </div>
          <p class="settings-helper settings-security-helper">Alterações de credenciais exigem confirmação de segurança em duas etapas.</p>
        </section>

        <section class="settings-card" aria-labelledby="settings-appearance-heading">
          <header class="settings-card-header">
            <div class="settings-card-icon appearance" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18Z"/></svg>
            </div>
            <div><h2 id="settings-appearance-heading">Aparência</h2><p>Escolha como o SenseGuard será exibido.</p></div>
          </header>
          <label class="settings-label" for="settings-theme">Tema do site</label>
          <select class="settings-input" id="settings-theme" name="theme">
            <option value="dark" ${theme === "dark" ? "selected" : ""}>Escuro</option>
            <option value="light" ${theme === "light" ? "selected" : ""}>Claro</option>
            <option value="system" ${theme === "system" ? "selected" : ""}>Padrão do sistema</option>
          </select>
        </section>

        <section class="settings-card" aria-labelledby="settings-general-heading">
          <header class="settings-card-header">
            <div class="settings-card-icon general" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
            </div>
            <div><h2 id="settings-general-heading">Geral</h2><p>Defina suas preferências de comunicação.</p></div>
          </header>
          <label class="settings-toggle-row" for="settings-email-notifications">
            <span><strong>Receber notificações por e-mail</strong><small>Permite o envio de avisos importantes da plataforma.</small></span>
            <input id="settings-email-notifications" type="checkbox" ${emailNotifications ? "checked" : ""}>
            <span class="settings-toggle" aria-hidden="true"></span>
          </label>
        </section>
      </div>
    </div>`;

}

function bindEvents() {
  const form = document.getElementById("settings-profile-form");
  const themeSelect = document.getElementById("settings-theme");
  const notificationsToggle = document.getElementById("settings-email-notifications");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.getElementById("settings-name");
    const button = document.getElementById("settings-save-profile");
    const name = input?.value.trim() || "";

    if (!name || name.length > 100) {
      showNotice("Informe um nome entre 1 e 100 caracteres.", "error");
      input?.focus();
      return;
    }

    button.disabled = true;
    button.textContent = "Salvando...";
    try {
      const updatedUser = await apiFetch("api.php?entity=me", { method: "PUT", body: { name } });
      renderCurrentUser(updatedUser);
      const currentInput = document.getElementById("settings-name");
      if (currentInput) currentInput.value = updatedUser.name || name;
      showNotice("Nome atualizado com sucesso.");
    } catch (error) {
      showNotice(error?.message || "Não foi possível atualizar seu nome.", "error");
    } finally {
      const currentButton = document.getElementById("settings-save-profile");
      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent = "Salvar alterações";
      }
    }
  });

  themeSelect?.addEventListener("change", () => {
    const selected = applyTheme(themeSelect.value);
    storage.set(THEME_KEY, selected);
    showNotice("Tema atualizado.");
  });

  notificationsToggle?.addEventListener("change", () => {
    storage.set(EMAIL_NOTIFICATIONS_KEY, notificationsToggle.checked ? "true" : "false");
    showNotice("Preferência de notificações atualizada.");
  });

  document.querySelectorAll("[data-security-action]").forEach((button) => {
    button.addEventListener("click", () => securityModal(button.dataset.securityAction));
  });
}

export function renderSettings() {
  return { html: buildHtml(state.currentUser), after: bindEvents };
}
