/* Aplica o tema salvo antes da primeira pintura (evita "flash" do tema errado).
   Script clássico e síncrono de propósito: precisa rodar antes do CSS ser aplicado. */
(function () {
  try {
    var saved = window.localStorage.getItem("senseguard.theme");
    var theme = saved === "light" || saved === "dark" || saved === "system" ? saved : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  } catch (error) {
    /* localStorage indisponível: mantém o tema padrão. */
  }
})();
