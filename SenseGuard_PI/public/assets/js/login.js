/* Tela de login: animações de entrada, mostrar/ocultar senha e envio do formulário. */
import { enter, countUp, floatLoop, shake, EASE } from "./ui/motion.js";

/* ── Animações de entrada (sequência com sobreposição, como antes) ── */
let cursor = 0;
function step(target, options, overlap = 0) {
  const elements = typeof target === "string" ? [...document.querySelectorAll(target)] : [target];
  const start = Math.max(0, cursor - overlap);
  const gap = options.stagger || 0;

  elements.forEach((el, index) => enter(el, { ...options, delay: start + index * gap }));
  cursor = start + (elements.length - 1) * gap + options.duration;
}

const loginCard = document.getElementById("login_card");
step(loginCard, { x: 48, duration: 0.8 });
step(document.getElementById("brand_container"), { y: 24, duration: 0.6 }, 0.5);
step(document.getElementById("hero_eyebrow"), { y: 16, duration: 0.5 }, 0.4);
step(document.getElementById("hero_headline"), { y: 20, duration: 0.6 }, 0.35);
step(document.getElementById("hero_subline"), { y: 16, duration: 0.5 }, 0.4);
step(".feature-item", { y: 14, duration: 0.45, stagger: 0.1 }, 0.35);
step(document.getElementById("statistics_container"), { y: 18, duration: 0.55 }, 0.2);
step(document.getElementById("system_status_container"), { y: 10, duration: 0.4 }, 0.3);

floatLoop(document.getElementById("background_orb"), { x: 20, y: -40, duration: 6 });

/* ── Contadores das estatísticas ── */
document.querySelectorAll(".statistic-value").forEach((el) => {
  const target = Number.parseFloat(el.dataset.target);
  if (!Number.isFinite(target)) return;
  countUp(el, target, {
    duration: 1.4,
    delay: 1.2,
    decimals: String(target).includes(".") ? 1 : 0,
    suffix: el.dataset.suffix || "",
  });
});

/* ── Leve paralaxe do cartão com o mouse ── */
const loginPanel = document.querySelector(".login-panel");
if (loginPanel && loginCard && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  loginCard.style.transition = `transform 0.6s ${EASE.out}`;

  loginPanel.addEventListener("mousemove", (event) => {
    const rect = loginPanel.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    loginCard.style.transform = `perspective(900px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
  });

  loginPanel.addEventListener("mouseleave", () => {
    loginCard.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

/* ── Mostrar/ocultar senha ── */
const passwordInput = document.getElementById("password_input");
const toggleButton = document.getElementById("password_toggle_button");
const eyeIcon = document.getElementById("eye_icon");

const EYE_OPEN = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>`;
const EYE_OFF = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;

if (toggleButton && passwordInput && eyeIcon) {
  toggleButton.addEventListener("click", () => {
    const visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    eyeIcon.innerHTML = visible ? EYE_OPEN : EYE_OFF;
    enter(eyeIcon, { scale: 0.7, duration: 0.2, easing: EASE.back });
  });
}

/* ── Preenchimento rápido (aparece só em ambiente de desenvolvimento) ── */
document.querySelectorAll(".role-button").forEach((button) => {
  button.addEventListener("click", () => {
    const emailInput = document.getElementById("email_input");
    if (!emailInput || !button.dataset.email) return;
    emailInput.value = button.dataset.email;
    enter(emailInput, { scale: 0.97, opacity: 1, duration: 0.25, easing: EASE.back });
  });
});

/* ── Envio do formulário ── */
const loginForm = document.getElementById("login_form");
const submitButton = document.getElementById("submit_button");
const errorContainer = document.getElementById("error_message_container");
const errorText = document.getElementById("error_text");

function showError(message) {
  if (!errorText || !errorContainer) return;
  errorText.textContent = message;
  errorContainer.classList.add("show");
  enter(errorContainer, { y: -8, duration: 0.3 });
  shake(loginCard);
}

function hideError() {
  errorContainer?.classList.remove("show");
}

function setLoading(on) {
  if (!submitButton) return;
  submitButton.disabled = on;
  submitButton.classList.toggle("loading", on);
  const label = submitButton.querySelector(".submit-label");
  if (label) label.textContent = on ? "Autenticando…" : "Entrar";
}

/* Efeito "ripple" no botão. */
submitButton?.addEventListener("click", (event) => {
  const rect = submitButton.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX - rect.left - size / 2}px;top:${event.clientY - rect.top - size / 2}px`;
  submitButton.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
});

/** Só aceita redirecionar para a mesma origem; o padrão é o painel. */
function safeRedirect(target) {
  const fallback = "dashboard.php";
  if (typeof target !== "string" || target === "") return fallback;
  try {
    const url = new URL(target, window.location.href);
    return url.origin === window.location.origin ? url.href : fallback;
  } catch (error) {
    return fallback;
  }
}

const params = new URLSearchParams(window.location.search);
if (params.get("expired") === "1") showError("Sua sessão expirou. Entre novamente.");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const emailInput = document.getElementById("email_input");
  if (!emailInput || !passwordInput || !submitButton) {
    showError("O formulário de login não foi carregado corretamente. Atualize a página.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    showError("Informe o e-mail e a senha.");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch("login.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.success === true) {
      window.location.href = safeRedirect(data.redirect);
      return;
    }

    // Mensagens 4xx do servidor são feitas para o usuário (credenciais, limite de tentativas...).
    // Erros 5xx ficam genéricos para não expor detalhes internos.
    const userFacing = response.status >= 400 && response.status < 500 && typeof data?.error === "string";
    showError(userFacing ? data.error : "Não foi possível entrar. Tente novamente em instantes.");
  } catch (error) {
    showError("Não foi possível entrar. Verifique sua conexão e tente novamente.");
  } finally {
    setLoading(false);
  }
});
