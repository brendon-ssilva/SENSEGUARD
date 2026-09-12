/* ── GSAP Entrance Animations ── */
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

// Card flies in from the right
tl.from("#login_card", { x: 48, opacity: 0, duration: 0.8 })
  // Left panel — stagger from below
  .from("#brand_container", { y: 24, opacity: 0, duration: 0.6 }, "-=.5")
  .from("#hero_eyebrow", { y: 16, opacity: 0, duration: 0.5 }, "-=.4")
  .from("#hero_headline", { y: 20, opacity: 0, duration: 0.6 }, "-=.35")
  .from("#hero_subline", { y: 16, opacity: 0, duration: 0.5 }, "-=.4")
  .from(
    ".feature-item",
    { y: 14, opacity: 0, duration: 0.45, stagger: 0.1 },
    "-=.35",
  )
  .from("#statistics_container", { y: 18, opacity: 0, duration: 0.55 }, "-=.2")
  .from(
    "#system_status_container",
    { y: 10, opacity: 0, duration: 0.4 },
    "-=.3",
  );

// Orb slow float
gsap.to("#background_orb", {
  y: -40,
  x: 20,
  duration: 6,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

/* ── Animated Stat Counters ── */
document.querySelectorAll(".statistic-value").forEach((el) => {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix;
  const decimals = String(target).includes(".") ? 1 : 0;

  gsap.from(
    { val: 0 },
    {
      val: target,
      duration: 1.4,
      delay: 1.2,
      ease: "power2.out",
      onUpdate() {
        el.textContent = this.targets()[0].val.toFixed(decimals) + suffix;
      },
    },
  );
});

/* ── Card Subtle Mouse Parallax ── */
const loginCard = document.getElementById("login_card");
document.querySelector(".login-panel").addEventListener("mousemove", (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / rect.width;
  const dy = (e.clientY - cy) / rect.height;
  gsap.to(loginCard, {
    rotateY: dx * 4,
    rotateX: -dy * 4,
    duration: 0.6,
    ease: "power2.out",
    transformPerspective: 900,
  });
});

document.querySelector(".login-panel").addEventListener("mouseleave", () => {
  gsap.to(loginCard, {
    rotateY: 0,
    rotateX: 0,
    duration: 0.8,
    ease: "elastic.out(1,.6)",
  });
});

/* ── Toggle Password Visibility ── */
const pwInput = document.getElementById("password_input");
const togglePwBtn = document.getElementById("password_toggle_button");
const eyeIcon = document.getElementById("eye_icon");

const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>`;
const eyeOff = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;

togglePwBtn.addEventListener("click", () => {
  const visible = pwInput.type === "text";
  pwInput.type = visible ? "password" : "text";
  eyeIcon.innerHTML = visible ? eyeOpen : eyeOff;
  gsap.from(eyeIcon, {
    scale: 0.7,
    opacity: 0,
    duration: 0.2,
    ease: "back.out(2)",
  });
});

/* ── Role Quick-Fill ── */
document.querySelectorAll(".role-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const emailInput = document.getElementById("email_input");
    emailInput.value = btn.dataset.email;

    // Preenche a senha automaticamente para agilizar o teste
    if (btn.dataset.email === "administrador@industria.com") {
      pwInput.value = "admin123";
    } else {
      pwInput.value = "123456";
    }

    gsap.from(emailInput, {
      scale: 0.97,
      duration: 0.25,
      ease: "back.out(2)",
    });
  });
});

/* ── Form Submission ── */
const loginForm = document.getElementById("login_form");
const submitBtn = document.getElementById("submit_button");
const errorContainer = document.getElementById("error_message_container");
const errorText = document.getElementById("error_text");

function showError(msg) {
  errorText.textContent = msg;
  errorContainer.classList.add("show");
  gsap.from(errorContainer, {
    y: -8,
    opacity: 0,
    duration: 0.3,
    ease: "power2.out",
  });
  gsap.to(loginCard, {
    x: -6,
    duration: 0.06,
    repeat: 5,
    yoyo: true,
    ease: "none",
    onComplete() {
      gsap.set(loginCard, { x: 0 });
    },
  });
}

function hideError() {
  errorContainer.classList.remove("show");
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle("loading", on);
  submitBtn.querySelector(".submit-label").textContent = on
    ? "Autenticando…"
    : "Entrar";
}

/* Ripple on Button Click */
submitBtn.addEventListener("click", function (e) {
  const rect = this.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  this.appendChild(r);
  r.addEventListener("animationend", () => r.remove());
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hideError();

  const emailVal = document.getElementById("email_input").value.trim();
  const pwVal = pwInput.value;

  if (!emailVal || !pwVal) {
    showError("Preencha todos os campos.");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    setLoading(false);

    // Validação de autenticação
    if (emailVal === "administrador@industria.com" && pwVal === "admin123") {
      localStorage.setItem("user_authenticated", "true");
      localStorage.setItem("user_role", "admin");
      window.location.href = "homepage.html";
    } else {
      // Libera o acesso direto para qualquer credencial em caso de teste rápido
      localStorage.setItem("user_authenticated", "true");
      window.location.href = "homepage.html";
    }
  }, 800);
});
